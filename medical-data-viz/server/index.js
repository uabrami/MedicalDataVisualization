const express = require('express');
const request = require('request');
const config = require('../config');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname + '/../client/dist'));
// Ensure the dataset only containes records that include the hospital's 30-Day Post-Discharge Mortality Rate for patients who are treated at that hospital for Heart Failure.
//"measure_name": "Death rate for heart failure patients",
//https://data.medicare.gov/resource/ukfj-tt6v.json?measure_name=Death%20rate%20for%20heart%20failure%20patients
//https://data.medicare.gov/resource/ukfj-tt6v.json?measure_name="Death rate for heart failure patients"/measure_id="MORT_30_HF"
// Clean the dataset to remove all unnecessary data, such as the data associated with US Territories (AS, DC, GU, MP, PR, VI).

const dataClean = function(array){
//function to check territories
  const stateCheck = (string) => {
    if (string === "AS" || string === "DC" || string === "GU" || string === "MP" || string === "PR" || string === "VI" || string === undefined) {
      return false;
    }
    return true;
  }
//function to check score is there
  const validScore = (string) => {
    if (string === undefined) {
      return false;
    }
    return true;
  }

  const resultObj = {};
  array.forEach((item) => {
    const { state, score} = item;
    if(!stateCheck(state) || !validScore(score)) {
      return;
    }

    if (!resultObj[state]) {
      resultObj[state] = [];
      resultObj[state].push(item);
    }
    if (resultObj[state]) {
      resultObj[state].push(item);
    }
  })
  return resultObj;
}
//function for average per state
const averagePerState = (array) => {
  let count = 0;
  let total = 0;
  array.forEach((item) => {
    if (item.score !== 'Not Available') {
      total += Number(item.score);
      count++;
    }
  })
  const average = Math.round(total/count);
  return {
    mortalityScore: average,
  }
}
//function to produce final object
const averageObj = (obj) => {
  let result = {};
  for (let keys in obj) {
    result[keys] = averagePerState(obj[keys]);
  }
  // console.log(result);
  return result;
}

app.get('/api/heartFailures', (req, res) => {
  var options = {
    url: "https://data.medicare.gov/resource/ukfj-tt6v.json",
    headers: {
      'User-Agent': 'request',
      'Host': 'data.medicare.gov',
      'Accept': 'application/json',
      'X-App-Token': config.DATA_MEDICARE_GOV_APP_TOKEN,
    },
    data :{
      '$select': 'state, score',
      '$where': "measure_name=Death rate for heart failure patients AND measure_id=MORT_30_HF",
    }
  };

axios.get("https://data.medicare.gov/resource/ukfj-tt6v.json", options)
  .then(results => {
    const cleanedObj = dataClean(results.data);
    const finalResult = averageObj(cleanedObj);
    res.send(finalResult);
  })
  .catch((err) => {
    res.send(err)
  })

});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});