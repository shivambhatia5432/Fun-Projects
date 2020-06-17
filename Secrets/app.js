require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require("mongoose-findorcreate");
// const md5=require("md5");//hashing
// const encrypt=require("mongoose-encryption");//encryption

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

const urldb="mongodb://localhost:27020/userDB";
mongoose.connect(urldb,{useNewUrlParser:true,useUnifiedTopology: true });
mongoose.set("useCreateIndex",true);

const userSchema=new mongoose.Schema({
 email:String,
 password:String,
 googleId:String,
 secret:String
})

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate);
// userSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields:['password']});
const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/",function(req,res){
    res.render("home");
  });

app.get("/auth/google",function(req,res){
    passport.authenticate("google",{scope:["profile"]})
    res.render("home");
});
app.get("/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/secrets",function(req,res){
  User.find({"secret":{$ne:null}},function(err,foundUsers){
    if(err){
      console.log(err)
    }
    else{
      if(foundUsers){
        res.render("secrets",{userwithSecrets:foundUsers})
      }
    }
  })
  });

app.get("/login",function(req,res){
    res.render("login");
  });
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
  });


app.get("/register",function(req,res){
    res.render("register");
  });

app.get("/submit",function(req,res){
  if(req.isAuthenticated()){
    res.render("submit")
}
else{
    res.redirect("/login")
}
});

app.post("/submit",function(req,res){
  const submittedSecret=req.body.secret;
  console.log(req.user.id);
  User.findById(req.user.id,function(err,foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        foundUser.secret=submittedSecret
        foundUser.save(function(){
          res.redirect("/secrets")
        })
      }
    }
  })
});

app.post("/register",function(req,res){
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register")
        }
        else{
            passport.authenticate("local")(req,res,function(){ 
                res.redirect("/secrets")
            })

        }
    });
  });
      //   const newUser=new User({
    //       email:req.body.username,
    //       password:md5(req.body.password)
    //   })
    //   newUser.save(function(err){
    //       if(err){
    //           console.log(err);
    //       }
    //       else{
    //           res.render("secrets");
    //       }
    //   });


app.post("/login",function(req,res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    })
    req.login(user,function(err){
        if(err){
            console.log(err)
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    })
        // const username=req.body.username;
    // const password=md5(req.body.password);
    // User.findOne({email:username},function(err,foundUser){
    //     if(err){
    //         console.log(err)
    //     }
    //     else{
    //         if(foundUser){
    //             if(foundUser.password===password){
    //                 res.render("secrets")
    //             }
    //             else{
    //                 res.send("Wrong password")
    //             }
    //         }
    //         else{
    //             res.send("user not found")
    //         }
    //     }
    // })
  });

app.listen(3000,function(){
    console.log("Server Started");
});