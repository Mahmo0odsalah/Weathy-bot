'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

//app.use(bodyParser.urlencoded({extended:false}));

app.post('/', (req,res)=> {
	const body = req.body;
	res.json({'fullfilment' : body});
	}
}) ;

app.listen(process.env.PORT || 8080 , function(err){
	if(err){
		throw err;
	}
	console.log('Server started on Port : ' + process.env.PORT);
});