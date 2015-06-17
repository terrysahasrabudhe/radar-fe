var express = require('express');
var router = express.Router();
var request= require('request');

if (process.env.API_URL !== undefined)
  API_URL = process.env.API_URL;
else if (!isNaN(process.env.API_PORT))
  API_URL = 'http://localhost:' + process.env.API_PORT;
else API_URL = 'http://localhost:3001';

/* GET users listing. */
router.get('/', getToken, renderHome);

repo = 'shippable/support';
days = 0;
daysEnd = 5;

function getToken(req, res, next) {
  var options = { 
    url: API_URL
  };
  request.get(options, function(err,response,body){
    if (err){
      res.send('Can\'t connect to api');
    }
    else {
      parsed = JSON.parse(body);
      if (parsed.accessToken !== undefined)
        req.accessToken = parsed.accessToken;
      else req.accessToken = process.env.DEFAULT_TOKEN;
      next();
    }
  });
}

function renderHome(req,res,next) {
  res.render('home', {message:req.flash('error'),
    repo:repo,
    days:days,
    daysEnd:daysEnd,
    accessToken:req.accessToken});
}

router.post('/', checkValid,getData,loadData);

function checkValid(req, res, next) {
  repo = req.body.repo;
  days = req.body.days;
  daysEnd = req.body.daysEnd;
  if (req.body.token === '') {
    req.flash('error','Please give your access token!');
    res.redirect('/');
  } else if(isNaN(parseInt(req.body.days)) || isNaN(parseInt(req.body.daysEnd)) ||
    req.body.daysEnd - req.body.days < 0 ||
    req.body.days < 0 || req.body.daysEnd <  0||
    req.body.days % 1 !== 0 || req.body.daysEnd % 1 !== 0){
    req.flash('error','Please put a valid range of days!');
    res.redirect('/');
  } else{
    next();
  }
}

function getData(req, res, next) {
  var options = {
    url: API_URL + 
    '/issues?&repo=' + req.body.repo +
    '&token=' + req.body.token +
    '&days=' + req.body.days +
    '&daysEnd=' + req.body.daysEnd +
    '&state=' + req.body.state
  };

  request.get(options, function(err,response,body){
    parsed = JSON.parse(body);
    req.indexData = parsed.indexData;
    req.state = parsed.state;
    next();
  });
}

function loadData(req, res, next) {
  if (req.state == 'open') {
    res.render('open',{indexData:req.indexData,state: "Open Issues"});
  } else if (req.state == 'closed'){
    res.render('closed',{indexData:req.indexData,state: "Closed Issues"});
  } else if (req.state == 'accessError'){
    req.flash('error','Please check your access token!');
    res.redirect('/');
  } else if (req.state == 'repoError'){
    req.flash('error','Invalid repo!');
    res.redirect('/');
  } else{
    console.log(req.state);
    req.flash('error','Unknown error');
    res.redirect('/');
  }
}

module.exports = router;
