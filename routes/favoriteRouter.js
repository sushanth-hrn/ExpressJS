const express = require('express');
const bodyParser = require('body-parser');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const user = require('../models/user');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})

.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({userId : req.user._id})
    .populate('userId')
    .populate('dishes.dishId')
    .populate('dishes.dishId.comments.author')
    .then((favs) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(favs);
    },(err) => next(err))
    .catch((err) => next(err))
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({userId : req.user._id})
    .then((fav) => {
        if(fav != null) {
            fav.dishes.push(...req.body);
            fav.save()
            .then((fav) => {
                Favorite.findOne({userId : fav.userId})
                .populate('userId')
                .populate('dishes.dishId')
                .populate('dishes.dishId.comments.author')
                .then((favs) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favs);
                },(err) => next(err))
            },(err) => next(err))
        }
        else {
            Favorite.create(req.body)
            .then((fav) => {
                fav.userId = req.user._id;
                fav.save()
                .then((fav) => {
                    Favorite.findOne({userId : fav.userId})
                    .populate('userId')
                    .populate('dishes.dishId')
                    .populate('dishes.dishId.comments.author')
                    .then((favs) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(favs);
                    },(err) => next(err))
                },(err) => next(err))
            },(err) => next(err))
        }
    },(err) => next(err))
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT is not supported on /favorite');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.remove({userId: req.user._id})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-type','application/json');
        res.json(resp);
    },err=>next(err))
    .catch((err)=>next(err));
})

favoriteRouter.route('/:favId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})

.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({userId : req.user._id})
    .populate('userId')
    .populate('dishes.dishId')
    .populate('dishes.dishId.comments.author')
    .then((favs) => {
        if(favs != null && favs.dishes.dishId(req.params.favId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(favs.dishes.dishId(req.params.favId));
        }
        else if (favs == null) {
            var err = new Error('Favorite list for user ' + req.user._id + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            var err = new Error('Dish ' + req.params.favId + ' not found in favorites');
            err.status = 404;
            return next(err);
        }
    })
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({userId : req.user._id})
    .then((favs) => {
        if(favs != null && favs.dishes.dishId(req.params.favId) == null) {
            favs.dishes.push(req.params.favId)
            favs.save()
            .then((fav) => {
                Favorite.findOne({userId : fav.userId})
                .populate('userId')
                .populate('dishes')
                .populate('dishes.comments.author')
                //.populate('dishes.dishId')
                //.populate('dishes.dishId.comments.author')
                .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fav);
                },(err) => next(err))  
            },(err) => next(err))
        }
        else if (favs == null) {
            var err = new Error('Favorite list for user ' + req.user._id + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            var err = new Error('Dish ' + req.params.favId + ' already exists in favorites');
            err.status = 404;
            return next(err);
        }
    },(err) => next(err))
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT is not supported on /favorite');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({userId : req.user._id})
    .then((favs) => {
        if(favs != null && favs.dishes.dishId(req.params.favId) != null) {
            favs.dishes.dishId(req.params.favId).remove()
            favs.save()
            .then((fav) => {
                Favorite.findOne({userId : fav.userId})
                .populate('userId')
                .populate('dishes.dishId')
                .populate('dishes.dishId.comments.author')
                .then((fave) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fave);
                },(err) => next(err))              
            },(err) => next(err))
        }
        else if (favs == null) {
            var err = new Error('Favorite list for user ' + req.user._id + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            var err = new Error('Dish ' + req.params.favId + ' not found in favorites');
            err.status = 404;
            return next(err);
        }
    })  
})

module.exports = favoriteRouter;