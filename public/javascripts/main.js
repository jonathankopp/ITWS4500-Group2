//frontend development goes here
var app = angular.module('app', []);

$("#content").hide();
$("#dropdown").hide();
$("#commentContent").hide();

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
        console.log($scope.playlists);
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
        cur_user=data["display_name"];
    }, function(data){
        console.log("fail call user");
    });



});

//for user_post part
//Song playlist
app.controller('post',function ($scope,$http) {

    //Get recently added tracks for each playlist
    $scope.myPromise = (playlist) => {
        return new Promise((resolve, reject) => {
            var allTracks = [];
            var count = 0;
            //Loop through list of playlists
            for (var i = 0; i < playlist.length; i++) {
                var playlistName = playlist[i]["name"];
                var attr = {
                    method: 'POST',
                    url: '/tracks',
                    data: {test_access: access_token, href: playlist[i]["tracks"]["href"], "playlist": playlistName}
                };

                //Send post request to backend for Spotify API call
                //Return list of recently added tracks for each playlist
                $http(attr).then(function(data){
                    data = data["data"];
                    console.log("success track post");
                    count++;
                    allTracks = allTracks.concat(data); //Concatenate all tracks from all playlists into one array
                    if(count == playlist.length){ //If we are at the last playlist in list, return track array
                        resolve(allTracks);
                    }
                }, function(data){
                    console.log("fail track post");
                });
            }
        });
    }

    //Wait til post request/API call finished, & all tracks put in array
    var callMyPromise = async (data) => {
        var result = await ($scope.myPromise(data));
        return result;
    }

    $scope.organize = function (data){
        for (var i = data.length - 1; i >= 0; i--) {
            if(data[i]["user"] == ""){
                data[i]["user"] = "Spotify";
            }
            if(data[i]["user"].length > 15){
                data[i]["user"] = "Someone";
            }
        }
        console.log(data);
        return data;
    }

    //use http(req) to get information
    var req = {
        method: 'POST',
        url: '/post',
        data: {test_access: access_token}
    };

    //Get list of playlists that user follows
    $http(req).then(function(data){
        //Song/playlist information
        data = data["data"]["items"];
        // $scope.playlisturls = data; //playlists to be currently displayed
        // $scope.allPlaylists = data; //all playlists (including those not displayed)

        //Get individual track data
        var tracks = [];
        //Use list of playlists to get list of recently added tracks for each playlist using API
        //Wait til API call finished
        callMyPromise(data).then(function(result){
            tracks = result;
            console.log(tracks);
            $scope.playlisturls = $scope.organize(tracks);
            $scope.allPlaylists = $scope.organize(tracks);
            $scope.$apply();
        });
    }, function(data){
        console.log("fail call post");
    });

    //Filter posts to match selected playlist from dropdown
    $('#dropdownPL').on('change', function() { //When new dropdown selected
        $('#commentWelcome').hide();
        $('#commentContent').show();
      if(this.value == "All Playlists"){ //If All Playlists selected
        $scope.playlisturls = $scope.allPlaylists
      } else { //If specific playlist selected
        var temp = [];
        for (var i = 0; i < $scope.allPlaylists.length; i++) {
            if($scope.allPlaylists[i].playlist == this.value){
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
    
    // $http(req).then(function(data){
    //     data = data["data"];
    //     $scope.nickname=data["display_name"];
    // }, function(data){
    //     console.log("fail call user");
    // });
    //init vars
    $scope.currentplaylist="all playlists";
    $scope.user="test";
    $scope.time="2019";
    $scope.text = '';
    //when form is submitted, use $http() to send request to node
    $scope.submit = function() {
        var req = {
            method: 'POST',
            url: '/insertComment',
            data: { text: $scope.text, playlist: $scope.currentplaylist, username: $scope.nickname, }
        };
        if ($scope.text) {
            $http(req).then(function(){
                console.log("success");
            }, function(){
                console.log("fail");
            });
        }
    };
    //Filter posts to match selected playlist from dropdown
    $('#dropdownPL').on('change', function() { //When new dropdown selected
        if(this.value == "All Playlists"){ //If All Playlists selected
            //don't show comments
        } else { //If specific playlist selected
            $scope.currentplaylist = this.value;
            var req = {
                method: 'POST',
                url: '/pullComment',
                data: {test_access: access_token, playlist: $scope.currentplaylist}
            };
            $http(req).then(function(data){
                console.log(data);
            }, function(data){
                console.log("fail call user");
            });

        }
        $scope.$apply();
    });
});
