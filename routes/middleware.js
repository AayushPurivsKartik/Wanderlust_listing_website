const Listing=require('../models/listing');
const Review=require('../models/review');
const ExpressError=require('../utils/ExpressError.js');
const {listingSchema,reviewSchema}=require('../schema.js');

module.exports.isloggedin=(req,res,next)=>{
    if(!req.isAuthenticated()){
        //redirect URL save
        req.session.redirectURL=req.originalUrl;
        req.flash('failure','you must be logged in to create listings');
        return res.redirect('/login');
    }
    next();
}
module.exports.savedURL=(req,res,next)=>{
    if(req.session.redirectURL){
        res.locals.redirectURL=req.session.redirectURL;
    }
    next(); 
}
module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currentuser._id)){
        req.flash('failure','you do not have a permission');
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isreviewAuthor=async(req,res,next)=>{
    let {id,reviewID}=req.params;
    let review=await Review.findById(reviewID);
    if (!review) {
        req.flash('failure', 'Review not found!');
        return res.redirect(`/listings/${id}`);
    }

    if (!res.locals.currentuser || !review.author.equals(res.locals.currentuser._id)) {
        req.flash('failure', 'You are not the author of the review');
        return res.redirect(`/listings/${id}`);
    }
    next();
}