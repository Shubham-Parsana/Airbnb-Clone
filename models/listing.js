const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

// Define schema
const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: { 
        filename: { type: String, default: "default" },
        url: { type: String, default: "https://media.worldnomads.com/learnimages/2019/newimages/Annapurna_120919-402.jpg" },
    },
    price: Number,
    location: String,
    country: String,
    reviews :[
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

listingSchema.post("findOneAndDelete", async (listing) =>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
});


// Create model
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;