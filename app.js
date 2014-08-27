var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var rooms = require('./routes/rooms');

var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/rooms', rooms);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function(){
    console.log('listening on *:3000');
});

var room=require('./models/rooms.js');


io.on('connection',function (socket) {
 
    socket.on('connectme', function(room) {
      socket.join(room);
    });

    socket.on('updatestate', function(state) {
      socket.broadcast.to(state.room).emit('updatestate',state.state);
      room.findOne({name: state.room}, function (err, roomobj) {
        if (err) console.log("room not found");
        else {
          if (roomobj) {
            roomobj.state=state.state;
            roomobj.seek=state.seek;
            roomobj.save();
          }
          else {
            console.log("Room not found");
          }
        }
      });      
    });

    socket.on('updatevideo', function(video) {
      socket.broadcast.to(video.room).emit('updatevideo',video.videoid);
      room.findOne({name: video.room}, function (err, room) {
        if (err) console.log("room not found");
        else {
          room.videoid=video.videoid;
          room.seek=0;
          room.state=1;
          room.save();
        }
      });
    });

    socket.on('updateseekto', function(seekto) {
      socket.broadcast.to(seekto.room).emit('updateseekto',seekto.seekto);
      room.findOne({name: video.room}, function (err, room) {
        if (err) console.log("room not found");
        else {
          room.videoid=seekto.videoid;
          room.seek=seekto.seek;

          room.save();
        }
      });
    });

});




io.on('disconnection',function(socket) {
  clients.remove(socket);
})


module.exports = app;
