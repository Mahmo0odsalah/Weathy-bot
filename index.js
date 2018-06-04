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
		const lat = body.queryResult.parameters['Latitude']['Latitude']['number']+body.queryResult.parameters['Latitude']['direction'].toString();
		const long = body.queryResult.parameters['Longitude']['Longitude']['number']+body.queryResult.parameters['Longitude']['direction'].toString();
		good = true;
		q = convert(lat)+','+convert(long);
		
	}	
	if (body.originalDetectIntentRequest&& body.originalDetectIntentRequest.payload && body.originalDetectIntentRequest.payload.data &&body.originalDetectIntentRequest.payload.data.postback && body.originalDetectIntentRequest.payload.data.postback.data && body.originalDetectIntentRequest.payload.data.postback.data.lat){
			q = body.originalDetectIntentRequest.payload.data.postback.data.lat + ',' + body.originalDetectIntentRequest.payload.data.postback.data.long;
		}
	if(true){
		
		callWeatherApi(q).then((output) => {
    		let responseJson = {};
    		//responseJson.fulfillmentText = output;
    		responseJson.followupEventInput = {'name': 'how',
    		'parameters':{
    			'output':output
    		}};
    		res.json(responseJson);
/*    		res.json({ 'fulfillmentText': output ,
    			'followupEventInput':{
    				'name':'how'
    			}});*/
    		console.log(output);
    		
  		}).catch(() => {
    		res.json({ 'fulfillmentText': `Couldn't get the weather :(` });
		});
  	}
  	else
  	{
  		res.json({'fulfillmentText': 'wrong Input'});
  	}

	
	}) ;
function convert(tude){
	if (tude.endsWith('N') || tude.endsWith('E')){
		return tude.substring(0,tude.length-1);
	}
	else
		if(tude.endsWith('S') || tude.endsWith('W'))
			return tude.substring(0,tude.length-1) * -1;
		else
			throw err;
}
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
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {

        let response = JSON.parse(body);
        let forecast = response['data']['weather'][0];
        let location = response['data']['request'][0];
        let conditions = response['data']['current_condition'][0];
        let currentConditions = conditions['weatherDesc'][0]['value'];

        let output = `Current conditions in the ${location['type']} ${location['query']} are ${currentConditions} with a temperature ${conditions['temp_C']}°C with a projected high of ${forecast['maxtempC']}°C and a low of ${forecast['mintempC']}°C on ${forecast['date']}.`;

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