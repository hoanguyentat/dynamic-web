'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Polls = new Schema({
	content: String,
	user_id: String,
    options: [{
    	voteContent: String,
    	count: Number
    }],
    
});

module.exports = mongoose.model('Polls', Polls);
