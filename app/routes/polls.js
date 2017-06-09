var express = require("express");
var router = express.Router();
var Polls = require("../models/polls.js");
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/login');
	}
}

router.get('/', function(req, res){
    Polls.find().exec(function (err, polls) {
        if(err){ throw err;}
        var user_name = req.user ? req.user.github.displayName : null;
        res.render("polls/index", {polls: polls, user_name: user_name});
    });
   
})

router.get('/my-polls',isLoggedIn, function(req, res){
    Polls.find({user_id: req.user.github.id}).exec(function (err, polls) {
        if(err){throw err;};
        res.render('polls/all', polls);
    });
})

router.get('/add-polls',isLoggedIn, function(req, res){
    res.render("polls/add-poll", {user_name: req.user.github.displayName});
})

router.post('/add-polls',isLoggedIn, function(req, res){
    var poll = new Polls()
    poll.content = req.body.content;
    poll.user_id = req.user.github.id;
    
    var options = req.body.vote_contents.trim().split("\n");
    options.forEach(function (option) {
        if(option.trim().length > 0){
            poll.options.push({
                voteContent: option.trim(),
                count: 0
            });
        };
    });
    poll.save(function (err, poll) {
        if (err) {
            res.send("Not success");
        } else{
            res.redirect("/polls/" + poll._id);
        }
    })
    
})

router.delete('/delete-polls',isLoggedIn, function(req, res){
    res.send("get all polls");
})

router.post('/vote-polls',isLoggedIn, function(req, res){
    res.send("votepolls");
})

router.get('/:id', function(req, res){
    Polls.find({_id: req.params.id}).exec(function(err, poll){
        if(err){
            throw err;
        }
        var user_name = req.user ? req.user.github.displayName : null;
        res.render('polls/details', {poll: poll[0], user_name: user_name});
    })
})

module.exports = router