var test = require("tap").test,
    http = require("http"),
    prs = require('child_process');

// start the tests
test("API Test", function (i) {

  i.test("/api/services endpoint", function(t) {

    var options = {
      host: '127.0.0.1',
      port: process.env.PORT || 8000,
      path: '/api/services'
    };

    // http callback
    callback = function(response) {
      var str = '';

      // another chunk of data has been recieved
      response.on('data', function (chunk) {
        str += chunk;
      });

      // the whole response has been recieved
      response.on('end', function () {
        out = JSON.parse(str)
        t.type(out, "object", "endpoint not outputting an object")
      });
    }

    // do request
    http.request(options, callback).end();
  });

  i.test("/api/service/calendar endpoint", function(t) {

    var options = {
      host: '127.0.0.1',
      port: process.env.PORT || 8000,
      path: '/api/service/calendar'
    };

    // http callback
    callback = function(response) {
      var str = '';

      // another chunk of data has been recieved
      response.on('data', function (chunk) {
        str += chunk;
      });

      // the whole response has been recieved
      response.on('end', function () {
        out = JSON.parse(str)
        t.type(out, "array", "calendar endpoint not outputting an array of events")
      });
    }

    // do request
    http.request(options, callback).end();
  });

  i.test("/api/query endpoint", function(t) {

    var options = {
      host: '127.0.0.1',
      port: process.env.PORT || 8000,
      path: '/api/query',
      method: "POST"
    };

    // http callback
    callback = function(response) {
      var str = '';

      // another chunk of data has been recieved
      response.on('data', function (chunk) {
        str += chunk;
      });

      // the whole response has been recieved
      response.on('end', function () {
        out = JSON.parse(str)
        t.type(out, "object", "endpoint not outputting an object")
      });
    }

    // do request
    req = http.request(options, callback);
    req.write('{"query": {"text": "test"}}');
    req.end();
  });

  t.end()
})