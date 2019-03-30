$(document).ready(function(){
    $("#content").hide();
    var params = getHashParams();
    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (access_token) {
        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {
                $("#login").hide();
                $('#content').show();
            }
        });
    }else{
    }

});


function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}


var app = angular.module('app', []);
app.controller('comment', function($scope,$http) {

    $scope.name="jon";
    $scope.text = 'write a comment';



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






