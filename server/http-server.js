'use strict';

let express = require('express');
let app = express();

app.use(express.static('../client'));

app.get('/', function(req, res) {
  let secure = req.protocol == 'http' ? '' : 'secure ';
  console.log("Received a " + secure + req.method + " request from " + req.hostname + " @ port " + req.port);
  res.end("hello");
});

module.exports = app;
