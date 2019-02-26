// server init + mods
const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
const port = 3000;

//Allow static files
app.use('/public',express.static('public'));

//Point to HTML file
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

// connect to mongodb
var db = mongoose.connection;
db.on('error', console.error);
mongoose.connect('mongodb://localhost/mychat');

// mongodb schemas
var chatMessage = new mongoose.Schema({
    username: String,
    message: String
});
var Message = mongoose.model('Message', chatMessage);

// user connected even handler
io.on('connection', function(socket){

    // log & brodcast connect event
    console.log('a user connected');

    // log disconnect event
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    // message received event handler
    socket.on('message', function(msg){
        // log chat msg
        console.log('message: ' + msg);

        // broadcast chat msg to others
        socket.broadcast.emit('message', msg);

        // save message to db
        var message = new Message ({
            message : msg
        });
        message.save(function (err, saved) {
            if (err) {
                return console.log('error saving to db');
            }
        })
    });
});


app.listen(port, () => console.log('Example app listening on port ' + port));