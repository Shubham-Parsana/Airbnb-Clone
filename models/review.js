const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment : String,
    rating : {
        type : Number,
        min : 1,
        max : 5
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
})

module.exports = mongoose.model("Review", reviewSchema); // export the model   and we gonna use one to many relationship between listing and review so we need to export the model here and import it in listing.js file