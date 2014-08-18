var http = require('http'),
    fs = require("fs"),
    mime = require("mime");
require('sugar');

// plugin loader
var plugins = require("./plugins")

// get args
var argv = require('minimist')(process.argv.slice(2));

// load plugins
var all = plugins.loadAll();

// query history
var history = []

http.createServer(function (req, res) {

  console.log(">", req.method, req.url)

  // Quick and dirty server
    var p = req.url.substr(1).split('?')[0];
    var pth = p.split("/");

    if (req.method == "GET") {


      // get data
      if ( pth[0] == "api" ) {
        if (pth[1] == "services") {
          // get plugins' service's html to be rendered
          res.writeHead(200, { 'Content-Type': 'application/json' });

          // loop through services
          out = []
          Object.keys(all.services).each(function(name){
            // console.log( all.services[name] )
            code = {name: name, title: name.capitalize(), html: null}
            out.push(code)
          })

          res.end( JSON.stringify(out) )

        } else if (pth[1] == "service") {
          // get information for one service
          name = pth[2]

          // send the service's data, if possible
          if (  all.services[name]  ) {
            o = new all.services[name](all.services)
            if (o.getData) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end( JSON.stringify(o.getData()) || '{}' )
            } else {
              res.writeHead(200, { 'Content-Type': 'text/plain' });
              res.end( "operation not supported" )
            }
          } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end( "no such service" )
          }


        } else if (pth[1] == "history") {
          // get the query history
          res.writeHead(200, { 'Content-Type': 'application/json' })
          obj = {history: history}
          res.end( JSON.stringify(obj) )
        }

      }




    // try and render a page
    try {

      // default of index.html
      if ( p.split('.').length == 1 ) { 
        p += "/index.html" 
      }

      // try to go to that path
      var cnt = fs.readFileSync("src/"+p)
      res.writeHead(200, { 'Content-Type': mime.lookup(p) });
      res.end(cnt);
    } catch(err) {
      res.writeHead(404, '');
      res.end("doesn't exist")
    }





  } else if (req.method == "POST") {



    // query
    if (pth[0] == "api" && pth[1] == "query") {
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
        body = JSON.parse(body);

        // sort all plugins based on priority
        all.all = all.all.sortBy(function(n) {
          return n.priority || 0
        })

        // do query
        resp = all.validateFor(body.query.text)

        // if query was successful, continue
        if (resp != false) {
          res.writeHead(200, { 'Content-Type': 'application/json' });


          // get the plugin's response
          resp.then(body.query.text, all.services, function(out, err) {

            // failed request
            if (out == false) {
              res.end( JSON.stringify({ERROR: err || null}) )
            }

            // create packet
            if (typeof out == "string") {
              out = {"OK": out}
            }

            // add to history
            hist = {packet: out, when: new Date(), query: body}
            history.push(hist)

            // end of query
            res.end( JSON.stringify(out) );
          })


        } else {
          // no plugin's matched the query
          res.end( JSON.stringify({NOHIT: null}) )
        }
      });
    }



  }

}).listen(process.env.PORT || 8000);