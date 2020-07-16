const express = require('express');
const router = express.Router();
const User = require('../models/User');
const JobPost = require('../models/JobPost');
const Menu = require('../models/Menu');
const Orders = require('../models/Orders')
const formidable = require('formidable');
const fileUpload = require('express-fileupload');
const path = require('path');
let fs = require('fs');
var bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require("nodemailer");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


router.use(fileUpload());
router.post('/upload-img', async(req,res) => {    

    if(req.files === null){
        return res.status(400).json({msg: 'no file uploaded'});
    }


    console.log('req.files.file',req.files.file);
     const file = req.files.file;


    file.mv(`${__dirname}/uploads/${req.body.username}-${file.name}`, err=> {
        if(err){
            console.log(err);
            return res.status(500).send(err);
        }

        res.json({fileName: `${req.body.username}-${file.name}`, filePath: `/../public/uploads/${req.body.username}-${file.name}`});
    }); 
});


router.post('/modify-img', async(req,res) => {    

    if(req.files === null){
        return res.status(400).json({msg: 'no file uploaded'});
    }


    console.log('MODIFIED req.files.file',req.files.file);
     const file = req.files.file;


    file.mv(`${__dirname}/uploads/${file.name}`, err=> {
        if(err){
            console.log(err);
            return res.status(500).send(err);
        }

        res.json({fileName: `${file.name}`, filePath: `/../public/uploads/${file.name}`});
    }); 
});

//update order pending
router.post('/api/post/update-pending-order', async (req,res) => {
    let updateOrder = await Orders.updateOne({_id: req.body.orderID}, {
        $set: {
            pending: false
        }
    })

    let orderItem = await Orders.findOne({_id: req.body.orderID})
    console.log('AMOUNT: ', orderItem.price)
    const cookRes = await User.updateOne({username: orderItem.chefUsername},{
        $inc: {
            account: orderItem.price,
            totalEarned: orderItem.price
        }
    })

    res.json({updateOrder, cookRes})

})

router.post('/api/post/add-review', async (req,res) => {

    let updateReviews = await User.updateOne({username: req.body.chef}, {
        $push: {
            reviews: {
                rating: req.body.ratingValue,
                description: req.body.ratingDescription,
                username: req.body.username
            }
        }
    })

    res.json({updateReviews})

})

router.post('/api/post/remove-item/:id', (req,res) => {
    Menu.deleteOne({_id: req.params.id})
    .then(response => {
        console.log('REMOVE ITEM RESPONSE', response)
        res.json(response)
    })
    .catch(error => console.error(error))
})


router.post('/api/post/remove-photo', (req, res) => {
    console.log('UPDATE PHOTOS',req.body.username, req.body.photos)
    User.updateOne({username: req.body.username},{
        $set: {
            photos: req.body.photos,
        }
        
    })
    .then(results => {
        console.log(`application updated: ${results}`);
        res.json(results);
    })
    .catch(error => console.error(error)) 
});

router.post('/post/add-menu-items', (req, res) => {

    req.body.map(element =>{
        Menu.create({
            title: element.title,
            rating: element.rating,
            longitude: element.longitude,
            latitude: element.latitude,
            username: element.username,
            userID: element.userID,
            description: element.description,
            price: element.price,
            picture: element.picture
        })
        .then(results => {
            console.log(`New MENU ITEM: ${results}`);
            res.json(results);
        })
        .catch(error => console.error(error))
    })
});

router.post('/post/create-post', (req, res) => {
        JobPost.create({
            summary: req.body.summary,
            description: req.body.description,
            peopleAmount: req.body.peopleAmount,
            location: req.body.location,
            date: req.body.date,
            username: req.body.username,
            cook: req.body.cook,
            price: req.body.price
        })
        .then(results => {
            console.log(`New POST: ${results}`);
            res.send(`${req.body.summary} has been created`);
        })
        .catch(error => console.error(error))
});

router.post('/api/post/apply/job-post', (req, res) => {
    console.log(req.body.username, req.body.uniqueID)
    JobPost.updateOne({_id: req.body.uniqueID},{
        $push: {
            applications: req.body.username,
        }
        
    })
    .then(results => {
        console.log(`New Application: ${results}`);
        res.send('You have been added to the application list');
    })
    .catch(error => console.error(error)) 
});

router.post('/api/post/confirm-cook', (req, res) => {
    console.log(req.body.cook, req.body.postID)
    JobPost.updateOne({_id: req.body.postID},{
        $set: {
            cook: req.body.cook,
        }
        
    })
    .then(results => {
        console.log(`application updated: ${results}`);
        res.json(results);
    })
    .catch(error => console.error(error)) 
});

router.post('/api/post/reject-cook', async (req, res) => {
    console.log(req.body.username, req.body.postID)
    let response = await JobPost.findOne({_id: req.body.postID})
    console.log(response)
    const index = response.applications.indexOf(`${req.body.username}`)
    let temp = response.applications
    temp.splice(index, 1)

    let update = await JobPost.updateOne({_id: req.body.postID},{
        $set: {
            applications: temp
        }
    })
    res.send(`${req.body.username} has been rejected and removed from the list`)
    console.log(update)
});


router.post('/complete-cook-registration', async (req, res) => {
    const data = req.body
    try{
        const response = await User.updateOne({username: data.username}, {
            $set: {
                cookSpecialty: data.cookSpecialty,
                cookDescription: data.cookDescription,
                cookPrice: data.cookPrice,
                picture: data.picture
            }
        })
        console.log(response)
        res.send('Account Has Been Created. Thank you for signing up!')
    }catch(error){res.send(error)}
});


router.post('/update-user', (req, res) => {
    console.log('BODY',req.body);
    User.updateOne({username: req.body.username}, {
        $set: {
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            cook: req.body.cook,
            cookSpecialty: req.body.cookSpecialty,
            cookDescription: req.body.cookDescription,
            cookPrice: req.body.cookPrice,
            picture: req.body.picture,
            photos: req.body.photos,
            number: req.body.number,
            bank_account_id: req.body.bank_account_id
        }
    })
    .then(results =>{
        console.log(results);
        res.json(results)
    })
});

router.post('/send-location', async (req, res) => {
    const data = req.body

    try{
        const response = await User.updateOne({username: req.body.username}, {
            $set: {
                latitude: data.latitude,
                longitude: data.longitude
            }
        })

        res.json(response)
    }catch(error){console.log(error)}

});

router.post('/post/register', async (req, res) => {

    try{
        const hashedPassword = bcrypt.hashSync(req.body.password,saltRounds);
        const user = await User.create({
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            email: req.body.email,
            number: req.body.number,
            username: req.body.username,
            password: hashedPassword,
            cook: req.body.cook,
        })

        req.session.userID = user._id;

        res.json(user)
        
    }catch(error){
        console.log(error)
        res.send(error)
    }


    

        
    
});

router.post('/login-user', async (req,res) => {
    const {username, password} = req.body;
    console.log(username, password);

    try{
        let user = await User.findOne( {username: username} )
        if(user !== null){
            bcrypt.compare(password, user.password, function(err, isMatch) {
                if(isMatch === true){
                    req.session.userID = user._id
                    res.json(user)
                }else{
                    console.log('invalid password');
                    res.send('invalid password');
                }
            })
        }else{
            console.log('invalid username');
            res.send('invalid username');
        }
    }catch(error){console.log(error)}
    
         
})

//create custom stripe account for user

router.post('/api/register-cook', async (req,res) => {

    const data =  req.body;

    console.log('REQ.BODY',data)

    try{
        const account = await stripe.accounts.create({
            country: 'US',
            type: 'custom',
            business_type: 'individual',
            business_profile: {
                product_description: 'freelance cook making delivered homemade food'
            },
            individual:{
                first_name: data.firstname,
                last_name: data.lastname,
                email: data.email,
                dob:{
                    day: data.day,
                    month: data.month,
                    year: data.year
                },
                ssn_last_4: data.ssn
            },
            external_account:{
                object: 'bank_account',
                country: "US",
                currency: "usd",
                account_number: data.accountNumber,
                routing_number: data.routingNumber
            },
            tos_acceptance: {
                date: Math.floor(Date.now() / 1000),
                ip: req.connection.remoteAddress, // Assumes you're not using a proxy
            },
            requested_capabilities: ['transfers'],
        });

        console.log('ACCOUNT',account)

        const hashedPassword = bcrypt.hashSync(req.body.password,saltRounds);
        const user = await User.create({
            firstName: data.firstname,
            lastName: data.lastname,
            email: data.email,
            number: data.number,
            username: data.username,
            cookDescription: data.cookDescription,
            cookSpecialty: data.cookSpecialty,
            cookPrice: data.cookPrice,
            password: hashedPassword,
            stripe_account_id: account.id,
            cook: data.cook,
            picture: data.picture
        })
        console.log(user._id)
        req.session.userID = user._id;

        res.send(`Account has been created`)
    }catch(error){
        console.log(error)
        res.send(error)
    }
    

})

router.post('/api/post/add-bank-account', async (req,res) => {
    const user = req.body.user
    const bankInfo = req.body.bank
    try{
        const response = await stripe.accounts.createExternalAccount(
            `${user.stripe_account_id}`,
            {
                external_account: {
                    object: 'bank_account',
                    country: 'US',
                    currency: 'usd',
                    account_number: bankInfo.account_number,
                    routing_number: bankInfo.routing_number

                }
            },
        )
        console.log(response)
        res.json(response)
    }
    catch(err){
        console.log(err)
        res.json(err)
    }
})

/* router.post('/api/post/pay-user', async (req,res) => {
    const user = req.body.user
    const bankInfo = req.body.bank
    try{
        const response = await stripe.accounts.createExternalAccount(
            `${user.stripe_account_id}`,
            {
                external_account: {
                    object: 'bank_account',
                    country: 'US',
                    currency: 'usd',
                    account_number: bankInfo.account_number,
                    routing_number: bankInfo.routing_number

                }
            },
        )
        console.log(response)
        res.json(response)
    }
    catch(err){
        console.log(err)
        res.json(err)
    }
}) */


module.exports = router;





/*  */