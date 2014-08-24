var path = require('path'),
    fs = require('fs'),
    http = require('http');

exports.queries = [
  {
    validate: /garden/gi,
    then: function(query, services, callback) {

      new services.garden(services).info(function(data, err) {
        console.log(data)
      })
      callback("Checking...")

    }
  }
]

exports.services = {
  garden: function(services) {

    this.getServicesPage = function() {
      return {
        icon: "glyphicon-leaf",
        html: fs.readFileSync(__dirname + "/garden.html").toString(),
        js: fs.readFileSync(__dirname + "/garden.js").toString()
      }
    }

    this.info = function(callback) {
      // get garden ip
      garden = new services.devices(services).findByTag("hydroponics")[0].ip

      // do a request to the garden
      try {
        http.get({
          host: garden,
          port: 8000,
          path: "/pump/timer"
        }, function(response) {
          var body = '';

          response.on('data', function(chunk) {
            body += chunk.toString();
          })

          response.on('end', function() {
            callback( JSON.parse(body), null );
          })

        }).end();
      } catch(err) {
        callback(null, "No Route to Host.")
      }
    }
  }
}