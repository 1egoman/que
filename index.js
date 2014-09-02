/**
  index.js (https://github.com/1egoman/que)
  This file ties together all the library's and contains the server code.
*/
var http = require('http'),
    fs = require("fs"),
    mime = require("mime"),
    sha256 = require("sha256");
require('sugar');

// config
var config = JSON.parse( fs.readFileSync(__dirname + "/config.json").toString() )

// plugin loader
var plugins = require("./lib/plugins")
var all = plugins.loadAll();

// query parser
var query = require("./lib/query")
query.init(all, config);

// get args
var argv = require('minimist')(process.argv.slice(2));

// auth
var auth = require("./lib/auth");
auth.init(config);

// set up the express app
var express = require('express')
var app = express();


// query history
var history = []

// developer mode
argv.dev && console.log(" * Started in developer mode (no auth)")

// check config (underscore signifies hashed password)
if ( !config.password.startsWith('_') ) {

  // hash the password
  config.password = '_' + sha256(config.password);

  // write config
  fs.writeFile(__dirname + "/config.json", JSON.stringify(config, null, 2), function() {
    console.log(" * Auto hashed password in config file")
  });
}


// get a specific service's information
app.get("/api/service/:service", function(req, res, next) {

  // send the service's data, if possible
  if (  all.services[req.params.service]  ) {

    // get service data
    o = new all.services[req.params.service](all.services)

    // write out data, or error
    if (o.getData) {
      res.send( o.getData() || {} )
    } else {
      // no data
      var err = new Error();
      err.status = 501;
      next(err);
    }

  } else {
    // no service
    var err = new Error("Sorry, this service doesn't exist!");
    err.status = 404;
    next(err);
  }
});

// get all services
app.get("/api/services", function(req, res, next) {

  out = []
  Object.keys(all.services).each(function(name){
    // loop through each service

    if (typeof all.services[name] == "function") {
      srv = new all.services[name]();
    } else {
      srv = all.services[name]
    }

    // create record
    item = {name: name, title: name.capitalize(), html: null}

    if ( srv.getServicesPage ) {
      item.html = srv.getServicesPage()
    }
    out.push(item);
  })

  res.send(out);
});

// authentication request
app.post("/api/auth", function(req, res, next) {
  var body = '';

  // a data chunk
  req.on('data', function(chunk) {
    body += chunk.toString();

    // Too much POST data, kill the connection!
    if (body.length > 1e6)
      req.connection.destroy();
  });

  // end of request
  req.on('end', function() {

    // parse the body, and get the client's ip
    body = JSON.parse(body || '{}');
    ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

    // check authentication
    if (auth.authenticate(body, ip, argv.dev) == true) {
      res.send( auth.check(ip, argv.dev) );
    } else {
      res.send({ERR: "Bad Password"})
    }


  });
});

// get a specific service's information
app.get("/api/history", function(req, res, next) {
  // get the query history
  res.send( {history: history} )
});

// post a query
app.post("/api/query", function(req, res, next) {
  var body = '';

  // a data chunk
  req.on('data', function(chunk) {
    body += chunk.toString();

    // Too much POST data, kill the connection!
    if (body.length > 1e6)
      req.connection.destroy();
  });

  // end of request
  req.on('end', function() {
    body = JSON.parse(body || '{}'); // parse the body

    // do the query
    query.parse(body, function(response) {
      res.send(response);
    }, history);


  });
});

// a normal page
app.get("*", function(req, res, next) {
  // try and render a page
  p = req.url.substr(1).split('?')[0];
  try {

    // default of index.html
    if ( p.split('.').length == 1 ) { 
      p += "index.html" 
    }

    // try to send that path
    res.sendFile(__dirname + "/src/" + p)
  } catch(err) {
    var err = new Error();
    err.status = 404;
    next(err);
  }
});




// handling 501 errors
app.use(function(err, req, res, next) {
  if(err.status !== 501) {
    return next();
  }
 
  res.send(err.message || "Server lacks the ability to fufill request");
});

// handling 404 errors
app.use(function(err, req, res, next) {
  console.log(err.status)
  if(err.status !== 404) {
    return next();
  }
 
  res.send(err.message || "Sorry, I'm not aware of this thing you speak of! (404)");
});


var server = app.listen(process.env.PORT || config.port || 8000, function() {
  console.log("Que is ready!")
  console.log('Listening on port %d', server.address().port);
});