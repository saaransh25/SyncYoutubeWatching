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
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';
var mongoose = require('mongoose');
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

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
var httpport = process.env.PORT || 3000;
var io = require('socket.io')(http);

http.listen(httpport, function(){
    console.log('listening on *:'+httpport);
});

var room=require('./models/rooms.js');


io.on('connection',function (socket) {
 
    socket.on('connectme', function(room) {
      socket.join(room);
    });


    socket.on('updatestate', function(state) {
      socket.broadcast.to(state.room).emit('updatestate',{state: state.state});
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

    socket.on('updateseek', function(seekto) {
      socket.broadcast.to(seekto.room).emit('updateseek',seekto);
      room.findOne({name: seekto.room}, function (err, room) {
        if (err) console.log("room not found");
        else {
          room.seek=seekto.seek;
          room.save();
        }
      });
    });

});

module.exports = app;