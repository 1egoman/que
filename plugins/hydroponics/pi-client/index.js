var http = require('http');
var fs = require('fs');
var gpio = require("pi-gpio");
var strftime = require("strftime");

// read config
var config = JSON.parse( fs.readFileSync("config.json") );

// pump obejct
var pump = {

  // is pump on?
  pumpOn: false,

  // turn on the pump
  turnOn: function(callback) {
    gpio.open(config.gpiopump, "output", function(err) {
      gpio.write(config.gpiopump, 1, function() {
        gpio.close(config.gpiopump);
        this.pumpOn = true;
        callback();
      });
    });  
  },

  // turn off the pump
  turnOff: function() {
    gpio.open(config.gpiopump, "output", function(err) {
      gpio.write(config.gpiopump, 0, function() {
        gpio.close(config.gpiopump);
        this.pumpOn = false;
        callback();
      });
    }); 
  }
}

// the timer
var globalTimer = setInterval(function() {

  // test to see if it is time for the pump to turn on
  if ( strftime('%X') == config.pumptimer.when ) {

    // turn on pump
    pump.turnOn();

    // turn off the pump after the cycle is complete
    setTimeout(function(){
      pump.turnOff();
    }, config.pumptimer.length)
  }
}, 1000);


// the server
http.createServer(function (req, res) {

  // get timer info
  if (req.method == "GET" && req.url == "/pump/timer") {

    // output response
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end( JSON.stringify(config.pumpTimer) );

  // set timer info
  } else if (req.method == "POST" && req.url == "/pump/set-timer") {

    var body = '';
    request.on('data', function (data) {
      body += data.toString();

      // Too much POST data, kill the connection!
      if (body.length > 1e6)
        req.connection.destroy();
    });

    request.on('end', function () {
      var data = JSON.parse(body);

      // update it
      config.pumpTimer = data;
      fs.writeFile("config.json", data)

      // output response
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end("OK");
    });

  }

}).listen(8000);