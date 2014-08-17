var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /time/gi,
    then: function(query, services) {

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
    validate: /date/gi,
    then: function(query, services) {

      // parse when this is happening
      when = services.query.whenParser(query) || Date.create()

      // give the date that was requested
      if ( query.has('day') ) {
        // ex: monday
        return "Today is a " + when.format('{Weekday}')

      } else if ( query.has('day') ) {
        // 
        return "The time is " + when.format('{12hr}:{mm}{tt}')
      }


    }
  }
]

exports.services = {}