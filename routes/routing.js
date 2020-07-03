const express = require('express');
const router = express.Router();
const path = require('path')
const directory = path.join(__dirname, '../');


//go to home page



/* router.get('/home', (req,res,next) => {
    res.sendFile(directory + 'client/build/index.html', function (err) {
        if (err) { next(err) } else { console.log('Sent:', directory + 'index.html') }
    })
})
router.get('/profile', (req,res,next) => {
    res.sendFile(directory + 'client/build/index.html', function (err) {
        if (err) { next(err) } else { console.log('Sent:', directory + 'index.html') }
    })
})
router.get('/job-postings', (req,res,next) => {
    res.sendFile(directory + 'client/build/index.html', function (err) {
        if (err) { next(err) } else { console.log('Sent:', directory + 'index.html') }
    })
})
router.get('/login', (req,res,next) => {
    res.sendFile(directory + 'client/build/index.html', function (err) {
        if (err) { next(err) } else { console.log('Sent:', directory + 'index.html') }
    })
})
router.get('/register', (req,res,next) => {
    res.sendFile(directory + 'client/build/index.html', function (err) {
        if (err) { next(err) } else { console.log('Sent:', directory + 'index.html') }
    })
}) */

router.get('*', (req,res,next) =>{
    res.sendFile(directory+'/client/build/index.html');
});

module.exports = router;