//frontend development goes here
var app = angular.module('app', []);

$("#content").hide();
$("#dropdown").hide();
$("#commentContent").hide();
$("#comment-submit").hide();
$("#comment-title").hide();
$("#logout").hide();

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
    $("#logout").show();
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
        $('#comment-submit').show();
        $('#comment-title').show();
      if(this.value == "All Playlists"){ //If All Playlists selected
        $scope.playlisturls = $scope.allPlaylists
          $('#commentWelcome').show();
          $('#commentContent').hide();
          $('#comment-submit').hide();
          $('#comment-title').hide();
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
    var req = {
        method: 'POST',
        url: '/user',
        data: {test_access: access_token}
    };
    $http(req).then(function(data){
        data = data["data"];
        $scope.nickname=data["display_name"];
    }, function(data){
        console.log("fail call user");
    });
    //init vars
    $scope.currentplaylist="all playlists";
    $scope.user="test";
    $scope.time="2019";
    $scope.text = '';
    $scope.comments=[];
    //when form is submitted, use $http() to send request to node
    $scope.submit = function() {
        var req = {
            method: 'POST',
            url: '/insertComment',
            data: { text: $scope.text, playlist: $scope.currentplaylist, username: $scope.nickname, }
        };
        if ($scope.text) {
            $http(req).then(function(data){
                if (data.data==="ok"){
                    let d=new Date();

                    $("#spanComment").html("<p>"+$scope.text+"</p>\n" +
                        "<p class=\"text-right\">"+$scope.nickname+", <i>"+
                        d.getFullYear()+"/"+d.getMonth()+"/"+d.getDate()+" "
                        +d.getHours()+":"+d.getMinutes()+
                        ":"+d.getSeconds()
                        +"</i></p>");
                    $("#spanComment").show();
                }
            }, function(){
                console.log("fail to insertComment");
            });
        }
    };
    //Filter posts to match selected playlist from dropdown
    $('#dropdownPL').on('change', function() { //When new dropdown selected
        if(this.value == "All Playlists"){ //If All Playlists selected
            //don't show comments
        } else { //If specific playlist selected
            console.log("dropdownchange: "+this.value);
            $scope.currentplaylist = this.value;
            var req = {
                method: 'POST',
                url: '/pullComment',
                data: {test_access: access_token, playlist: $scope.currentplaylist}
            };
            $http(req).then(function(data){
                $scope.comments=data.data;
            }, function(data){
                console.log("fail call pullComment");
            });

        }
        $scope.$apply();
    });
});


function formatDate(date, format, utc) {
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function ii(i, len) {
        var s = i + "";
        len = len || 2;
        while (s.length < len) s = "0" + s;
        return s;
    }

    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc) {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
};