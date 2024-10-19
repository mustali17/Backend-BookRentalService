const express = require("express");
const app = express();
const dbo = require("../db/conn");
require("dotenv").config({ path: "../config.env" });
const router = express.Router();
const CLIENT_URL = "https://book-rental-service.vercel.app";
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_KEY);
const ObjectId = require("mongodb").ObjectId;

router.post("/create-checkout-session", async (req, res) => {
  const customer = await stripe.customers.create({
    metadata: {
      price: req.body.price,
      userID: req.body.userID,
      username: req.body.username,
      bookID: req.body.bookID,
      name: req.body.form.name,
      phone: req.body.form.phone,
      email: req.body.form.email,
      addr1: req.body.form.addr1,
      addr2: req.body.form.addr2,
      pin: req.body.form.pin,
      state: req.body.form.state,
      country: req.body.form.country,
      bookname: req.body.form1.bookname,
      imgurl: req.body.form1.imgurl,
      days: req.body.days,
    },
  });
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: req.body.form1.bookname,
            images: [req.body.form1.imgurl],
          },
          unit_amount: req.body.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${CLIENT_URL}/sucess`,
    cancel_url: `${CLIENT_URL}/canceled`,
  });

  res.send({ url: session.url });
});

//Create Order
let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
var FDate = date + "/" + month + "/" + year;

const createOrder = async (customer, data) => {
  let db_connect = dbo.getDb();
  const {
    name,
    phone,
    email,
    addr1,
    addr2,
    pin,
    state,
    country,
    userID,
    username,
    bookID,
    bookname,
    imgurl,
    price,
    days,
  } = customer.metadata;
  let date_ob = new Date();

  date_ob.setDate(date_ob.getDate() + days);
  let date1 = ("0" + date_ob.getDate()).slice(-2);
  let month1 = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year1 = date_ob.getFullYear();
  var RDate = date1 + "/" + month1 + "/" + year1;
  let myobj = {
    // username,
    name,
    phone,
    email,
    addr1,
    addr2,
    pin,
    state,
    country,
    userID,
    username,
    bookID,
    bookname,
    imgurl,
    price,
    FDate,
    days,
    RDate,
    bookDelivered: false,
    returnRequest: false,
    bookReturend: false,
  };
  db_connect.collection("newOrder").insertOne(myobj, function (err, res) {
    if (err) throw err;
  });
  const record = await db_connect.collection("records").findOneAndUpdate(
    { _id: ObjectId(bookID) },
    { $set: { onRent: true } },
    { returnOriginal: false } // Return the updated record
  );
};

//webhook

// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;
// endpointSecret =
//   "whsec_12f872de63af57b277e883160ebf8ddf7a7d45ba4671c18ff2b06acc45cf4cc0";

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, response) => {
    const sig = req.headers["stripe-signature"];
    let data;
    let eventType;
    if (endpointSecret) {
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log("WebHook Verified");
      } catch (err) {
        console.log("WebHook Failed");
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
      data = event.data.object;
      eventType = event.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }
    // Handle the event
    if (eventType == "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then((customer) => {
          createOrder(customer, data);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send().end();
  }
);

module.exports = router;
