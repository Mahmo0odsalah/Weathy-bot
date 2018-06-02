'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const host = 'api.worldweatheronline.com';
const wwoApiKey = 'ed7645cdb2cc401a8a490501180106';
const app = express();
var q = '';
app.use(bodyParser.json());

app.post('/', (req,res)=> {
	res.set('Content-type','application/json');
	var body = req.body;
	var good = false;
	if(body.queryResult.parameters['geo-city']){
		let city = body.queryResult.parameters['geo-city'];
		q = encodeURIComponent(city);
		good = true;
	}
	if(body.queryResult.parameters['Latitude']){
		const lat = body.queryResult.parameters['Latitude']['Latitude']['number'];
		const long = body.queryResult.parameters['Longitude']['Longitude']['number'];
		good = true;
		q = lat+','+long;
	}	
	if(good){
		callWeatherApi(q).then((output) => {
    		res.json({ 'fulfillmentText': output });
  		}).catch(() => {
    		res.json({ 'fulfillmentText': `Couldn't get the weather :(` });
		});
  	}
  	else
  	{
  		res.json({'fulfillmentText': 'wrong Input'});
  	}

	
	}) ;

function check(num){
	if(num.endsWith('n') || num.endsWith('N') || num.endsWith('s')||num.endsWith('S')||num.endsWith('e')||num.endsWith('E') || num.endsWith('w')||num.endsWith('W'))
	{
		var x = num.substring(0,num.length-1);
	}
	else
	{
		x = num;
	}
	if(Number(num)== NaN)
	{
		return false;
	}
	else
		return true;
}
function callWeatherApi(city) {
	return new Promise((resolve,reject) =>{
		let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +'&q=' +q + '&key=' + wwoApiKey;
		 http.get({host: host, path: path}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        let forecast = response['data']['weather'][0];
        let location = response['data']['request'][0];
        let conditions = response['data']['current_condition'][0];
        let currentConditions = conditions['weatherDesc'][0]['value'];

        // Create response
        let output = `Current conditions in the ${location['type']} 
        ${location['query']} are ${currentConditions} with a temperature ${conditions['temp_C']}°C with a projected high of
        ${forecast['maxtempC']}°C and a low of ${forecast['mintempC']}°C on ${forecast['date']}.`;

        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        console.log(`Error calling the weather API: ${error}`)
        reject();
      });
    });
  });
}
	

app.listen(process.env.PORT || 8080 , function(err){
	if(err){
		throw err;
	}
	console.log('Server started on Port : ' + process.env.PORT);
});