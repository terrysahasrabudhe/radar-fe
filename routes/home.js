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
	request.get('http://localhost:3001/', function(err,response,body){
		parsed = JSON.parse(body);
		console.log(parsed.user)
		req.username = parsed.user;
		req.accessToken = parsed.accessToken;
		console.log(username);
		next();
	});
}

function renderUser(req,res,next) {
	res.render('home', { user: req.username,accessToken : req.accessToken});
}

router.post('/', function(req, res, next){
	 if (accessToken == "") {
	 	res.send("Please authorise the application to use.");
	 } else {


	 var username = req.body.username;
	 var repo = req.body.repo;
	 var token = accessToken;
	 var days = req.body.days;
	 var daysEnd = req.body.daysEnd;
	 var state = req.body.state;
	 if (isNaN(days) || isNaN(daysEnd)) {
	 	res.redirect('/');
	 }
     res.redirect('/issues?username=' + username + "&repo=" + repo + "&token=" + token + "&days=" + days + "&daysEnd=" + daysEnd + "&state=" + state);
	}

})

module.exports = router;
