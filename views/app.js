if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/ExpressError.js');
const listingsRouter=require('./routes/listing.js');
const reviewsRouter=require('./routes/review.js');
const path=require('path');
const methodOverride = require('method-override');
const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user.js');
const userRouter=require('./routes/user.js');
const dbUrl=process.env.ATLASDBURL;

const app=express();
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600,
});

store.on('error',()=>{
    console.log('error in mongo session store',err);
})
const sessionOption={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    },
}

app.use(session(sessionOption));
app.use(flash());

//always use the after the session middleware
//passport loginn signup user this middleware help
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//connect to mongodb    


main().then(()=>console.log('DB is connected'))
.catch(err => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
}
//home route

//create middleware for flash messages
app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.failure=req.flash('failure');
    res.locals.currentuser=req.user;
    next();
});

//demo user create for practice
// app.get('/demouser',async(req,res)=>{
//     let fakeuser=new User({
//         email:'student@gmail.com',
//         username:'delta'
//     });
//     await User.register(fakeuser,'helloWorld'); //hello world is the password of that user
// });

// router request go to folder route and go to listings
app.use('/listings',listingsRouter);
// router request go to folder route and go to review
app.use('/listings/:id/reviews',reviewsRouter);
//router for user sign or login
app.use('/',userRouter);

//for if no route matching then page not found error
app.all('*',(req,res,next)=>{
    next(new ExpressError(404,'Page not found'));
});
//error handling
app.use((err,req,res,next)=>{
    let {status=500,message='Some error occured'}=err;
    res.status(status).render('error.ejs',{message});
    // res.status(status).send(message);
}); 
//for all default route
// ye bhi chal jayega lekin we use error handler then we use that method upper side
// app.get('*',(req,res)=>{
//     res.send('You Choose Wrong Route');
// });
app.listen(3000,()=>{
    console.log('The port is listening 3000');
});