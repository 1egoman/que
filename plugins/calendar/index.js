var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /(cal|calendar)/gi,
    then: function(query, services) {

      // a calendar-based event
      return services.query.childParentCallback(query, function(query, type, cp, when) {
        
        // create new calendar service instance
        cal = new services.calendar(services)

        // perform the correct action
        switch (type) {

          // add calendar event
          case "addition":
            cal.addEvent({name: cp.child, "when": when, color: "red"});
            return "Added "+cp.child+" to calendar"
            break

          // delete calendar event
          case "subtraction":
            cal.delEvent({name: cp.child});
            return "Deleted "+cp.child+" from calendar"
            break

          default:
            return "No response for this action"
            break
        }
      })
    }
  }
]

exports.services = {
  calendar: function(services) {

    var root = this;

    // get calendar events
    this.getEvents = function() {
      cal = new services.persist("calendar").get();

      // change over all json dates to real dates
      cal.events.each(function(evt){
        if (evt.when) {
          evt.when = new Date(evt.when)
        }
      });

      return cal.events || {};
    }

    // put calendar events
    this.putEvents = function(events) {
      cal = new services.persist("calendar");
      return cal.put({events: events});
    }

    this.addEvent = function(e) {
      events = this.getEvents()
      events.push(e);
      this.putEvents(events);
    }

    this.delEvent = function(e) {
      events = this.getEvents()
      var ret = false;

      needle = Object.values(e)

      events.each(function(each){

        // if some of the values match... we've got a winner
        if ( Object.values(each).subtract(needle).length != Object.values(each).length ) {
          // remove and update
          events.remove(e)
          root.putEvents(events)
          ret = true
          return
        }
      })
      return ret
    }

    this.getData = function() {
      return this.getEvents();
    }

  }
}