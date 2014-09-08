var mongoose = require('mongoose');
var roomsSchema=mongoose.Schema({
  	name: {type: String},
  	description: String,
  	videoid: String,
  	seek: Number,
  	state: Number,
  	updated_at: { type: Date}
});

roomsSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  next();
});

module.exports = mongoose.model('rooms',roomsSchema);  