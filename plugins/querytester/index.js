var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /test/gi,
    then: function(query, services, callback) {
      callback("second question", null, function(text, err, callback) {
        console.log(">>>", text)
        callback("third question", null, function(text, err, callback) {
          callback("GOOD! > " + text)
        })
      })
    }
  }
]

exports.services = {}