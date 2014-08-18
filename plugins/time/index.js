var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /time/gi,
    then: function(query, services, callback) {

      // parse when this is happening
      when = services.query.whenParser(query) || Date.create()

      //cannot give time in the future or past
      if ( when.is('today') ) {
        return "The time is " + when.format('{12hr}:{mm}{tt}')
      } else {
        return "I cannot tell the future, nor the past!"
      }
    }
  },
  {
    validate: function(query) {

      // must match one of these
      return /\bday\b/gi.test(query) || /\bdate\b/gi.test(query)
    },
    then: function(query, services, callback) {

      // parse when this is happening
      when = services.query.whenParser(query) || Date.create()

      // give the date that was requested
      if ( /\bday\b/gi.test(query) ) {
        // ex: monday
        callback( "Today is a " + when.format('{Weekday}') )

      } else if ( /\bdate\b/gi.test(query) ) {
        // ex: June 5 2014
        callback( "Today's date is " + when.format('{Month} {d}, {yyyy}') )
      }


    }
  }
]

exports.services = {}