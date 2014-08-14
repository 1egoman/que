var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /text/gi,
    then: function(query, services) {
      x = new services.calendar(services)

      return "hello"
    }
  },
  {
    validate: /abc/gi,
    then: function(query, services) {
      data = new services.persist("hi")
      data.put(["yo"]);
      return "Got: " + data.get();
    }
  }
]

exports.services = {}