var express = require('express');
var router = express.Router();
var https = require('https');
var http = require('http');
var accessToken='';
var request= require('request');
var code = "";
var res1;
var username = '';
/* GET users listing. */
router.get('/', getUser, renderUser);

function getUser(req, res, next) {
	var options = {
		url: 'http://localhost:3001'
	}
	if(typeof req.query.code != 'undefined'){
		options.qs = {code: req.query.code}
	}
	request.get(options, function(err,response,body){
		parsed = JSON.parse(body);
		req.username = parsed.user;
		req.accessToken = parsed.accessToken;
		next();
	});
}

function renderUser(req,res,next) {
	res.render('home', { user: req.username,accessToken : req.accessToken});
}

router.post('/', checkValid,getData,loadData);

function checkValid(req, res, next) {
	if (req.body.token === "") {
		res.send("Please authorise the application to use.");
	} else if(isNaN(req.body.days) || isNaN(req.body.daysEnd)){
		res.redirect('/');
	} else{
		next();
	}
}

function getData(req, res, next) {
	var options = {
		url: 'http://localhost:3001' + 
		'/issues?username=' + req.body.username + 
		"&repo=" + req.body.repo + 
		"&token=" + req.body.token + 
		"&days=" + req.body.days + 
		"&daysEnd=" + req.body.daysEnd + 
		"&state=" + req.body.state
	}

	request.get(options, function(err,response,body){
		parsed = JSON.parse(body);
		req.indexData = parsed.indexData;
		req.state = parsed.state;
		next();
	});
}

function loadData(req, res, next) {
	console.log(req.indexData);
	console.log(req.state);
	if (req.state == "open") {
		res.render('open',{indexData:req.indexData,state: "Open Issues"});
	} else {
		res.render('closed',{indexData:req.indexData,state: "Closed Issues"});
	}
}

module.exports = router;
