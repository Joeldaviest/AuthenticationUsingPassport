require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const app =express()
const { Schema } = mongoose;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
const port = 3000

app.listen(port,async()=>{
    console.log("Server started @Port:3000")
})

app.use(session({
    secret: "secretitis",
    resave: false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/secretsDB")

const userSchema = new Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

const user = mongoose.model("user",userSchema)

passport.use(user.createStrategy())
passport.serializeUser(user.serializeUser())
passport.deserializeUser(user.deserializeUser())

app.get("/",async(req,res)=>{
    res.render("home")
})


app.route("/login")
.get(async(req,res)=>{
    res.render("login")
})
.post(async(req,res)=>{
    try{
        const newUser = new user({
            username: req.body.username,
            password: req.body.password
        })
        req.login(newUser,function(err){
            if(!err){
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets")
                })
            }else{
                console.log(err)
                res.redirect("/login")
            }
        })
    }catch(err){
        console.log(err)
    }
})


app.route("/register")
.get(async(req,res)=>{
    res.render("register")
})
.post(async(req,res)=>{
    try{
        user.register({username:req.body.username},req.body.password,function(err,registeredUser){
            if(!err){
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets")
                })
            }else{
                console.log(err)
                res.redirect("/")
            }
        })
    }catch(err){
        console.log(err)
    }
})


app.get("/secrets",async(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/login")
    }
})

app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });