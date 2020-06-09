var express = require('express');
var router = express.Router();
var passport = require('passport');
const bodyParser = require('body-parser');

var authenticate  =require('../authenticate');
var User = require('../models/user');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/',authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});


router.post('/signup', (req,res,next) => {
  User.register(new User({ username : req.body.username }),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        else{
          if (req.body.firstname){
            user.firstname = req.body.firstname;
          }
          if (req.body.lastname){
          user.lastname = req.body.lastname;
          }
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
              return ;
            }
            passport.authenticate('local')(req, res, function () {
              return res.status(200).json({status: 'Registration Successful!'});    
          });
          });
        }
    });
});


router.post('/login', passport.authenticate('local'), (req, res) => {

  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req,res,next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id', {httpOnly:true,path:"/"});
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});



module.exports = router;
