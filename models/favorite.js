const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dishSchema = new Schema({
    dishId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dishes'
    }
},{
    timestamps: true
})

const favoriteSchema = new Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes : [ dishSchema ]
},{
    timestamps: true
})

module.exports = mongoose.model('Favorite',favoriteSchema);