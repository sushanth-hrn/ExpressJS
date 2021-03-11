var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');

exports.local = passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user,config.secretKey,{expiresIn:3600});
};

// This code below is for token validation (verifying the JWT)
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtStrategy = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log(jwt_payload);

        User.findOne({_id : jwt_payload._id}, (err, user) => {
            if (err) {
                done(err, false)
            }
            else if (user) {
                done(null, user)
            }
            else {
                done(null, false)
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session : false});

exports.verifyAdmin = (req, res, next) => {
    if(req.user.admin) {
        next();
        return ;
    }
    else {
        var err = new Error('You are not authorized to perform this operation');
        err.status = 403;
        return next(err);
    }
}