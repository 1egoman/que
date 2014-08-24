angular.module("QueApp").controller("DeviceController", function($scope, $http, $interval) {

  // all devices will be put into here
  this.devices = []

  $scope.currentDevice = {
    name: "",
    ip: "",
    tags: ""
  }

  var root = this;

  this.addDevice = function(current) {

    // server query
    $http({
      method: 'POST',
      url: '/api/query',
      data: JSON.stringify({ query:{text: "add device " + current.name + ";" + current.ip + ";" + current.tags} }),
      headers: { 'Content-Type': 'application/json' }  // pass as json
    })

    // get tags
    current.tags = current.tags.split(' ')

    // add to all devices
    this.devices.push(current);

    // clear out current device
    $scope.currentDevice = {
      name: "",
      ip: "",
      tags: ""
    }
  }

  this.delDevice = function(current) {

    // server query
    $http({
      method: 'POST',
      url: '/api/query',
      data: JSON.stringify({ query:{text: "del device " + current.tags} }),
      headers: { 'Content-Type': 'application/json' }  // pass as json
    })

    // get tags
    current.tags = current.tags.split(' ')
  }

  this.reload = function() {
    // get all devices
    $http({method: 'GET', url: '/api/service/devices'}).success(function(data) {
      root.devices = data.devices
    });
  }
  this.reload()
  
  // auto update
  $interval(function(){
    root.reload()
  }, 5000)

})
