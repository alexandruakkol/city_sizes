'use client'
import { GoogleMap, Polygon, useJsApiLoader } from '@react-google-maps/api';
import React, {useEffect} from 'react';
import HomeCard from './HomeCard';
import axios from 'axios';
import { Alert, rem } from '@mantine/core';
import { IconX } from '@tabler/icons-react';


const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 32,
  lng: 10
};
  
  function GMap(props) {

    useEffect(() => {
      if (typeof window !== 'undefined') {
        // Client-side only code
        
        if(!window.citySizes) 
          window.citySizes = {
            centroids:{},
            features:{},
            geojson_0:{},
            geojson_1:{}
          };
      }
    }, []);

    useEffect(() => {
      if(!props.polygon.value) return;
      getPolygon(props.polygon.input_id, props.polygon.value);
    }, [props.polygon]);

    const [map, setMap] = React.useState(null);
    const [error, setError] = React.useState({});
    const [isErrorShown, setIsErrorShown] = React.useState(false);

    const { isLoaded } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: process.env.maps_key
    });

    async function showClientError(err, isFatal=false){
      if(isFatal){
        setError({title:'Error', text:`Something went wrong. Code: ${err}`});
      } else {
        setError({title:'No city data', text:`Data for city ${err} is not available.`});
      }
      displayError();
    }

    function displayError(){
      setIsErrorShown(true);
      setTimeout(() => {setIsErrorShown(false)}, 8000);
    }

    async function getPolygon(input_id, querystring){

      if(!querystring?.length) return showClientError('No querystring', true);

      const lower_querystring = querystring.toLowerCase();

      const geo_url = `https://nominatim.openstreetmap.org/search?city=${lower_querystring}&format=jsonv2&polygon_geojson=1`
      
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
      
      if( !( coord && geojson?.coordinates?.length )) 
        return showClientError(querystring, true);

      if( geojson?.type === 'Point' ) showClientError(querystring);
        
      window.citySizes.centroids[input_id] = coord;
      placePolygon(input_id, geojson);

      if(input_id === 1) {//cache 2nd input geodata
        window.citySizes.geojson_1.feature = geojson;
        window.citySizes.geojson_1.centroid = coord;
      } 

      if( window.citySizes.features[0] && (input_id === 0) && window.citySizes?.geojson_1.feature ){ //if 1st input changed, shift 2nd feature over
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
      if(!(centroidA && centroidB) || isNaN(centroidA.lat + centroidB.lng)) return showClientError('No centroids', true);
      return {x: (centroidA.lat - centroidB.lat), y: (centroidA.lng - centroidB.lng)};
    }

    function translateCoords(pointsA, translation_vector){
      const results = [];

      for(let zone of pointsA){
        let newPoints = [];
        if(pointsA.length > 1 && pointsA[0].length === 1) zone = zone[0]; // multipolygon support
        runCoords(zone);

        if(pointsA.length === 1) results.push(newPoints); 
        else results.push([newPoints]); // multipolygon support

        function runCoords(zone){
          if( !Array.isArray(zone) ) return; 
          for(const point of zone){
            const newPoint = [];

            if(typeof point[0] === 'object') // multipolygon^2 support
              return runCoords(point);
  
            newPoint.push(point[0] + translation_vector.y);
            newPoint.push(point[1] + translation_vector.x);
            
            newPoints.push(newPoint)
          }
        } //end runCoords
      } //end zone for
      
      return results;
    }

    function makeGeoObj(input_id, geojson){

      const color = input_id === 0 ? 'green' : 'red';
      const geoObj = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {color},
            "geometry":geojson
          }
        ]
      };
      return geoObj;
    };

    const onLoad = React.useCallback(function callback(map) {
      setMap(map);

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

  const xIcon = <IconX style={{ width: rem(20), height: rem(20) }} />;

  
    return isLoaded ? (
      <>
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
          <div id='alert-div'>
            {isErrorShown ? <Alert icon={xIcon} color="red" title={error.title}>
              {error.text}
            </Alert> : <></>}
          </div>
          {/* <HomeCard getPolygon={getPolygon}></HomeCard> */}
          <div id="custom-attribution">
            Map data: 
            ©2024 <a target="_blank" href="https://www.google.com/intl/en-US_US/help/terms_maps/">Google</a>,
            Boundaries data: <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>. Contact: support@citysizes.com
          </div>
        </GoogleMap>
      </>
    ) : <></>
  }
  
  export default React.memo(GMap)