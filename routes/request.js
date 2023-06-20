const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const requireLogin = require("../middleware/requireLogin");
const ObjectId = require("mongodb").ObjectId;

const requestRoutes = express.Router();
const dbo = require("../db/conn");

const multer = require("multer");
const upload = multer();

requestRoutes.post("/request/add", upload.none(), function (req, response) {
  let db_connect = dbo.getDb();
  let myobj = {
    bookname: req.body.bookname,
    authorname: req.body.authorname,
    desc: req.body.desc,
    email: req.body.email,
  };
  if (!myobj.bookname || !myobj.authorname || !myobj.email) {
    return response
      .status(422)
      .json({ error: "You will need to give all information!!!!" });
  }
  db_connect.collection("requests").insertOne(myobj, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
});

requestRoutes.get("/getbookrequest", function (req, res) {
  let db_connect = dbo.getDb("requests");
  db_connect
    .collection("requests")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

requestRoutes.route("/deleterequest/:id").delete((req, response) => {
  const db_connect = dbo.getDb();
  const userId = ObjectId(req.params.id);

  db_connect.collection("requests").findOne({ _id: userId }, (err, user) => {
    if (err) {
      console.error(err);
      response.status(500).send("Internal Server Error");
      return;
    }

    if (!user) {
      response.status(404).send("Request not found");
      return;
    }

    const userQuery = { _id: userId };
    db_connect.collection("requests").deleteOne(userQuery, (err, result) => {
      if (err) {
        console.error(err);
        response.status(500).send("Internal Server Error");
        return;
      }

      if (result.deletedCount === 0) {
        response.status(404).send("User not found");
        return;
      }

      console.log("Request document deleted:", userId);
    });
  });
});
module.exports = requestRoutes;
