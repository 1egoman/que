var path = require('path'),
fs = require('fs');

exports.queries = []

exports.services = {
  people: function(services) {

    var root = this;

    // get calendar events
    this.getPeople = function() {
      return new services.persist("people").get();
    }

    // put all people
    this.putPeople = function(people) {
      cal = new services.persist("people");
      return cal.put({people: people});
    }

    this.addPerson = function(e) {
      people = this.getPeople()
      events.push(e);
      this.putPeople(people);
    }

    this.getData = function() {
      return this.getPeople();
    }

  }
}