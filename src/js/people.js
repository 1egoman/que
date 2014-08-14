// People controller
// This controls the services -> people builtin service

angular.module("QueApp").controller('peopleController', function($http){

  var root = this;
  this.tag = -1;

  this.person = undefined;
  this.people = []

  // get a list of tags used by all the people
  this.getAllTags = function() {
    tags = []
    this.people.each(function(p){
      p.tags.each(function(t){
        tags.push(t)
      })
    }).sortBy()

    return tags.unique()
  }

  // select the tag of the specified index
  this.chooseTag = function(index) {
    this.tag = index;
  }

  // get all people with the selected tag
  this.getPeopleForList = function() {
    
    // get a list of all tags
    alltags = this.getAllTags()

    return this.people.filter(function(p){
      return root.tag == -1 || p.tags.indexOf( alltags[root.tag] ) !== -1;
    }).sortBy()
  }

  // fetch events from server
  this.fetchPeople = function() {
    request = $http({
      method: "get",
      url: "api/service/people"
    });

    return request;
  }

  // reload all people from server
  this.reload = function() {
    // load services
    this.fetchPeople().success(function(data, status, headers, config) {
      root.people = data.people
    });
  };
  // reload all
  this.reload();

});