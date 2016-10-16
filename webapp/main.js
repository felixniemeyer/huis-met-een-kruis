/* foreign modules */
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var expressApp = express();
var apiurl = "/api";

expressApp.use(bodyParser.json());

var coordinateSaver = require("./ourmodules/coordinate-saver.js");

expressApp.all(apiurl, function(request, response) {
	var action = request.body.action;
	var params = request.body.params;
	console.log("action: " + action + ", params: " + JSON.stringify(params));
	if(request.body.action == 'submit')
		coordinateSaver.submit(params, response);
	else
		response.send('not a valid action');
});

expressApp.use(express.static(__dirname + '/website'));

var port = 8081;
expressApp.listen(port);

console.log('express running on port ' + port);
