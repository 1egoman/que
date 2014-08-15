// Calendar Controller
// Manages the services -> calendar service
angular.module("QueApp").controller('calendarController', function($http, $interval){
  
  this.events = []
  var root = this;
  this.date = Date.create();

  // rewind a month on the calendar
  this.prev = function(n) {
    this.date.rewind({month: n || 1});
    this.reload()
  }

  // advance a month on the calendar
  this.next = function(n) {
    this.date.advance({month: n || 1});
    this.reload()
  }

  // get events from backend
  this.fetchEvents = function() {
    request = $http({
      method: "get",
      url: "api/service/calendar"
    });

    return request;
  }

  // format the data correctly so it can be easily displayed
  this.createMonth = function(events) {
    date = this.date.beginningOfMonth()
    last = date.clone().rewind({month: 1})
    next = date.clone().advance({month: 1})

    month = []

    for (ct=0; ct < 42; ct++) {

      // create one day
      item = {events: []}
      day = date.clone().advance({day: ct - date.getWeekday()})

      // new
      if ( (ct - date.getWeekday()+1) > date.daysInMonth()) {
        item.classes = "new"
        item.day = ct - date.getWeekday()+1 - date.daysInMonth()

      // current
      } else if ( ct+1 > date.getWeekday() ) {
        item.classes = "current"
        item.day = ct - date.getWeekday()+1

      // old
      } else {
        item.classes = "old"
        item.day = last.daysInMonth() - date.getWeekday() + ct + 1
      }

      // add events
      events.each(function(evt) {
        if (  Date.create(evt.when).format('{Month} {d}, {yyyy}') == day.format('{Month} {d}, {yyyy}')  ) {
          item.events.push(evt)
        }
      });

      // append to array
      month.push(item)
    }

    return {month: month, title:date.format("{Month} {yyyy}")};
  }

  // reload all events
  this.reload = function() {
    // get all calendar events
    this.fetchEvents().success(function(data, status, headers, config) {
      this.events = data;
      root.eventsInMonth = root.createMonth(data)
    });
  }
  this.reload()

  // auto update
  $interval(function(){
    root.reload()
  }, 5000)

});