import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React from 'react';
import HomeCard from './HomeCard';
import axios from 'axios';
import keys from './keys.json';

const containerStyle = {
    width: '100%',
    height: '100%'
  };
  
  const center = {
    lat: 32,
    lng: 10
  };
  
  function GMap() {
    const [map, setMap] = React.useState(null);

    const { isLoaded } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: keys.googleMapsApiKey
    });

    async function showError(err){
      alert(err);
      //TODO: tidy
    }

    async function getPolygon(input_id, querystring){

      if(!querystring?.length) return showError('No querystring');

      querystring = querystring.toLowerCase();

      const geo_url = `https://nominatim.openstreetmap.org/search?city=${querystring}&format=jsonv2&polygon_geojson=1`
      
      const geo_res = await axios.get(geo_url).catch(err => console.log(err));

      //filter out geodata that isn't a polygon
      let geojson, coord;
      for(const place of geo_res.data){
        if( !(place?.geojson?.type.includes('Polygon') && ['city'].includes(place?.addresstype)) ) continue;
        geojson = place.geojson;
        coord = {lat: place.lat*1, lng:place.lon*1};
        break;
      }
      if(! (geojson && coord) ){
        geojson = geo_res?.data[0]?.geojson;
        coord = {lat: geo_res.data[0]?.lat*1, lng:geo_res.data[0]?.lon*1}
      }
      if(! (geojson && coord) ) return showError('No city data.');

      console.log({geo_res})
      window.citySizes.centroids[input_id] = coord;
      placePolygon(input_id, geojson);

      if(input_id === 1) {//cache 2nd input geodata
        window.citySizes.geojson_1.feature = geojson;
        window.citySizes.geojson_1.centroid = coord;
      } 

      if( window.citySizes.features[0] && (input_id === 0) && window.citySizes?.geojson_1.feature ){ //if 1st input changed, shift 2nd feature over
        console.log('replacing 1st');
        placePolygon(1, window.citySizes.geojson_1.feature, 1);
      }

      if(input_id === 0) {
        window.citySizes.geojson_0.feature = geojson;
        window.citySizes.geojson_0.centroid = coord;//cache 1st input geodata
      }
      
      map.data.forEach(feature => {});
    }

    function placePolygon(input_id, geojson, isReplacingSecond=false){
      if( (input_id === 1) || isReplacingSecond ) {
        const translation_vector = getTranslationVector(isReplacingSecond);
        geojson.coordinates = translateCoords(geojson.coordinates, translation_vector);
        if(geojson.coordinates.length > 1) geojson.type = "MultiPolygon";
      }

      const geoObj = makeGeoObj(input_id, geojson);
      const feature = map.data.addGeoJson(geoObj);

      const previous_feature = window.citySizes.features[input_id];
      if( previous_feature ) map.data.remove(previous_feature[0]);

      window.citySizes.features[input_id] = feature;

      map.data.setStyle((feature) => {
        let color = 'gray';
        color = feature.getProperty('color');
        return ({
          fillColor: color,
          strokeColor: color,
          strokeWeight: 2
        });
      });

      const bounds = new window.google.maps.LatLngBounds(window.citySizes.centroids[0]);
      map.fitBounds(bounds);
      map.setZoom(10);
    }

    function getTranslationVector(isReplacingSecond){
      const centroidA = window.citySizes.centroids[0];
      const centroidB = isReplacingSecond ? window.citySizes.geojson_0.centroid : window.citySizes.centroids[1];
      if(!(centroidA && centroidB) || isNaN(centroidA.lat + centroidB.lng)) return showError('No centroids');
      return {x: (centroidA.lat - centroidB.lat), y: (centroidA.lng - centroidB.lng)};
    }

    function translateCoords(pointsA, translation_vector){
      const results = [];
      for(let zone of pointsA){
        const newPoints = [];
        if(pointsA.length > 1 && pointsA[0].length === 1) zone = zone[0]; // multipolygon support
        for(const point of zone){
          const newPoint = [];
          newPoint.push(point[0] + translation_vector.y);
          newPoint.push(point[1] + translation_vector.x);
          newPoints.push(newPoint);
        }
        if(pointsA.length === 1) results.push(newPoints); 
        else results.push([newPoints]); // multipolygon support
      }
      return results;
    }

    function makeGeoObj(input_id, geojson){

      const color = input_id === 0 ? 'green' : 'red';

      return {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {color},
            "geometry":geojson
          }
        ]
      };
    };

    const onLoad = React.useCallback(function callback(map) {
      setMap(map);
      console.log({map});

      //setting map tint
      let bounds = new window.google.maps.LatLngBounds(
        {lat: -84.999999,lng:-179.999999},{lat: 84.999999,lng:179.999999})

      new window.google.maps.Rectangle({
          bounds: bounds,
          fillColor: "black",
          fillOpacity: 0.2,
          strokeWeight: 0,
          map: map
      });

    }, []);
  
    const onUnmount = React.useCallback(function callback(map) {

    }, []);
  
    return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2.5}
        onUnmount={onUnmount}
        onLoad={onLoad}
        options={{
          streetViewControl: false, 
          fullscreenControl:false, 
          mapTypeControlOptions:{position:window.google.maps.ControlPosition.RIGHT_TOP}
        }}
      >
        <HomeCard getPolygon={getPolygon}></HomeCard>
      </GoogleMap>
    ) : <></>
  }
  
  export default React.memo(GMap)