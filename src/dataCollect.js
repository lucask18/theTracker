import React, { useState, useEffect } from 'react';



const [dataset, setDataset] = useState([]);
  useEffect(() => {
    getData();
  }, []);

  function callback(data) {
    data.sort((a, b) => (a.date) - (b.date));
    setDataset(data)

  }

  function getData() {
    var x = new XMLHttpRequest();
    x.open("GET", "https://trackerbucketest.s3.amazonaws.com/", true);
    x.setRequestHeader("Content-Type", "application/xml");
    x.onreadystatechange = function () {
        if (x.readyState == 4 && x.status == 200) {
            console.log(x)
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

export {dataset}