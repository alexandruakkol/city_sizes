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

    async function getPolygon(querystring){

      if(!querystring?.length) return showError('No querystring');

      querystring = querystring.toLowerCase();

      const geo_url = `https://nominatim.openstreetmap.org/search?city=${querystring}&format=jsonv2&polygon_geojson=1`
      
      const geo_res = await axios.get(geo_url).catch(err => console.log(err));

      const geojson = geo_res.data[0].geojson;
      const obj = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "letter": "G",
              "color": "blue",
              "rank": "7",
              "ascii": "71"
            },
            "geometry":geojson
          }
        ]
      };
      
      map.data.addGeoJson(obj);
      const coord = {lat: geo_res.data[0].lat*1, lng:geo_res.data[0].lon*1};
      console.log({coord}, {geojson})
      const bounds = new window.google.maps.LatLngBounds(coord);
      map.fitBounds(bounds);
      map.setZoom(10);
      

      map.data.setStyle({
        fillColor: 'green'
      });
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