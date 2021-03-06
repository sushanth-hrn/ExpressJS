var express = require('express');
var User = require('../models/user');
var bodyParser = require('body-parser'); 

var router = express.Router();
router.use(bodyParser.json());
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req,res,next) => {
  User.findOne({username : req.body.username})
  .then((user) => {
    if (user != null) {
      var err = new Error('User ' + req.body.username + 'already exists');
      err.status = 403;
      next(err);
    }
    else {
      return User.create({
        username: req.body.username,
        password: req.body.password
      })
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({
      status: 'User successfully registered',
      user: user
    });
  }, (err) => next(err))
  .catch((err) => {next(err);});
});

router.post('/login', (req,res,next) => {
  if (!req.session.user) {
    var authHeader = req.headers.authorization;
    if(!authHeader) {
      var err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate','Basic');
      err.status = 401;
      next(err);
      return;
    }
    var auth = new Buffer.from(authHeader.split(" ")[1], 'base64').toString().split(':');
    
    var user = auth[0];
    var password = auth[1];
    
    User.findOne({username: user})
    .then((usr) => {
      if (usr === null) {
        var err = new Error('User ' + user + 'doesn\'t exist');
        err.status = 403;
        return next(err);  
      }
      else if (password !== usr.password) {
        var err = new Error('Incorrect password');
        err.status = 403;
        return next(err);
      }
      else if (usr.username === user && usr.password === password) {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type','text/plain');
        res.end('You are aunthenticated');
      }
    })
    .catch((err) => next(err));
  }
  else {
    res.status = 200;
    res.setHeader('Content-Type','text/plain');
    res.end('You are already authenticated');
  }
});

router.get('/logout', (req,res,next) => {
  if (req.session) {
    req.session.destroy();
    req.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
