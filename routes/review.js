const express=require('express');
const router=express.Router({mergeParams:true});
const Listing=require('../models/listing.js');
const wrapAsync=require('../utils/wrapasync.js');
const ExpressError=require('../utils/ExpressError.js');
const {reviewSchema}=require('../schema.js');
const Review=require('../models/review.js');
const { isloggedin } = require('./middleware.js');
const { isreviewAuthor } = require('./middleware.js');
//Validate review
const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}
//Review Route
//post
router.post('/',isloggedin,validateReview,wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    // console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash('success','New Review was created');
    res.redirect(`/listings/${req.params.id}`);
}));
//delete review route
router.delete('/:reviewID',isloggedin,isreviewAuthor,wrapAsync(async(req,res)=>{
    let {id,reviewID}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash('success','Review Deleted');
    res.redirect(`/listings/${id}`);
}));
module.exports=router;