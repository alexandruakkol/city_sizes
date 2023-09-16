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

      const geojson = geo_res.data[0].geojson;
      console.log(`geojson${input_id} ${querystring}`, geojson.coordinates)

      const centroid = getCentroidCoords(geojson.coordinates[0]);
      window.citySizes.centroids[input_id] = centroid;
      
      if(input_id === 1) {
        const translation_vector = getTranslationVector();
        console.log({translation_vector})
        geojson.coordinates[0] = translateCoords(geojson.coordinates[0], translation_vector);
      }
      
      const color = input_id === 0 ? 'darkgreen' : 'red';
      const obj = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {color},
            "geometry":geojson
          }
        ]
      };

      map.data.addGeoJson(obj);

      map.data.setStyle((feature) => {
        let color = 'gray';
        color = feature.getProperty('color');
        return ({
          fillColor: color,
          strokeColor: color,
          strokeWeight: 2
        });
      });
      
      if(input_id === 1) return;
      const coord = {lat: geo_res.data[0].lat*1, lng:geo_res.data[0].lon*1};

      const bounds = new window.google.maps.LatLngBounds(coord);
      map.fitBounds(bounds);
      map.setZoom(10);

    }

    function getCentroidCoords(points){
      const coords = {x:0, y:0};
      for(const point of points){
        coords.x += point[1];
        coords.y += point[0];
      }
      const points_n = points.length;
      coords.x = Number((coords.x/points_n).toFixed(6));
      coords.y = Number((coords.y/points_n).toFixed(6));
      return coords;
    }

    function getTranslationVector(){
      const centroidA = window.citySizes.centroids[0];
      const centroidB = window.citySizes.centroids[1];
      if(!(centroidA && centroidB)) return showError('No centroids');
      return {x: (centroidA.x - centroidB.x), y: (centroidA.y - centroidB.y)}
    }

    function translateCoords(pointsA, translation_vector){
      const newPoints = [];
      for(const point of pointsA){
        const newPoint = [];
        newPoint.push(point[0] + translation_vector.y);
        newPoint.push(point[1] + translation_vector.x);
        newPoints.push(newPoint);
      }
      return newPoints;
    }

    function renderShape(x,y){

    }

    const onLoad = React.useCallback(function callback(map) {
      setMap(map);
    }, []);
  
    const onUnmount = React.useCallback(function callback(map) {
      //setMap(null);
    }, []);
  
    return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2}
        onUnmount={onUnmount}
        onLoad={onLoad}
      >
        <HomeCard getPolygon={getPolygon}></HomeCard>
      </GoogleMap>
    ) : <></>
  }
  
  export default React.memo(GMap)