var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /TestPlugin Normal Query/g,
    priority: Infinity,
    then: function(query, services, callback) {
      callback("Normal Response");
    }
  },
  {
    validate: /TestPlugin Chained Query/g,
    priority: Infinity,
    then: function(query, services, callback) {
      callback("Chained Response", null, function(text, err, callback) {
        callback("Final Chained Response");
      });
    }
  },
  {
    validate: function(q) {
      return q == "TestPlugin Function Validation Query";
    },
    priority: Infinity,
    then: function(query, services, callback) {
      callback("Win")
    }
  },
  {
    validate: /TestPlugin Priority Query/g,
    priority: 100000000,
    then: function(query, services, callback) {
      callback("Win");
    }
  },
  {
    validate: /TestPlugin Priority Query/g,
    priority: 99999999,
    then: function(query, services, callback) {
      callback("Fail");
    }
  }
]

exports.services = {
  TestPluginFunction: function(services) {

    this.exampleMethod = function(arg) {
      return "Arg was "+arg;
    }

    this.getData = function() {
      return "<p>Output</p>";
    }

  },
  TestPluginObject: {

    exampleMethod: function(arg) {
      return "Arg was "+arg;
    },

    getData: function() {
      return "<p>Output</p>";
    }

  }
}