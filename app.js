const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressErrors.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const localStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const passport = require("passport");

// Connect to MongoDB
main().then(()=>{
    console.log("Connected to MongoDB");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views")); // set the views directory
app.use(express.urlencoded({extended:true})); // for parsing application/x-www-form-urlencoded
app.use(methodOverride("_method")); // for PUT and DELETE requests
app.engine('ejs', ejsMate); // use ejs-mate for layout
app.use(express.static(path.join(__dirname, "/public")));   // set the public directory for static files

const sessionOptions = {
    secret: 'thisshouldbeasecret',
    resave: false, 
    saveUninitialized: true,
    cookie :{
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge : 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly : true, // only accessible by the web server
    }
};

app.get("/",(req,res) =>{
    res.send("Hi , I'm root!")
});

app.use(session(sessionOptions));// use express-session for session management
app.use(flash());// use connect-flash for flash messages


app.use(passport.initialize());// initialize passport
app.use(passport.session());// use passport for authentication
passport.use(new localStrategy(User.authenticate())); // use local strategy for authentication
passport.serializeUser(User.serializeUser()); // serialize user
passport.deserializeUser(User.deserializeUser()); // deserialize user

 
app.use((req,res,next) =>{
    res.locals.success = req.flash("success"); 
    res.locals.error = req.flash("error");
    // res.locals.currentUser = req.session.currentUser;
    next();
});

// app.get("/demouser",async (req, res) => {
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"student",
//     })
//     const registeredUser = await User.register(fakeUser, "student123");
//     res.send("Demo user created successfully! " + registeredUser.username);
// })

app.use("/listings", listingRouter); // use the listings routes
app.use("/listings/:id/reviews", reviewRouter); // use the reviews routes
app.use("/", userRouter); // use the user routes

// app.get("/testListing",(req,res) =>{
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "By the beach",
//         price: 12000,
//         location: "Calangute , Goa" ,
//         country : "India",

//     })

//     sampleListing.save().then((res) =>{
//         console.log(res);
//     }).catch((err) =>{
//         console.log(err);
//     });
//     res.send("Successful listing ");
// })


app.all("*",(req,res,next) =>{
    next(new ExpressError( 404 ,"Page Not Found" ));
})

// Error handler
app.use((err,req,res,next)=>{
    let {statusCode =500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", { err }); 
    // res.status(statusCode).send(message);;
})

app.listen(8080 , ()=>{
    console.log("Server is running on port 8080");
})