  
import './App.css';
import React, { useState, useEffect } from 'react';
import Chart from "react-apexcharts";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import Map from './Map';

function distance(lat1,lat2, lon1, lon2)
{

// The math module contains a function
// named toRadians which converts from
// degrees to radians.
lon1 =  lon1 * Math.PI / 180;
lon2 = lon2 * Math.PI / 180;
lat1 = lat1 * Math.PI / 180;
lat2 = lat2 * Math.PI / 180;


// Haversine formula
let dlon = lon2 - lon1;
let dlat = lat2 - lat1;
let a = Math.pow(Math.sin(dlat / 2), 2)
+ Math.cos(lat1) * Math.cos(lat2)
* Math.pow(Math.sin(dlon / 2),2);

let c = 2 * Math.asin(Math.sqrt(a));

// Radius of earth in kilometers. Use 3956
// for miles
let r = 6371000;
// calculate the result
return(c * r);
}


function adjustTime(value) {
  if (value < 60) {
    return value + " s";
  } else if (value < 3600) {
    return parseInt(value / 60) + " min"
  } else {
    return parseInt(value / 3600) + " h"
  }
}


function App() {
  const [dataset, setDataset] = useState([]);

  
  
  useEffect(() => {
    const interval = setInterval(() => {
      getData();
    }, 1000);
  }, []);

  setInterval(getData, 1000)  

  function callback(data) {
    data.sort((a, b) => (a.date) - (b.date));
    setDataset(data); 
  }

  let location = []
  for (let i = 0; i < dataset.length; i++){
    if (dataset[i].Latitude & dataset[i].Latitude != 0  ){
      location.push({lat: parseFloat(dataset[i].Latitude), lng: parseFloat(dataset[i].Longitude)})
    }
  }
  function getData() {
    var x = new XMLHttpRequest();
    x.open("GET", "https://trackerbucketest.s3.amazonaws.com/", true);
    x.setRequestHeader("Content-Type", "application/xml");
    x.onreadystatechange = function () {
        if (x.readyState == 4 && x.status == 200) {
            let promiseArr = [];
            let data = [];
            var doc = x.responseXML;
            let keys = doc.getElementsByTagName("Key");
            let dates = doc.getElementsByTagName("LastModified");
            let index = 0;
            createDataSet(index);
            
    
            async function createDataSet(index) {
                if (index >= keys.length) {
                    callback(data)
                    return false
                }
                let element = keys[index];
                element = element.textContent;
    
                let splitName = element.split('/');
                if (splitName[0] === 'TrackerFolder' && splitName[1] !== '') {
                    promiseArr.push(new Promise((resolve, reject) => {
                        var innerReq = new XMLHttpRequest();
                        innerReq.open("GET", "https://trackerbucketest.s3.amazonaws.com/" + splitName[0] + "/" + splitName[1], true);
                        // innerReq.setRequestHeader("Content-Type", "application/xml");
                        innerReq.onreadystatechange = function () {
                            if (innerReq.readyState === 4 && innerReq.status === 200) {
                                let parseData = JSON.parse(innerReq.responseText);
                                parseData.date = Date.parse(dates[index].textContent)
                                if (parseData.velocity) { //velocity
                                    data.push(Object.assign({}, parseData, { timestamp: splitName[1] }));
                                }
                                resolve('Done')
                                index++;
                                createDataSet(index);
                            } else {
                                // reject(innerReq)
                            }
                        }
                        innerReq.send(null);
                    }));
                } else {
                    index++;
                    createDataSet(index);
                }
            }
          }
        }
        x.send();
      }

let dates= [], beatA = [], vel = []
let lastLat = 0, lastLon = 0, lastDate = 0
for (let i = 0; i < dataset.length; i++){
  if (dataset[i].Latitude  & dataset[i].Latitude != 0 ){
    dates.push(dataset[i].date)
    if(i == 0){
      vel[i] = 0
    } else {
      vel[i] = distance(dataset[i].Latitude, lastLat,dataset[i].Longitude, lastLon)/((dataset[i].date - lastDate)/1000)
    }
    
    lastLat = dataset[i].Latitude;
    lastLon = dataset[i].Longitude;
    lastDate = dataset[i].date
  }
  if (dataset[i].beatAvg > 30) {
    beatA.push({x: dataset[i].date, y: dataset[i].beatAvg})
  }
}

  const beatAv = {
    options: {
      chart: {
        id: "basic-line"
      },
      xaxis: {
        labels: {show:false}
      },
      tooltip: {
        enabled: true,
        theme: "dark",
        y: {show: true,
          title: {
          formatter: (seriesName) => seriesName,
          },
        }
      },
      title :{
        text: "Average heart beat",
        align: "center"
      }
    },
    series: [
      {
        name: "beat AVG",
        data: beatA
      }
    ]
  };



  const veloc = {
    options: {
      chart: {
        id: "basic-line"
      },
      xaxis: {
        labels: {show: false},
      },
      yaxis: {
        decimalsInFloat: 1,
      },
      tooltip: {
        enabled: true,
        theme: "dark",
        y: {show: true,
          title: {
          formatter: (seriesName) => seriesName,
          },
        }
      },
      title :{
        text: "Player Velocity (m/s)",
        align: "center"
      }
    },
    series: [
      {
        name: "Velocity",
        data: vel
      }
    ]
  };




  return (
    <div className="App">
      <header className="App-header">
        <div style={{display: "flex", flexDirection:"row"}}>
          <div style={{display: "flex", borderRadius: "10px", height:"100px", width: "200px",  outline: "solid", alignItems: "center", justifyContent: "space-evenly", margin:"10px"}}>
            <img style={{height:"70px"}} src="https://cdn3.iconfinder.com/data/icons/health-and-fitness-2/60/Health_and_Fitness_-_Outline_-_003_-_Heart_Rate-512.png" />
            <p>
            {dataset? (dataset[dataset.length -1] ? (dataset[dataset.length - 1].beatAvg? dataset[dataset.length - 1].beatAvg: "") : "") : ""}
            </p>
          </div>
          <div style={{display: "flex", borderRadius: "10px", height:"100px", width: "250px",  outline: "solid", alignItems: "center", justifyContent: "space-evenly", margin:"10px"}}>
            <img style={{height:"60px"}} src="http://cdn.onlinewebfonts.com/svg/img_536753.png" />
            <p>
            {vel? (vel[vel.length -1] ? (vel[vel.length - 1]? parseFloat(vel[vel.length - 1]).toFixed(2) + " m/s": "") : "") : ""}
            </p>
          </div>
        </div>
        <div style={{display: "flex", flexDirection:"row"}}>
          <div style={{display: "flex", borderRadius: "10px", height:"100px", width: "250px",  outline: "solid", alignItems: "center", justifyContent: "space-evenly", margin:"10px"}}>
            <img style={{height:"90px"}} src="https://i.pinimg.com/originals/05/64/7c/05647c3c2a9db07539fb0cc89cac9a3c.png" />
            <p style={{marginRight:"5px"}}>
            {dataset? (dataset[dataset.length -1] ? (dataset[dataset.length - 1].batteryVoltage? parseFloat(dataset[dataset.length - 1].batteryVoltage/4096*3.3*2).toFixed(2) + " V": "") : "") : ""}
            </p>
          </div>
          <div style={{display: "flex", borderRadius: "10px", height:"100px", width: "200px",  outline: "solid", alignItems: "center", justifyContent: "space-evenly", margin:"10px"}}>
            <img style={{height:"60px"}} src="https://cdn-icons-png.flaticon.com/512/109/109613.png" />
            <p>
            {dataset? (dataset[dataset.length -1] ? (dataset[dataset.length - 1].uptime? adjustTime(dataset[dataset.length - 1].uptime): "") : "") : ""}
            </p>
          </div>
        </div>


    <div style={{ height: '400px', width: '800px', margin: "10px" }}>
    <Map locData={location}/>
    </div>


    
<div style={{display: "flex", flexDirection:"row", marginTop: "30px", marginBottom:"10%"}}> 
    <div style={{backgroundColor:"whitesmoke", marginRight:"15px"}}>
      < Chart
       options={beatAv.options}
       series={beatAv.series}
       type="line"
       width="500"
      >
      </Chart>
    </div>

    <div style={{backgroundColor:"whitesmoke"}}>
      < Chart
       options={veloc.options}
       series={veloc.series}
       type="line"
       width="500"
      >
      </Chart>
    </div>
  </div>
      </header>
    </div>
  );
}


export default App;