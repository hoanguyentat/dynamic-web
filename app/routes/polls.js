var express = require("express");
var router = express.Router();
var Polls = require("../models/polls.js");
var Users = require("../models/users.js")
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })

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
        res.render("polls/index", {polls: polls, user_name: user_name, title: 'All Polls'});
    });
   
})

router.get('/my-polls',isLoggedIn, function(req, res){
    Polls.find({user_id: req.user.github.id}).exec(function (err, polls) {
        if(err){throw err;}
        var user_name = req.user ? req.user.github.displayName : null;
        res.render('polls/index', {polls: polls, user_name: user_name, title: "Your Polls"});
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

router.get('/delete/:id',isLoggedIn, function(req, res){
    var params = req.params;
    if(!params) res.send("Khong thanh cong")
    else{
        Polls.findOne({_id : params.id}).exec(function(err, poll) {
            if(err){
                res.status(500);
                res.send("Loi khong xac dinh");
            }
            
            if(poll.user_id == req.user.github.id){
                Polls.remove({_id : poll.id}, function (err, result) {
                    if(err){
                        res.status(500);
                        res.send("Xoa khong thanh cong");
                        res.redirect("/polls/" + poll.id);
                    } else{
                        res.redirect("/polls");
                    }
                });
            } else{
                alert("Ban khong co quyen xoa mau du lieu nay")
                res.redirect("/polls/" + poll.id);
            }
        })
    }
})

router.post('/vote-polls/:id',isLoggedIn, function(req, res){
    var vote = req.body;
    console.log(vote);
    var voteId = req.params.id;
    var myoption = vote.myoption
    var votelabel = vote.votelabel;
    // Polls.findOneAndUpdate({_id : voteId})
    
    if(!(vote.hasOwnProperty("voteContent") || vote.hasOwnProperty("myoption"))){
        res.status(500);
        res.send("Choose option! please");
        res.redirect("/polls/" + voteId);
    } else{
        if(vote.myoption !== ""){
            console.log("vote here!");
            Polls.findOneAndUpdate({_id: voteId}, {$push: {options: {voteContent: myoption, count : 1}}})
                .exec(function (err, result) {
                    if(err){
                        throw err;
                    } 
                    res.redirect("/polls/" + voteId)
                });
            
        } else{
            Polls.findOneAndUpdate({_id: voteId})
                .exec(function (err, poll) {
                    console.log(poll);
                    if(err){
                        throw err;
                    }
                    for (var i = 0; i < poll.options.length; i++){
                        if(poll.options[i].voteContent == votelabel){
                            poll.options[i].count += 1;
                        }
                    }
                    poll.save();
                    res.redirect("/polls/" + voteId)
                });
        }
        // res.send(vote);
    }
})

router.get('/:id', function(req, res){
    Polls.findOne({_id: req.params.id}).exec(function(err, poll){
        if(err){
            throw err;
        }
        var user_name = req.user ? req.user.github.displayName : null;
        res.render('polls/details', {poll: poll, user_name: user_name});
    })
})

module.exports = router