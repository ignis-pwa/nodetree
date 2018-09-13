const express = require('express');
const app = express();
const path = require('path');
const ConfHelper = require('./conf_import');
const ch = new ConfHelper('servers');

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/pages/index.html'));
});

app.get('/styles/default.css', function(req, res) {
  res.sendFile(path.join(__dirname + '/styles/default.css'));
});

app.get('/scripts/main.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/scripts/main.js'));
});

app.get('/favicon.ico', function(req, res) {
  res.sendFile(path.join(__dirname + '/pages/favicon.ico'));
});

app.get('/api/servers', function(req, res) {
  res.json(ch.config.get('servers'));
});

app.get('/api/add_server', function(req, res) {
  let name = req.query.name;
  if(!name) throw new Error('Missing parameters');
  ch._getConf();
  ch.createKey(`servers.${name}.host`,req.query.host);
  ch.createKey(`servers.${name}.user`,req.query.user);
  ch.createKey(`servers.${name}.database`,"");
  res.json('success');
});

app.get('/api/update_server', function(req, res) {
  let name = req.query.name;
  if(!name) throw new Error('Missing parameters');
  ch._getConf();
  ch.updateKey(`servers.${name}.host`,req.query.host);
  ch.updateKey(`servers.${name}.user`,req.query.user);
  ch.updateKey(`servers.${name}.database`,"");
  res.json('success');
});

app.get('/api/remove_server', function(req, res) {
  let name = req.query.name;
  if(!name) throw new Error('Missing parameters');
  ch._getConf();
  ch.deleteKey(`servers.${name}`);
  res.json('success');
});

app.listen(80);
