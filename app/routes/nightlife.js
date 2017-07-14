var express = require("express");
var router = express.Router();
var NightLife = require("../models/nightlife.js");
var Users = require("../models/users.js")
var request = require("request");
var yelp = require("yelp-fusion");

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
    var user_name = req.user ? req.user.github.displayName : null;
    res.render("nightlife/index", {user_name: user_name, data : null, location: null});
});

router.post('/', function (req, res) {
    var user_name = req.user ? req.user.github.displayName : null;
    var params = req.body;
    
    NightLife.findOne({location : (params.location).toLowerCase()}).exec(function(err, result){
        if(err){
            throw err;
            // console.log(err)
        }
        else {
            if(result == null || result.length == 0 ){
                const searchRequest = {
                    categories : "bars",
                    location : params.location
                };
                
                var url = "https://api.yelp.com/v3/businesses/search?categories=bars&location=";
                
                const client_id = process.env.YELP_CLIENTID;
                const client_secret = process.env.YELP_CLIENTSECRET;
                
                yelp.accessToken(client_id, client_secret).then(response => {
                    const client = yelp.client(response.jsonBody.access_token);
                    
                    client.search(searchRequest).then(response => {
                        const data = response.jsonBody.businesses;
                        // console.log(data)
                        for(var i = 0; i < data.length; i++){
                            data[i].going = [];
                        }
                        // console.log(data);
                        var nightlife = new NightLife();
                        nightlife.location = params.location;
                        nightlife.data = data;
                        nightlife.save(function (err, nightlife) {
                            console.log(err);
                        })
                        res.render("nightlife/index", {user_name: user_name, data : data, location: params.location})
                    })
                });
            } else{
                console.log("data in db")
                res.render("nightlife/index", {user_name: user_name, data : result.data, location: params.location});
            }
        }
    })
})

router.post("/going",isLoggedIn, function (req, res) {
    var params = req.body;
    console.log(params);
    var locationad = req.body.location;
    var barId = req.body.barId;
    var user_id = req.user.github.id;
    var user_name = req.user.github.displayName;
    
    NightLife.findOne({location : locationad}).exec(function (err, result) {
        if(err){
            throw err;
        }
        for(var i = 0; i < result.data.length; i++){
            if(result.data[i].id == barId){
                if(result.data[i].going.indexOf(user_id) != -1){
                    // delete user 
                    console.log("user in going");
                    result.data[i].going.splice(result.data[i].going.indexOf(user_id), 1);
                } else{
                    // user is going to bar
                    console.log("user not in going");
                    result.data[i].going.push(user_id);
                    console.log(result.data[i]);
                }
            }
        }
        result.save(function (err, success) {
            if(err){
                throw err;
            }
            console.log("Da luu lai db");
        });
        res.redirect("/nightlife")
    })
    
})



module.exports = router