const mongoose = require('mongoose')

const Orders = new mongoose.Schema({
    menuItemID: {type: String, trim: true, default: ''},
    menuItemTitle: {type: String, trim: true, default: ''},
    qty: {type: String, trim: true, default: ''},
    picture: {type: String, trim: true, default: ''},
    address: {type: String, trim: true, default: ''},
    date: {type: String, trim: true, default: ''},
    chefUsername: {type: String, trim: true, default: ''},
    customerUsername: {type: String, default: ''},
    completed: {type: Boolean, default: false}
},
{
    collection: 'orders'
})

module.exports = mongoose.model('orders', Orders);