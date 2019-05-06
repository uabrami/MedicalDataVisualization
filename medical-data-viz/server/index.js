const express = require('express');
const request = require('request');
const config = require('../config')

const app = express();
const PORT = 3000;

app.use(express.static(__dirname + '/../client/dist'));
// Ensure the dataset only containes records that include the hospital's 30-Day Post-Discharge Mortality Rate for patients who are treated at that hospital for Heart Failure.
//"measure_name": "Death rate for heart failure patients",
//https://data.medicare.gov/resource/ukfj-tt6v.json?measure_name=Death%20rate%20for%20heart%20failure%20patients
//https://data.medicare.gov/resource/ukfj-tt6v.json?measure_name="Death rate for heart failure patients"/measure_id="MORT_30_HF"
// Clean the dataset to remove all unnecessary data, such as the data associated with US Territories (AS, DC, GU, MP, PR, VI).

app.get('/api/heartFailures', (req, res) => {
  var options = {
    url: "https://data.medicare.gov/resource/ukfj-tt6v.json",
    headers: {
      'User-Agent': 'request',
      'Host': 'data.medicare.gov',
      'Accept': 'application/json',
      'X-App-Token': config.publicToken,
    },
    data :{
      "$select": "state, score",
      "$limit" : 20,
      "$where": "measure_name=Death rate for heart failure patients AND measure_id=MORT_30_HF"
    }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      console.log(info);
    }
  }

  request(options, callback);




  // ----------------------------------------------------
  // TODO: Fill in the request handler for this endpoint!
  // ----------------------------------------------------

    // -----------------------------------------------------
    // TODO: Send a request to the HospitalCompare API here!
    // -----------------------------------------------------

    // -----------------------------------------------------
    // TODO: Do all data processing/wrangling/munging here!
    // -----------------------------------------------------

});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});