var express = require('express');
var router = express.Router();
var passport=require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User=require('../models/user');
router.get('/login', function(req,res){
	res.render('login');
});

router.get('/register',function(req,res){
	res.render('registers');
});

router.post('/register',function(req,res){
	var name=req.body.name;
	var username=req.body.username;
	var email=req.body.email;
	var password=req.body.password;
	var password1=req.body.password1;
	//console.log(name,username,email,password);
	//validation

	req.checkBody('name','Name is required field').notEmpty();
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email is not valid').isEmail();
	req.checkBody('password','password is required').notEmpty();
	req.checkBody('password1','password not mactched').equals(req.body.password);
	var errors=req.validationErrors();
	if(errors){
		res.render('registers',{
			errors:errors
		});
	}else{
		var newUser=new User({
			name:name,
			email:email,
			username:username,
			password:password
		});
		User.createUser(newUser,function(err,user){
			if(err) throw err;
			console.log(user);
		});
		req.flash('success_msg','you are registers and login now');
		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   	User.getUserByUserName(username, function(err,user){
   		if(err) throw err;
   		if(!user){
   			return done(null,false,{message:'Unknown User'});
   		}

   		User.comparePassword(password,user.password,function(err,isMatch){
   			if(err) throw err;
   			if(isMatch){
   				console.log("Correct password =",user);
   				return done(null,user);
   			}else{
   				return done(null,false,{message:'Invalid password'});
   			}
   		});
   	}); 
  }));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


// router.post('/login',
//   passport.authenticate('local',{
//   	successRedirect:'/', 
//   	faliureRedirect:'/users/login'
//   	}),
//   function(req, res) {
//   	console.log("In post method....");
//    res.redirect('/');
//   });

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  function(req,res){
  	res.redirect('/');
  }
);

router.get('/logout',function(req,res){
	req.logout();
	req.flash('success_msg','You are logged out');
	res.redirect('/users/login');
})

module.exports = router;