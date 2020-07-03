const express = require('express');
const router = express.Router();
const JobPost = require('../models/JobPost');
const User = require('../models/User');
const Menu = require('../models/Menu');
const Orders = require('../models/Orders')
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {apiVersion: ''});

//sendfile
router.get('/api/get/image/:filename', (req,res) => {
    try{
     res.sendFile(path.join(__dirname+'/uploads/', req.params.filename));
    }
    catch(error){
        console.log('IMAGE ERROR', error)
    }
});

//find posts that you create
router.get('/api/get/my-jobs/:username', (req,res) => {
    JobPost.find({username: req.params.username})
    .then(posts => {
        console.log(posts);
        res.json(posts)
    })
    .catch(err => console.log(err))
})

//find menu items
router.get('/api/get/menu-items/:username', (req,res) => {
    Menu.find({username: req.params.username})
    .then(items => {
        console.log(items);
        res.json(items)
    })
    .catch(err => console.log(err))
})

//find orders that you need to be completed
router.get('/api/get/active-orders/:username', (req,res) => {
    Orders.find({chefUsername: req.params.username, completed: false})
    .then(orders => {
        console.log(orders);
        res.json(orders)
    })
    .catch(err => console.log(err))
})

//find status of orders that you have purchased
router.get('/api/get/customer-orders/:username', (req,res) => {
    Orders.find({customerUsername: req.params.username, completed: false})
    .then(orders => {
        console.log(orders);
        res.json(orders)
    })
    .catch(err => console.log(err))
})

//find posts that you created
router.get('/api/get/working-events/:username', (req,res) => {
    JobPost.find({cook: req.params.username})
    .then(posts => {
        console.log(posts);
        res.json(posts)
    })
    .catch(err => console.log(err))
})


//find all job posts
router.get('/api/get/jobs', (req,res) => {
    JobPost.find({cook: 'pending'})
    .then(posts => {
        console.log(posts);
        res.json(posts)
    })
    .catch(err => console.log(err))
})

//find all cooks
router.get('/api/get/cooks', (req,res) => {
    User.find({cook: true})
    .then(cooks => res.json(cooks))
    .catch(err => console.log(err))
})

//find all acttive menu items
router.get('/api/get/menu', (req,res) => {
    Menu.find()
    .then(food => res.json(food))
    .catch(err => console.log(err))
})


//get user with username
router.get('/api/get/username/:username', (req,res) => {
    console.log('username request', req.params.username)
    User.findOne({username: req.params.username})
    .then(cooks => {
        console.log('username response',cooks)
        res.json(cooks)})
    .catch(err => console.log(err))
})
//get user with id
router.get('/api/get/userid/:id', (req,res) => {
    /* console.log(req.params.id) */
    User.findOne({_id: req.params.id})
    .then(user => {
        /* console.log(user) */
        res.json(user)})
    .catch(err => console.log(err))
})

//get user with email
router.get('/api/get/email/:email', (req,res) => {
    console.log('email request',req.params.email)
    User.findOne({email: req.params.email})
    .then(cooks => {
        console.log('email response', cooks)
        res.json(cooks)})
    .catch(err => console.log(err))
})


//find user login

router.get('/get-session', async (req,res) => {
    /* res.send(`${req.session.userID}`); */
    console.log('req.session.userID', req.session.userID)
    let userInfo = await User.findOne({_id: req.session.userID})
    let menuInfo = await Menu.find({userID: req.session.userID})
    res.json({userInfo,menuInfo})

    
})

router.get('/check-session', (req,res) => {
    console.log(!req.session.userID)
   !req.session.userID ? res.send(false) : res.send(true)
})

router.get('/logout', (req,res) => {
    req.session.destroy();
})

router.get('/secret/item/:id/:qty', async (req, res) => {
    const item = await Menu.findOne({_id: req.params.id})
    console.log('ITEM RESPONSE', item.price)
    const intent = await stripe.paymentIntents.create({
        amount: ((item.price * 100) + 500 + ((item.price * 100) * .08)) * req.params.qty,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
    });
    console.log(intent.client_secret)
    res.json({client_secret: intent.client_secret});
  });





module.exports = router;