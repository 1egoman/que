var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /test/gi,
    then: function(query, services, callback) {
      callback("hello, world")
    }
  }
]

exports.services = {}