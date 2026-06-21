const express = require('express');
const router = express.Router({mergeParams: true}); // mergeParams allows us to access the params from the parent route
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressErrors.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");



const validateListing = (req,res,next) =>{ 
    let {error} = listingSchema.validate(req.body); // validate the data using Joi
    let errMsg = error.details.map((el) => el.message).join(",");

    if(error){
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}


//Index Route
router.get("/",wrapAsync (async (req,res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , {allListings});
}));

//New Route
router.get("/new",(req,res) =>{
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id",wrapAsync (async (req,res) =>{
    let {id} =req.params;
    let listing = await Listing.findById(id).populate("reviews"); // populate the reviews field
    if(!listing){
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

//Create Route

router.post("/",validateListing, wrapAsync (async (req,res,next) =>{
    // let {title , description , image , price , country , location} =req.body;
    // let listing = req.body.listing;
        // if(!req.body.listing){
        //      throw new ExpressError(400, "Invalid Listing Data");
        // };
        // if(!newListing.description){
        //     throw new ExpressError(400, "descpription is missing");
        // }
        // let result = listingSchema.validate(req.body); // validate the data using Joi
        // console.log(result);
        // if(result.error){
        //     throw new ExpressError(400, result.error);  
        // }
        const newListing =new Listing(req.body.listing);  // it will create an instance of Listing
        await newListing.save();
        req.flash("success", "Successfully created a new listing!");
        res.redirect("/listings");
}))

//Edit Route
router.get("/:id/edit", wrapAsync(async (req,res) =>{
    let {id} =req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found");
        return res.redirect("/listings"); 
    }
    res.render("listings/edit.ejs", {listing});
}))
    

//Update Route
router.put("/:id",validateListing, wrapAsync(async (req,res) =>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    req.flash("success", "Successfully updated a listing!");
    res.redirect("/listings/"+id);
}))

//Delete Route
router.delete("/:id", wrapAsync(async (req,res) =>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect("/listings");
}))

module.exports = router;