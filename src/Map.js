import React, { useState, useEffect }  from 'react'
import { GoogleMap, useJsApiLoader, HeatmapLayer } from '@react-google-maps/api'

const containerStyle = {
  width: '800px',
  height: '400px'
};

const center = {
  lat: 33.776,
  lng: -84.403
};



function Map(props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBrYFmZgplNQEt8brrqgAzVdfv4yNQD208",
    libraries: ["visualization"]
    // ...otherOptions
  })

  const [a, setA] = useState(false)
  

  const onLoad = heatmapLayer => {
    console.log('HeatmapLayer onLoad heatmapLayer: ', heatmapLayer)
    setA(true)
  }

  const onUnmount = heatmapLayer => {
    console.log('HeatmapLayer onUnmount heatmapLayer: ', heatmapLayer)
  }

  const renderMap = () => {
    // wrapping to a function is useful in case you want to access `window.google`
    // to eg. setup options or create latLng object, it won't be available otherwise
    // feel free to render directly if you don't need that
    // const onLoad = React.useCallback(
    //   function onLoad (mapInstance) {
    //     // do something with map Instance
    //   }
    // 
    let data = [
      new window.google.maps.LatLng(37.782, -122.447),
    ]
    if (props.locData) {
      data = []
      let i = 0
      while (i < props.locData.length) {
        
        data.push(new window.google.maps.LatLng(props.locData[i].lat, props.locData[i].lng))
        i += 1;
      }
     ;  
    }
    return <GoogleMap
      // options={options}
      // onLoad={onLoad}
      
      mapContainerStyle={containerStyle}
          center={center}
          zoom={17}
    >
       <HeatmapLayer
      // optional
      // required
      options={{radius: 7}}
      onUnmount={onUnmount}
      onLoad={onLoad}
      data={data}
    />
    </GoogleMap>
  }

  if (loadError) {
    return <div>Map cannot be loaded right now, sorry.</div>
  }

  return isLoaded ? renderMap() : <p />
}


export default React.memo(Map)