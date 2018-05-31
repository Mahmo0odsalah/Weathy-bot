'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/', (req,res)=> {
	res.set('Content-type','application/json');
	var body = req.body;
	let city = body.queryResult.parameters['geo-city'];
	res.json({'fulfillmentText' : city});
	}) ;

app.listen(process.env.PORT || 8080 , function(err){
	if(err){
		throw err;
	}
	console.log('Server started on Port : ' + process.env.PORT);
});