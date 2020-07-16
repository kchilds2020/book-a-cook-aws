const express = require('express');
const router = express.Router();
const User = require('../models/User');
const JobPost = require('../models/JobPost');
const Menu = require('../models/Menu');
const Orders = require('../models/Orders')
const nodemailer = require("nodemailer");

require('dotenv/config');

router.post('/api/post/book-chef', async (req, res) => {
        const item = await Menu.findOne({_id: req.body.menuItemID})
        const itemPrice = parseFloat(item.price) * parseInt(req.body.qty)
        const orderRes = await Orders.create({
            menuItemID: req.body.menuItemID,
            menuItemTitle: req.body.menuItemTitle,
            createdDate: req.body.createdDate,
            qty: req.body.qty,
            picture: req.body.picture,
            address: req.body.address,
            chefUsername: req.body.chefUsername,
            customerUsername: req.body.customerUsername,
            price: itemPrice
        })

        const cookInfo = await User.findOne({username: req.body.chefUsername})

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: 'lookforcooks@gmail.com', // generated ethereal user
              pass: process.env.EMAIL_PASSWORD, // generated ethereal password
            }
          });

          console.log('EMAIL: ', req.body.user)
          let info = await transporter.sendMail({
            from: '"Look for Cooks" <lookforcooks@gmail.com>', // sender address
            to: `${req.body.customerEmail}`, // list of receivers
            subject: "Order has been Placed ✔", // Subject line
            html: ` <html>
                        <head>
                            <style>
                                *{
                                    color: black;
                                }
                                .username{
                                    color: white;
                                    background-color: #333;
                                    box-shadow: 0px 0px 4px #333;
                                    text-transform: uppercase;
                                    text-align: center;
                                }
                                .email-container{
                                    width: 100%;
                                    max-width: 600px;
                                    height: 600px;
                                    box-shadow: 0px 0px 4px #333;
                                    color: black;
                                    font-size: 18px;
                                    text-align: center;
                                }
                                .order{
                                    border: #333 1px sold;
                                }
                                .num{
                                    color: rgb(97, 169, 202);
                                }

                                .initial{
                                    font-size: 24px;
                                    font-weight: bold;
                                }
                                .disclaimer{
                                    font-size: 12px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <h2 class="username">${req.body.customerUsername}</h2>
                                <div class = "information">
                                    <div class = "initial">Your order for <span class="num">${req.body.qty}</span> ${req.body.menuItemTitle}(s) has been placed!</div>
                                </div>
                                <div class="order">
                                    <div><b>Order ID:</b> ${orderRes._id}</div>
                                    <div><b>Deliver to:</b> ${req.body.address}</div>
                                    <h3>Thank you for using Look for Cooks!</h3>
                                    <div class="disclaimer">Please coordinate with your cook on delivery time. If your cook does not respond within one hour of your order, then you will be refunded in full.</div>
                                </div>
                            </div>
                        </body>
                    </html>
                    `, // html body
          });

          let cookEmail = await transporter.sendMail({
            from: '"Look for Cooks" <lookforcooks@gmail.com>', // sender address
            to: `${cookInfo.email}`, // list of receivers
            subject: "Order Up!", // Subject line
            html: ` <html>
                        <head>
                            <style>
                                *{
                                    color: black;
                                }
                                .username{
                                    color: white;
                                    background-color: #333;
                                    box-shadow: 0px 0px 4px #333;
                                    text-transform: uppercase;
                                    text-align: center;
                                }
                                .email-container{
                                    width: 100%;
                                    max-width: 600px;
                                    height: 600px;
                                    box-shadow: 0px 0px 4px #333;
                                    color: black;
                                    font-size: 18px;
                                    text-align: center;
                                }
                                .order{
                                    border: #333 1px sold;
                                }
                                .num{
                                    color: rgb(97, 169, 202);
                                }

                                .initial{
                                    font-size: 24px;
                                    font-weight: bold;
                                }
                                .disclaimer{
                                    font-size: 12px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <h2 class="username">${req.body.menuItemTitle}</h2>
                                <div class = "information">
                                    <div class = "initial">Quantity: <span class="num">${req.body.qty}</span></div>
                                    <div><b>Customer Name:</b> ${req.body.user.firstName} ${req.body.user.lastName}</div>
                                    <div><b>Order ID:</b> ${orderRes._id}</div>
                                    <div><b>Deliver to:</b> ${req.body.address}</div
                                </div>
                                <div class="order">
                                    <h3>Thank you for using Look for Cooks!</h3>
                                    <div class="disclaimer">Please coordinate with your customer on delivery time.</div>
                                </div>
                            </div>
                        </body>
                    </html>
                    `, // html body
          });

          console.log("Message sent: %s", info.messageId, cookEmail.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>



        res.json({orderRes})

})

module.exports = router;