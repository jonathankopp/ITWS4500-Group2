//required utilities for this project
var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var request = require('request'); // "Request" library
var MongoClient = require('mongodb').MongoClient; //mongodb needed lib
const uri = "mongodb+srv://koppej:Mets2014@test1-5846w.mongodb.net/test?retryWrites=true"; //link for database connection

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

      var noAlbumCover = "/images/coverArt.jpg";
      var allTracks = [];
      var length = body["items"].length;
      if(body["items"].length >= 1){
        var data = ["", "", "", ""];
        data[0] = body["items"][length-1]["added_at"] ? body["items"][length-1]["added_at"] : "";
        data[1] = body["items"][length-1]["track"]["name"] ? body["items"][length-1]["track"]["name"] : "Unkown";
        if(typeof body["items"][length-1]["track"]["album"]["images"][0] == 'undefined'){
          data[2] = noAlbumCover;
        }else{
          data[2] = body["items"][length-1]["track"]["album"]["images"][0]["url"];         
        }
        data[3] = body["items"][length-1]["added_by"]["id"] ? body["items"][length-1]["added_by"]["id"] : "";
        allTracks.push({
                        "playlist": playlist, 
                        timestamp: data[0], 
                        songName: data[1],
                        albumCover: data[2],
                        user: data[3]
                    });
      }
      if(body["items"].length >= 2){
        var data = ["", "", "", ""];
        data[0] = body["items"][length-2]["added_at"] ? body["items"][length-2]["added_at"] : "";
        data[1] = body["items"][length-2]["track"]["name"] ? body["items"][length-2]["track"]["name"] : "Unkown";
        if(typeof body["items"][length-2]["track"]["album"]["images"][0] == 'undefined'){
          data[2] = noAlbumCover;
        }else{
          data[2] = body["items"][length-2]["track"]["album"]["images"][0]["url"];         
        }     
        data[3] = body["items"][length-2]["added_by"]["id"] ? body["items"][length-2]["added_by"]["id"] : "";
        allTracks.push({
                        "playlist": playlist, 
                        timestamp: data[0], 
                        songName: data[1],
                        albumCover: data[2],
                        user: data[3]
                    });
      }
      if(body["items"].length >= 3){
        var data = ["", "", "", ""];
        data[0] = body["items"][length-3]["added_at"] ? body["items"][length-3]["added_at"] : "";
        data[1] = body["items"][length-3]["track"]["name"] ? body["items"][length-3]["track"]["name"] : "Unkown";
        if(typeof body["items"][length-3]["track"]["album"]["images"][0] == 'undefined'){
          data[2] = noAlbumCover;
        }else{
          data[2] = body["items"][length-3]["track"]["album"]["images"][0]["url"];         
        }
        data[3] = body["items"][length-3]["added_by"]["id"] ? body["items"][length-3]["added_by"]["id"] : "";
        allTracks.push({
                        "playlist": playlist, 
                        timestamp: data[0], 
                        songName: data[1],
                        albumCover: data[2],
                        user: data[3]
                    });
      }
      res.send(allTracks);
    }
  });
});

//backend comment dev goes here, should return data to frontend
router.post('/insertComment',function(req,res){
// req.body.test  is the comment message
  console.log(req.body.text);
  console.log(req.body.playlist);
  console.log(req.body.username);
  var comment = {user: req.body.username, playlist: req.body.playlist, text: req.body.text, time:Date.now()};
  //connection to the database
  MongoClient.connect(uri,{ useNewUrlParser: true }, function(err, client) {
    if (!err) {
      empty = false;
      console.log("We are connected");
      const collection = client.db("Jukebox").collection("comments");
      //inserting the recently collected comment
      collection.insertOne(comment, function(err, res){
        if(err) throw err;
        console.log("inserted comment: "+comment);
      });
      res.send("ok");
      //closing out the connection
      
    }else{
      console.log(err);
    }
  });
});


router.post('/pullComment',function(req,res){
// req.body.test  is the comment message
  console.log("Pull data"+req.body.playlist);
  MongoClient.connect(uri,{ useNewUrlParser: true }, function(err, client) {
    if (!err) {
      empty = false;
      console.log("We are connected");
      const collection = client.db("Jukebox").collection("comments");
      //inserting the recently collected comment
      var found = collection.find({"playlist": req.body.playlist}).sort({"time":1});
      var data = [];
      found.forEach(function(e){
        data.push(e);
      }).then(function(result){
        client.close();
        res.status(200).send(data);
      });
      //closing out the connection
    }else{
      console.log(err);
    }
  });
});

//



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