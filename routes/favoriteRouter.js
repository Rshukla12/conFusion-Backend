const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('../authenticate');

var Favorites = require('../models/favorites');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.all(authenticate.verifyUser)
.get((req,res,next) => {
    Favorites.findOne({"User": req.user._id})
    .populate('User')
    .populate('Dish')
    .then((favorite) => {
        if(favorite === null){
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end("You don't have any favorite dishes yet!");
        }
        else{
            res.statusCode = 200;
            res.setHeader('Conetent-Type', 'application/json');
            res.json(favorite);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req,res,next) => {
    dishes = req.body;
    Favorites.findOne({"User": req.user._id})
    .populate('User')
    .populate('Dish')
    .then((favorite) => {
        if(dishes.length > 0){
            var flag = true;
            for(var i = (dishes.length-1); i >= 0; i--){
                for (var j = (favorite.Dishes.length - 1); j >= 0 ; j--){
                    if ((favorite.Dishes[j]) == dishes[i]){
                        flag = false;
                    }
                }
                if(flag){
                    favorite.Dishes.push(dishes[i])
                }
                flag = true;
            }
            favorite.save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end('You haven\'t put any dish to be in favorite dishes list!');
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operations not supported on /favorites' );
})
.delete((req,res,next) => {
    Favorites.findOne({"User": req.user._id})
    .populate('User')
    .populate('Dish')
    .then((favorite) => {
        if (favorite !== null){
            if(favorite.Dishes.length > 0){
                for (var i = (favorite.Dishes.length - 1); i >= 0 ; i--){
                    favorite.Dishes.remove(favorite.Dishes[i])
                }
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
            else{
                console.log(favorite)
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('You don\'t have any dish in favorite dishes list!');
            }  
        }
        else{
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end("You don't have any favorite dishes yet!");
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


favoriteRouter.route('/:dishId')
.all(authenticate.verifyUser)
.get((req,res,next) => {
    res.statusCode = 403;
    res.end('GET operations not supported on /favorites/' + req.params.dishId );
})
.post((req,res,next) => {
    Favorites.findOne({"User": req.user._id})
    .populate('User')
    .populate('Dish')
    .then((favorite) => {
        dish = req.params.dishId.toString();
        if(favorite === null){
            Favorites.create({"User": req.user._id})
            .then((favorite) => {
                favorite.Dishes.push(dish);
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Conetent-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else{
            var flag = true;
            for (var i = (favorite.Dishes.length -1); i >= 0 ; i--){
                if ((favorite.Dishes[i]) == dish){
                    flag = false;
                    res.statusCode = 403;
                    res.setHeader('Content-Type', 'text/plain')
                    res.end("Dish already added to your Favorites!");
                }
            }
            if (flag){ 
                favorite.Dishes.push(dish);
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Conetent-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
})
.put((req,res,next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Put operations are not allowed on /favorites/dishes/' + dish)
    
})
.delete((req,res,next) => {
    dish = req.params.dishId
    Favorites.findOne({"User" :req.user._id})
    .populate('User')
    .populate('Dish')
    .then((favorite) => {
        if (favorite == null){
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end('You don\'t have any favorite dishes yet!');    
        }
        else{
            if(favorite.Dishes.length > 0){
            for (var i = (favorite.Dishes.length - 1); i >= 0 ; i--){
                if ((favorite.Dishes[i]) == dish){
                    favorite.Dishes.remove(favorite.Dishes[i])
                }
            }
            favorite.save()
            .then((favorite) => {
                console.log(favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
            }
            else{
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end('You don\'t have ' + dish + 'in favorite dishes list!');
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = favoriteRouter;
