//frontend development goes here
var app = angular.module('app', []);

$("#content").hide();
$("#dropdown").hide();
var params = getHashParams();
var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}
if (access_token) {
    $("#login").hide();
    $("#content").show();
    $("#dropdown").show();
}


//for dropdown part
app.controller('dropdown',function ($scope,$http) {
    //request to get all playlist
    var req = {
        method: 'POST',
        url: '/post',
        data: {test_access: access_token}
    };
    $http(req).then(function(data){
        console.log("Success in the dropdown");

        //Song/playlist information
        data = data["data"]["items"];
        $scope.playlists = data;
    }, function(data){
        console.log("fail call post");
    });


});

//for user profile part part
app.controller('user',function ($scope,$http) {
    //use http(req) to get information

    var req = {
        method: 'POST',
        url: '/user',
        data: {test_access: access_token}
    };

    $http(req).then(function(data){
        data = data["data"];
        $scope.nickname=data["display_name"];
        $scope.imgUrl=data["images"][0]["url"];
        $scope.country=data["country"];
        $scope.spotiy_link=data["external_urls"]["spotify"];

    }, function(data){
        console.log("fail call user");
    });



});

//for user_post part
//Song playlist
app.controller('post',function ($scope,$http) {
    //use http(req) to get information
    var req = {
        method: 'POST',
        url: '/post',
        data: {test_access: access_token}
    };

    $http(req).then(function(data){
        //Song/playlist information
        data = data["data"]["items"];
        $scope.playlisturls = data; //playlists to be currently displayed
        $scope.allPlaylists = data; //all playlists (including those not displayed)
    }, function(data){
        console.log("fail call post");
    });

    //Filter posts to match selected playlist from dropdown
    $('#dropdownPL').on('change', function() { //When new dropdown selected
      if(this.value == "All Playlists"){ //If All Playlists selected
        $scope.playlisturls = $scope.allPlaylists
      } else { //If specific playlist selected
        var temp = [];
        for (var i = 0; i < $scope.allPlaylists.length; i++) {
            if($scope.allPlaylists[i].name == this.value){
              temp.push($scope.allPlaylists[i]);
            }
        }
        $scope.playlisturls = temp;
      }
      $scope.$apply();
    });

});

//for comment part
app.controller('comment', function($scope,$http) {
    //init vars
    $scope.playlist="all playlists";
    $scope.text = '';

    //when form is submitted, use $http() to send request to node
    $scope.submit = function() {
        var req = {
            method: 'POST',
            url: '/comment',
            data: { text: $scope.text }
        };
        if ($scope.text) {
            $http(req).then(function(){
                console.log("success");
            }, function(){
                console.log("fail");

            });

        }
    }
});






// javascript to make sure user has authorized the usage of their spotify information


$("#content").hide();
$("#dropdown").hide();
var params = getHashParams();
var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;
function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}
if (access_token) {
    $("#login").hide();
    $("#content").show();
    $("#dropdown").show();
}