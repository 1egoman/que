var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /cal/gi,
    then: function(query, services) {
      x = new services.calendar(services)
      x.addEvent({name: "event", "when": new Date(), color: "red"});
      return "OK"
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

    this.getData = function() {
      return this.getEvents();
    }

  }
}