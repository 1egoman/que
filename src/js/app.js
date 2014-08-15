var app = angular.module("QueApp", []);

// controls user navigation (what page they are on)
app.controller('navController', function($http) {

  // current page information
  this.page = {}

  this.searchData = ""
  var root = this;

  this.toSearch = function() {
    // set page data
    this.page = {
      name: "Search",
      id: "main-search"
    }

  };
  this.toSearch()

  this.toOverview = function() {
    // set page data
    this.page = {
      htmlPath: "overview.html",
      name: "Overview",
      id: "main-overview"
    }

  };

  this.toServices = function() {
    // set page data
    this.page = {
      htmlPath: "services.html",
      name: "Services",
      id: "main-services",
      sidebar: true
    }

  };

  this.toPlugins = function() {
    // set page data
    this.page = {
      name: "Plugins",
      id: "main-plugins",
      sidebar: true
    }

  };

  // perform a server query
  this.search = function() {
    $http({
      method: 'POST',
      url: '/api/query',
      data: JSON.stringify({ query:{text: this.searchData} }),
      headers: { 'Content-Type': 'application/json' }  // pass as json
    }).success(function(data) {
      this.searchData = ''
      root.page = {
        name: "Search Results",
        id: "search",
        sidebar: false,
        results: data.OK || data.ERR || data.NOHIT
      }
    });

  }.throttle(100)

  this.fillSearch = function(s) {
    this.searchData = s;

    // go to search page
    this.toSearch()
    $("input.search-box").focus()
  }

});

// for services
app.controller('serviceController', function($scope, $sce, $http){

  // services arrays
  this.services = [];
  this.lookin = true;

  var root = this;

  // get reference to active service (from builtins or normal services)
  this.getActiveService = function() {
    return ( this.lookin == false ? this.services[this.current] : this.builtins[this.current] ) || {name: null, html: ""};
  }

  // get list of services from the server
  this.getServiceList = function() {
    
    request = $http({
      method: "get",
      url: "api/services"
    });

    return request;
  }

  // change service to the one at index 'id'
  this.changeService = function(id, s) {

    // get item in builtin array
    if (s == true) {
      this.current = id;
      this.lookin = true;

      // set the service html to be empty
      $scope.serviceHtmlString = ''; 
      return
    }

    // otherwise, just look in normal services
    this.current = id;
    this.lookin = false; 

    // change active html
    serviceHtml = this.getActiveService().html
    $scope.serviceHtmlString = $sce.trustAsHtml(serviceHtml);
  }

  // show settings page
  this.showSettings = function() {
    this.lookin = true
    this.current = -1
  }
  
  // reload all services from the server
  this.reloadServices = function() {
    // load services
    this.getServiceList().success(function(data, status, headers, config) {

      // filter out non-displayable services
      root.services = data.filter(function(e) {
        return e.html != null;
      });

      // add builtin services
      root.builtins = [{
        name: "calendar",
        title: "Calendar",
        html: "builtin",
        icon: "glyphicon-calendar"
      },
      {
        name: "people",
        title: "People",
        html: "builtin",

        icon: "glyphicon-user"
      }]

      // update services
      root.changeService(0, true);
    });
  };
  // reload services
  this.reloadServices();

});

// manages query history
app.controller("HistorianController", function($http, $interval){
  
  // history
  this.history = []
  var root = this;

  // get list of services from the server
  this.getHistory = function() {
    
    request = $http({
      method: "get",
      url: "api/history"
    });

    return request;
  }


  // reload history
  this.reload = function() {
    root.getHistory().success(function(data){
      root.history = data.history
    })
  }

  // initial
  this.reload()

  // auto update
  $interval(function(){
    root.reload()
  }, 5000)

})


// navbar header
app.directive('navHeader', function(){
  return {
    restrict: 'E',
    templateUrl: "nav-header.html"
  };
});

// register events
app.directive('event', function() {
    return {
        link: function($scope, element, attrs) {
            // Trigger when number of children changes,
            // including by directives like ng-repeat
            var watch = $scope.$watch(function() {
                return element.children().length;
            }, function() {
                // Wait for templates to render
                $scope.$evalAsync(function() {

                  $('.event').popover({
                      offset: 10,
                      trigger: 'hover',
                      html: true,
                      placement: 'top',
                      animate: true,
                      container: 'body'
                  });

                });
            });
        },
    };
});