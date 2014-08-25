var http = require('http'),
    fs = require("fs"),
    mime = require("mime");
require('sugar');

// plugin loader
var plugins = require("./plugins")

// get args
var argv = require('minimist')(process.argv.slice(2));
var express = require('express')
var app = express();

// load plugins
var all = plugins.loadAll();

// query history
var history = []


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
app.get("/api/services", function(req, res) {

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
    body = JSON.parse(body); // parse the body

    // sort all plugins based on priority
    all.all = all.all.sortBy(function(n) {
      return n.priority || 0
    })

    // do query
    resp = all.validateFor(body.query.text)

    // if query was successful, continue
    if (resp != false) {

      // get the plugin's response
      resp.then(body.query.text, all.services, function(out, err) {

        // failed request
        if (out == false) {
          res.send( {ERROR: err || null} )
        }

        // create packet, if it isn't already
        if (typeof out == "string") {
          packet = {"OK": out}
        }

        // add to history
        hist = {packet: packet, when: new Date(), query: body}
        history.push(hist)

        // end of query
        res.send(packet);
      })


    } else {
      // no plugin's matched the query
      res.end( {NOHIT: null} )
    }
  });
});

// a normal page
app.get("*", function(req, res) {
  // try and render a page
  p = req.url.substr(1).split('?')[0];
  try {

    // default of index.html
    if ( p.split('.').length == 1 ) { 
      p += "/index.html" 
    }

    // try to go to that path
    var cnt = fs.readFileSync("src/"+p).toString()
    res.writeHead(200, { 'Content-Type': mime.lookup(p) });
    res.end(cnt);
  } catch(err) {
    res.writeHead(404, '');
    res.end("doesn't exist")
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


var server = app.listen(process.env.PORT || 8000, function() {
  console.log('Listening on port %d', server.address().port);
});