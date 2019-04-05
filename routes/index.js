//required utilities for this project
var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var request = require('request'); // "Request" library

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Log in' });
});


router.post('/user',function(req,res){
  var access_token = req.body.test_access;
  var url = 'https://api.spotify.com/v1/me';
 
  //Spotify API for user info
  request(url, { json: true, headers: {'Authorization': 'Bearer ' + access_token} }, (err, response, body) => {
    if(err) { 
      return console.log(err)
    } else {
      res.send(body);
    }

  });
});

router.post('/post',function(req,res){
  var access_token = req.body.test_access;
  var url = 'https://api.spotify.com/v1/me/playlists';
 
  //Spotify API for user info
  request(url, { json: true, headers: {'Authorization': 'Bearer ' + access_token} }, (err, response, body) => {
    if(err) { 
      return console.log(err)
    } else {
      res.send(body);
    }

  });
});

router.post('/tracks', function(req, res){
  var access_token = req.body.test_access;
  var url = req.body.href;
  var playlist = req.body.playlist;
  request(url, { json: true, headers: {'Authorization': 'Bearer ' + access_token} }, (err, response, body) => {
    if(err){
      return console.log(err);
    } else {
      // console.log(body["items"][0]["added_at"]);
      // console.log(body["items"][1]["added_at"]);
      allTracks = [];
      if(body["items"].length >= 1){
        allTracks.push({
                        "playlist": playlist, 
                        timestamp: body["items"][0]["added_at"], 
                        songName: body["items"][0]["track"]["name"],
                        albumCover: body["items"][0]["track"]["album"]["images"][0]["url"],
                        user: body["items"][0]["added_by"]["id"]
                    });
      }
      if(body["items"].length >= 2){
        allTracks.push({
                        "playlist": playlist, 
                        timestamp: body["items"][1]["added_at"], 
                        songName: body["items"][1]["track"]["name"],
                        albumCover: body["items"][1]["track"]["album"]["images"][0]["url"],
                        user: body["items"][1]["added_by"]["id"]
                    });
      }
      if(body["items"].length >= 3){
        allTracks.push({
                        "playlist": playlist, 
                        timestamp: body["items"][2]["added_at"], 
                        songName: body["items"][2]["track"]["name"],
                        albumCover: body["items"][2]["track"]["album"]["images"][0]["url"],
                        user: body["items"][2]["added_by"]["id"]
                    });
      }
      res.send(allTracks);
    }
  });
});

//backend comment dev goes here, should return data to frontend
router.post('/comment',function(req,res){
// req.body.test  is the comment message
  console.log(req.body.text);

});


var client_id = '1d919a5a30ef4be69dd04141c730e3a9'; // Your client id
var client_secret = 'a2c8d9a1fe2b44e6a0d6012c2e0a9222'; // Your secret
var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri
var stateKey = 'spotify_auth_state';

router.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read playlist-read-collaborative playlist-read-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        show_dialog: true,
        state: state
      }));
  // console.log(res);
});
router.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
      } else {
        res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
      }
    });
  }
});
router.get('/refresh_token', function(req, res) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
module.exports = router;
