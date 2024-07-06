const express=require('express');
const router=express.Router();
const Listing=require('../models/listing.js');
const wrapAsync=require('../utils/wrapasync.js');
const ExpressError=require('../utils/ExpressError.js');
const {listingSchema}=require('../schema.js');
const {isloggedin,isOwner}=require('./middleware.js');
const multer=require('multer')
const {storage}=require('../cloudConfig.js')
const upload=multer({storage})

//to check the validation error of individual field
const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}

//index route
router.get('/',wrapAsync(async (req,res)=>{
    let allListing= await Listing.find({});
    res.render('listings/index.ejs',{allListing});
}));
//create and new route
router.get('/new',isloggedin,(req,res)=>{
    // console.log(req.user);
    // if(!req.isAuthenticated()){
    //     req.flash('failure','you must be logged in to create listings');
    //     return res.redirect('/login');
    // }
    res.render('listings/new.ejs');
});
//show route
router.get('/:id',wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id).populate({path:'reviews',populate:{
        path:'author',
    },}).populate('owner');
    if(!listing){
        req.flash('failure','Listing you requested for does not exist');
        res.redirect('/listings');
    }
    res.render('listings/show.ejs',{listing});
}));
//post request to create new listings
router.post('/',isloggedin,upload.single('image'),validateListing,wrapAsync(async(req,res,next)=>{
        let url=req.file.path;
        let filename=req.file.filename;
        let {title,description,image,price,location,country}=req.body;
        let newListing= new Listing({title:title,description:description,image:image,price:price,location:location,country:country});
        newListing.owner=req.user._id;
        newListing.image={url,filename};
        await newListing.save();
        req.flash('success','New listing was created');
        res.redirect('/listings');
    
}));
//update route first get request and then after that put request
router.get('/:id/edit',isloggedin,isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let uplisting=await Listing.findById(id);
    if(!uplisting){
        req.flash('failure','Listing you requested for does not exist');
        res.redirect('/listings');
    }
    let original=uplisting.image.url;
    original.replace('/upload','/upload/h_300,w_250');
    res.render('listings/edit.ejs',{uplisting,original});
}));
router.put('/:id',isloggedin,isOwner,upload.single('image'),validateListing,wrapAsync(async (req,res)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    let {id}=req.params;
    let {title,description,image,price,location,country}=req.body;
    let listing=await Listing.findByIdAndUpdate(id,{title:title,description:description,image:image,price:price,location:location,country:country});
    if(typeof req.file!='undefined'){
    listing.image={url,filename};
    await listing.save();}
    req.flash('success','listing updated');
    res.redirect('/listings');
}));
//delete route
router.delete('/:id',isloggedin,isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success','Listing Deleted');
    res.redirect('/listings');
}));
module.exports=router;