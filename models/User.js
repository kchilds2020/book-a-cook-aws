const mongoose = require('mongoose');
const { Double, Decimal128 } = require('mongodb');

const User = new mongoose.Schema({
    firstName: {type: String, trim: true, default: ''},
    lastName: {type: String, trim: true, default: ''},
    email: {type: String, trim: true, default: ''},
    username: {type: String, trim: true, default: ''},
    password: {type: String, trim: true, default: ''},
    latitude: {type: Number, default: 0},
    longitude: {type: Number, default: 0},
    cook: {type: Boolean, default: false}, 
    cookDescription: {type: String, trim: true, default: ''},
    cookSpecialty: {type: String, trim: true, default: ''},
    cookPrice: {type: String, trim: true, default: ''},
    picture: {type: String, default: ''},
    photos: {type: Array, default: []},
    account: {type: Number, default: 0},
    totalEarned: {type: Number, default: 0},
    number: {type: String, default: 'Number Not Available'},
    reviews: {type: Array, default: []},
    stripe_account_id: {type: String, trim: true, default: ''},
},
{
    collection: 'users'
})

module.exports = mongoose.model('User', User);