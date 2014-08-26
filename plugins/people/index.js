var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /people/gi,
    then: function(query, services, callback) {

      // a people-based event
      callback(services.query.childParentCallback(query, function(query, type, cp, when) {
        
        // create new calendar service instance
        cal = new services.people(services)

        // perform the correct action
        switch (type) {

          // add calendar event
          case "addition":
            cal.addPerson({name: cp.child, tags: []});
            return "Added "+cp.child+" to calendar"
            break

          default:
            return "No response for this action"
            break
        }
      }))

    }
  }
]

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