const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const orderRoutes = express.Router();
const requireLogin = require("../middleware/requireLogin");
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
var FDate = date + "/" + month + "/" + year;

orderRoutes.post("/order", function (req, response) {
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
  } = req.body;
  let date_ob = new Date();
  date_ob.setDate(date_ob.getDate() + days);
  let date1 = ("0" + date_ob.getDate()).slice(-2);
  let month1 = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year1 = date_ob.getFullYear();
  var RDate = date1 + "/" + month1 + "/" + year1;
  if (
    !name ||
    !phone ||
    !email ||
    !addr1 ||
    !addr2 ||
    !pin ||
    !state ||
    !country ||
    !userID ||
    !username ||
    !bookID ||
    !bookname
  ) {
    return response
      .status(422)
      .json({ error: "You will need to give all information" });
  }

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
    response.json(res);
  });
  //    db_connect
  //     .collection("newOrder")
  //     .findOne({username:username}).then((savedUser=>{
  //         if(savedUser){
  //             return response.status(422).json({error:"Username already exist!"});

  //          }
  //         else{
  // db_connect.collection("newOrder").insertOne(myobj, function (err, res) {
  //     if (err) throw err;
  //     response.json(res);
  //   });
  // }
  // }));
});

orderRoutes.get("/order/:id", requireLogin, function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { userID: req.params.id };
  db_connect
    .collection("newOrder")
    .find(myquery)
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

orderRoutes.get("/order", function (req, res) {
  let db_connect = dbo.getDb("newBooks");
  db_connect
    .collection("newOrder")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

orderRoutes.put("/return/:id", async (req, res) => {
  let db_connect = dbo.getDb();
  try {
    const order = await db_connect.collection("newOrder").findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      { $set: { returnRequest: true } },
      { returnOriginal: false } // Return the updated record
    );
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
});

orderRoutes.put("/bookrecieved/:id/:bookID", async (req, res) => {
  let db_connect = dbo.getDb();
  try {
    const order = await db_connect.collection("newOrder").findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      { $set: { bookReturend: true } },
      { returnOriginal: false } // Return the updated record
    );
    const record = await db_connect.collection("records").findOneAndUpdate(
      { _id: ObjectId(req.params.bookID) },
      { $set: { onRent: false } },
      { returnOriginal: false } // Return the updated record
    );
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
});

orderRoutes.put("/bookdelivered/:id", async (req, res) => {
  let db_connect = dbo.getDb();
  try {
    const order = await db_connect.collection("newOrder").findOneAndUpdate(
      { _id: ObjectId(req.params.id) },
      { $set: { bookDelivered: true } },
      { returnOriginal: false } // Return the updated record
    );
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
});

module.exports = orderRoutes;
