var http = require('http'),
    fs = require("fs"),
    mime = require("mime"),
    sha256 = require("sha256");
require('sugar');

// plugin loader
var plugins = require("./plugins")

// config
var config = JSON.parse( fs.readFileSync(__dirname + "/config.json").toString() )

// get args
var argv = require('minimist')(process.argv.slice(2));
var express = require('express')
var app = express();

// load plugins
var all = plugins.loadAll();

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

    // parse and provide some error correction
    body = JSON.parse(body || '{}'); // parse the body
    if (!body.password) {
      res.send({ERR: "No Password provided"});
      return
    }

    // check the information (or, in developer mode)
    if ( config.password.slice(1) == sha256(body.password) || argv.dev ) {
      // success!
      res.send({
        status: "OK",
        username: config.user.first_name || "User",
        rights: 0
      });
    } else {
      // fail
      res.send({ERR: "Bad Password"});
    }

  });

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
})

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

    // create callback object
    var callbackObject = function(text, status, callback) {

      // failed request
      if (text == false) {
        res.send( {ERROR: status || null} )
      }

      // create packet, if it isn't already
      if (typeof text == "string") {
        packet = {"OK": text, "complete": callback == undefined}
      } else {
        packet = text;
      }

      // add to history
      hist = {packet: packet, when: new Date(), query: body, complete: callback == undefined, callback: callback, status: status}
      history.push(hist)

      // end of query
      res.send(packet);
    }

    if (history.length == 0 || history[history.length-1].complete == true) {

      // sort all plugins based on priority
      all.all = all.all.sortBy(function(n) {
        return n.priority || 0
      })

      // do query
      resp = all.validateFor(body.query.text)

      // if query was successful, continue
      if (resp != false) {

        // get the plugin's response
        body.ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
        resp.then(body.query.text, all.services, callbackObject, body)

      } else {
        // no plugin's matched the query
        res.end( "{NOHIT: null}" )
      }

    } else {
      // otherwise, just run the callback
      hist = history[history.length-1]
      if (hist.status && hist.status.type == "boolean") {

        // do a boolean operation
        ifTrue = body.query.text.split(' ').intersect(config.trueWords).length > 0
        ifFalse = body.query.text.split(' ').intersect(config.falseWords).length > 0

        // check it
        if (ifTrue && !ifFalse) {
          hist.callback(true, null, callbackObject)
        } else if (!ifTrue && ifFalse) {
          hist.callback(false, null, callbackObject)
        } else {
          hist.callback(body.query.text, null, callbackObject)
        }

      } else {
        hist.callback(body.query.text, null, callbackObject)
      }
    }


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


var server = app.listen(config.port || 8000, function() {
  console.log("Que is ready!")
  console.log('Listening on port %d', server.address().port);
});