const express = require('express');
const app = express();
const path = require('path');
const ConfHelper = require('./conf_import');
const ch = new ConfHelper('servers');
const mysql = require('mysql');

const port = process.argv.filter(i=>i.includes(':port'))[0] || "80";

//// PAGES ////
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/index.html'));
});

//// FRAGMENTS  ////
app.get('/fragment/connection', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/connection.html'));
});
app.get('/fragment/database', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/database.html'));
});

//// CSS  ////
app.get('/styles/default.css', function (req, res) {
  res.sendFile(path.join(__dirname + '/styles/default.css'));
});

//// JAVASCRIPT ////
app.get('/scripts/connection.js', function (req, res) {
  res.sendFile(path.join(__dirname + '/scripts/connection.js'));
});
app.get('/scripts/database.js', function (req, res) {
  res.sendFile(path.join(__dirname + '/scripts/database.js'));
});

//// FAVICON ////
app.get('/favicon.ico', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/favicon.ico'));
});

//// APIs ////

//// Server Data ////

app.get('/api/servers', function (req, res) {
  res.json(ch.config.get('servers'));
});

app.get('/api/add_server', function (req, res) {
  let name = req.query.name;
  if (!name) throw new Error('Missing parameters');
  ch._getConf();
  ch.createKey(`servers.${name}.host`, req.query.host);
  ch.createKey(`servers.${name}.user`, req.query.user);
  ch.createKey(`servers.${name}.database`, "");
  res.json('success');
});

app.get('/api/get_database', function (req, res) {
  let name = req.query.name;
  if (!name) throw new Error('Missing parameters');
  res.json(ch.config.get(`servers.${name}.database`));
});

app.get('/api/set_database', function (req, res) {
  let name = req.query.name;
  if (!name) throw new Error('Missing parameters');
  ch._getConf();
  ch.updateKey(`servers.${name}.database`, req.query.db);
  res.json('success');
});

app.get('/api/update_server', function (req, res) {
  let name = req.query.name;
  if (!name) throw new Error('Missing parameters');
  ch._getConf();
  ch.updateKey(`servers.${name}.host`, req.query.host);
  ch.updateKey(`servers.${name}.user`, req.query.user);
  res.json('success');
});

app.get('/api/remove_server', function (req, res) {
  let name = req.query.name;
  if (!name) throw new Error('Missing parameters');
  ch._getConf();
  ch.deleteKey(`servers.${name}`);
  res.json('success');
});

//// MySQL ////

app.get('/api/test_connection', function (req, res) {
  let name = req.query.name;
  let connection = mysql.createConnection({
    host: ch.config.get(`servers.${name}.host`),
    user: ch.config.get(`servers.${name}.user`),
    database: ch.config.get(`servers.${name}.database`),
    password: req.query.password
  });

  connection.connect(err => {
    if (err) {
      res.json(false)
    } else {
      res.json(true);
    }
  });
});

app.get('/api/databases', function (req, res) {
  let name = req.query.name;
  let connection = mysql.createConnection({
    host: ch.config.get(`servers.${name}.host`),
    user: ch.config.get(`servers.${name}.user`),
    database: ch.config.get(`servers.${name}.database`),
    password: req.query.pass
  });

  connection.connect(err => {
    if (err) throw err;
  });

  connection.query('SHOW DATABASES', (err, data) => {
    res.json(data);
  })

});

app.get('/api/tables', function (req, res) {
  let name = req.query.name;
  let connection = mysql.createConnection({
    host: ch.config.get(`servers.${name}.host`),
    user: ch.config.get(`servers.${name}.user`),
    database: req.query.db,
    password: req.query.pass
  });

  connection.connect(err => {
    if (err) throw err;
  });

  connection.query('SHOW TABLES', (err, data) => {
    res.json(data);
  });

});

app.get('/api/run_query', function (req, res) {
  let name = req.query.name;
  let connection = mysql.createConnection({
    host: ch.config.get(`servers.${name}.host`),
    user: ch.config.get(`servers.${name}.user`),
    database: req.query.db,
    password: req.query.pass
  });

  connection.connect(err => {
    if (err) throw err;
  });

  let query = req.query.qry.toLowerCase().indexOf("limit") >= 0 ? req.query.qry : `${req.query.qry} LIMIT 1000`;

  connection.query(query, (err, data) => {
    res.json(data);
  });

});

app.listen(port.replace(/:port/,""));