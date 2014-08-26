var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /test/gi,
    then: function(query, services, callback) {
      callback("A followup question, just answer anything!", null, function(text, err, callback) {
        callback("a third question, give me a boolean answer!", {type: "boolean"}, function(text, err, callback) {
          callback("GOOD! > " + text)
        })
      })
    }
  }
]

exports.services = {}