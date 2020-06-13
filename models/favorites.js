const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const favoriteSchema = new Schema({
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Dishes: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish' ,
    } ]
});

var Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;