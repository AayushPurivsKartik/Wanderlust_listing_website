const express=require('express');
const User=require('../models/user.js');
const wrapasync = require('../utils/wrapasync.js');
const passport=require('passport');
const {savedURL}=require('./middleware.js');

const router=express.Router();
//signup
router.get('/signup',(req,res)=>{
    res.render('user/signup');
});
router.post('/signup',wrapasync(async(req,res)=>{
    try{
    let {username,email,password}=req.body;
    const newuser= new User({email,username});
    let requi=await User.register(newuser,password);
    // console.log(requi);
    req.login(requi,(err)=>{
        if(err){
            return next(err);
        }
        req.flash('success','Welcome to Wanderlust');
        res.redirect('/listings');
    });
    }catch(e){
        req.flash('failure',e.message);
        res.redirect('/signup');
    }
}));
//login
router.get('/login',(req,res)=>{
    res.render('user/login');
});
router.post('/login',savedURL,passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
    req.flash('success','Welcome back to Wanderlust');
    let redirectUrl=res.locals.redirectURL || '/listings';
    res.redirect(redirectUrl);
});
//logout route
router.get('/logout',(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash('success','you logged out');
        res.redirect('/listings');
    });
});
module.exports=router;