var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NightLife = new Schema({
    location: String,
    data : Object
});

module.exports = mongoose.model("NightLife", NightLife);