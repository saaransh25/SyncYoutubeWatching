var express = require('express');
var router = express.Router();
var room=require('../models/rooms.js');
var DEFAULT_VIDEO='M7lc1UVf-VE';

router.get('/', function(req, res) {
	room.find({}, function (err,roomtorender) {
		if (err) res.render('error', {message: 'Rooms not found', error: {}});
		else {
			res.render('index', {rooms: roomtorender});
		}
	});
});

router.get('/show/:roomid',function(req,res) {
	roomid=req.params.roomid;
	room.findOne({name: roomid}, function (err,roomtorender) {
		if (roomtorender) {
			roomobj={};
			roomobj.name=roomtorender.name;
			roomobj.state=roomtorender.state;
			if (roomobj.state==1) {//Player is playing
				roomobj.seek=roomtorender.seek+Math.abs(Date.now()-roomtorender.updated_at)/1000;
			}
			else {
				roomobj.seek=roomtorender.seek;
			}
			roomobj.videoid=roomtorender.videoid;
			res.render('show', {room: roomobj});
		}
		else {
			res.render('error', {message: "Room not found!", error: {}});	
		}
	});
});

router.get('/new', function(req,res) {
	res.sendfile('./public/new.html');
});

router.get('/edit/:id', function(req,res) {

});

router.post('/create', function(req, res) {
	roomid=req.body.name;
	room.find({name: roomid}, function (roomexists) {
		if (roomexists) {
			res.render('error', {message: "This room id already exists", error: {}});
		}
		else {
			//Create new room
			var newroom=new room({name: roomid, videoid: DEFAULT_VIDEO, seek: 0, state: 1});//State=1 means Player is playing
			newroom.save(function (err, newroom) {
				if (err) res.render('error', {message: "Something went wrong", error: {}});
				else {
					res.redirect('show/'+roomid);
				}
			});			
		}
	});
});

router.put('/update', function(req, res) {

});

router.delete('/destroy', function(req,res) {
	roomid=req.body.roomid;
	room.remove({name: roomid}, function (err) {
		if (err) console.log("Unable to delete room");
		else console.log("Room: "+roomid+"successfully deleted");
	})

});

router.post('/destroy', function(req,res) {
	roomid=req.body.roomid;
	room.remove({name: roomid}, function (err) {
		if (err) console.log("Unable to delete room");
		else {
			console.log("Room: "+roomid+"successfully deleted");
			res.redirect('/rooms');
		}
	})

});

module.exports = router;
