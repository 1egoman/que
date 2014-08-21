angular.module("QueApp").controller('notificationsController', function($scope, $rootScope){
  $rootScope.allNotifications = [
    // {
    //   content: "What time is it?",
    //   icon: "glyphicon-time"
    // }
  ]

  console.log($scope)

  // remove notification
  this.dismiss = function(one) {
    setTimeout(function(){
      $scope.allNotifications.remove(one);
      $scope.$apply();
    }, 750)
  }
})




// for dissmissing
$(document).ready(function(){
  $("div.notif-list .notif").on('click', function(){
    var that = this;
    d = $(this).parent().width()
    $(this).animate({marginLeft: d*2, height: 0}, {duration: 750, complete: function(){$(that).remove()}})
  })
})