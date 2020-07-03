const mongoose = require('mongoose')

const Menu = new mongoose.Schema({
    title: {type: String, trim: true, default: ''},
    rating: {type: String, trim: true, default: ''},
    longitude: {type: String, trim: true, default: ''},
    latitude: {type: String, trim: true, default: ''},
    username: {type: String, trim: true, default: ''},
    userID: {type: String, trim: true, default: ''},
    description: {type: String, trim: true, default: ''},
    price: {type: String, trim: true, default: ''},
    picture: {type: String, default: ''},
    available: {type: Boolean, default: false},
    orders: {type: Array, default: []}
},
{
    collection: 'menu'
})

module.exports = mongoose.model('Menu', Menu);