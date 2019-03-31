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

//for comment part
app.controller('comment', function($scope,$http) {
    //init vars
    $scope.playlist="Default playlist";
    $scope.text = '';
    $scope.placeholder="Leave your thought here";

    //when form is submitted, use $http() to send request to node
    $scope.submit = function() {
        var req = {
            method: 'POST',
            url: '/comment',
            data: { test: $scope.text }
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

//for user profile part part
app.controller('user',function ($scope,$http) {
    //use http(req) to get information, should at least contain these 3 fields
    $scope.nickname="";
    $scope.imgUrl="";
    $scope.country="cn";
    $scope.spotiy_link="";

    var req = {
        method: 'POST',
        url: '/user',
        data: {test_access: access_token}
    };

    $http(req).then(function(data){
        console.log("success call user");
        console.log(data);

    }, function(data){
        console.log("fail");

    });



});

//for user_post part
app.controller('post',function ($scope,$http) {
    //use http(req) to get information, should at least contain these 3 fields
    $scope.msg="test message";
    $scope.user="Alice";
    $scope.image="";

});

//for dropdown part
app.controller('dropdown',function ($scope,$http) {
    //hard coded for testing frontend, a similar result should be return like this
    $scope.options=["a","b","c"];

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





