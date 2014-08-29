angular.module("QueApp").controller("listController", function() {


  this.lists = [{
    name: "Bedroom",
    items: [
      {
        name: "Light",
        deviceTag: "bla",
        type: "switch",
        state: false
      },
      {
        name: "Pump",
        deviceTag: "bla",
        type: "switch",
        state: false
      },
      {
        name: "",
        state: false
      }
    ]
  },
  {
    name: "Hydroponics",
    items: [
      {
        name: "Grow Light",
        state: false
      },
      {
        name: "Pump",
        state: true
      },
      {
        name: "",
        state: false
      }
    ]

  },
  {
    name: "",
    items: [{
      name: "",
      state: false
    }]
  }]


  this.turnAll = function(index, state) {
    this.lists[index].items.each(function(i,ct){
      i.state = state;
    });
  }

  this.getLastItem = function(room) {
    return room.items[room.items.length-1]
  }

  this.getLastRoom = function() {
    return this.lists[this.lists.length-1]
  }

  this.publishItem = function(room) {
    $http({
      method: 'POST',
      url: '/api/query',
      data: JSON.stringify({ query:{text: "add " + this.getLastItem(room).name + " to " + room.name} }),
      headers: { 'Content-Type': 'application/json' }  // pass as json
    }).success(function(data) {
      room.items.push({name: "", state: false})
    });
  }

  this.publishRoom = function() {
    $http({
      method: 'POST',
      url: '/api/query',
      data: JSON.stringify({ query:{text: "create list named " + this.getLastRoom().name} }),
      headers: { 'Content-Type': 'application/json' }  // pass as json
    }).success(function(data) {
      this.lists.push({name: "", items: [{name: "", state: false}]});
    });
  }


});