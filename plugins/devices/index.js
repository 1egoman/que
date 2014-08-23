var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /add device .*;.*;(.* ?)*/gi,
    then: function(query, services, callback) {
      // get parts
      console.log(1)
      parts = query.substr(11).split(';')

      // add to service
      all = new services.devices(services).getDevices()
      all.push({name: parts[0], ip: parts[1], tags: parts[2].split(' ')})
      new services.devices(services).putDevices(all)

      // return success
      callback("OK")
    }
  },
  {
    validate: /del device .*/gi,
    then: function(query, services, callback) {
      // get tags
      tags = query.substr(11).split(' ')

      // add to service
      devices = new services.devices(services)
      d = devices.getDevices()
      d.remove( devices.findByTag(tags[0])[0] )
      devices.putDevices(d)

      // return success
      callback("OK")
    }
  }
]

exports.services = {
  devices: function(services) {

    var root = this;

    // get devices
    this.getDevices = function() {
      return new services.persist("devices").get().devices || [];
    }

    // put devices
    this.putDevices = function(devices) {
      return new services.persist("devices").put({devices: devices});
    }

    // get list of devices
    this.getData = function() {
      return {devices: this.getDevices()}
    }

    // look for devices that are tagged with the specified tag
    this.findByTag = function(tag) {
      return this.getDevices().filter(function(device){
        return device.tags.indexOf(tag) !== -1
      })
    }

  }
}