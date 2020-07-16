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
    let today = new Date()
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
router.get('/api/get/active-orders/:username', async (req,res) => {
    let orderItems = await Orders.find({chefUsername: req.params.username, pending: true})

    orderItems.map( async(element) => {
        console.log(element.deliveredDate - element.createdDate)
        if(((Date.now() - element.deliveredDate) > 3600000) && element.completed === true){
            let updateItem = await Orders.updateOne({_id: element._id},{
                $set:{
                    pending: false,
                }
            })
        }
    })
    
   /*  let filteredItems = orderItems.filter(element =>  (element.deliveredDate - element.createdDate) < 3600000) */

    res.json(orderItems)

    
})

//find status of orders that you have purchased
router.get('/api/get/customer-orders/:username', (req,res) => {
    Orders.find({customerUsername: req.params.username})
    .then(orders => {
        console.log(orders);
        res.json(orders)
    })
    .catch(err => console.log(err))
})

//find posts that you created
router.get('/api/get/working-events/:username', (req,res) => {
    JobPost.find({cook: req.params.username, "date" : { $gte : new Date()}})
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
    const chef = await User.findOne({username: item.username})
    console.log('ITEM RESPONSE', item.price)
    const amount = item.price * 100 * req.params.qty
    const fee = amount * .1
    const intent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
        application_fee_amount: fee,
        transfer_data: {
            destination: chef.stripe_account_id,
        },
    });
    console.log(intent.client_secret)
    res.json({client_secret: intent.client_secret});
  });

  router.get('/secret/book-chef/:id/book/:chef', async (req, res) => {
    const item = await JobPost.findOne({_id: req.params.id})
    const chef = await User.findOne({username: req.params.chef})
    console.log('ITEM RESPONSE', item, 'CHEF RESPONSE', chef)
    const amount = item.price * 100 * item.peopleAmount
    const fee = amount * .1
    const intent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
        application_fee_amount: fee,
        transfer_data: {
            destination: chef.stripe_account_id,
        },
    });
    console.log(intent.client_secret)
    res.json({client_secret: intent.client_secret});
  });


  router.get('/api/get/account-balance/:id', async (req, res) => {
    const user = await User.findOne({_id: req.params.id})
    
    const balance = await stripe.balance.retrieve({
        stripe_account: `${user.stripe_account_id}`
      });

    console.log(balance)
    res.json(balance);
  });
  





module.exports = router;