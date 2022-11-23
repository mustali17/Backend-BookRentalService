const express = require("express");
const app = express();
const jwt=require("jsonwebtoken");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the databa
const dbo = require("../db/conn");
const requireLogin = require("../middleware/requireLogin");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// This section will help you get a list of all the records.
recordRoutes.get('/record',function (req, res) {
  let db_connect = dbo.getDb("newBooks");
  db_connect
    .collection("records")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
 });
 
// This section will help you get a single record by id
recordRoutes.route("/record/:id").get(function (req, res) {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId( req.params.id )};
 db_connect
     .collection("records")
     .findOne(myquery, function (err, result) {
       if (err) throw err;
       res.json(result);
     });
});
 
recordRoutes.post("/record/add",requireLogin,function (req, response) {
 let db_connect = dbo.getDb();
 let myobj = {
   bookname: req.body.bookname,
   authorname: req.body.authorname,
   desc: req.body.desc,
   price: req.body.price,
   imgurl: req.body.imgurl,
   ownermail: req.body.ownermail,
 };
 if(!myobj.bookname || !myobj.authorname || !myobj.desc || !myobj.price || !myobj.imgurl || !myobj.ownermail){
  return response.status(422).json({error:"You will need to give all information"});    
}
 db_connect.collection("records").insertOne(myobj, function (err, res) {
   if (err) throw err;
   response.json(res);
 });
});
 
recordRoutes.route("/update/:id").post(function (req, response) {
 let db_connect = dbo.getDb(); 
 let myquery = { _id: ObjectId( req.params.id )}; 
 let newvalues = {   
   $set: {     
    bookname: req.body.bookname,
    authorname: req.body.authorname,
    desc: req.body.desc, 
    price: req.body.price,
   imgurl: req.body.imgurl,
   ownermail: req.body.ownermail,  
   }, 
  }
});
 
// This section will help you delete a record
recordRoutes.route("/:id").delete((req, response) => {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId( req.params.id )};
 db_connect.collection("records").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   response.json(obj);
 });
});

// recordRoutes.get("/ordercart/:id",requireLogin,function (req, res) {
//   let db_connect = dbo.getDb();
//   let myquery = { _id: ObjectId( req.params.id )};
//   db_connect
//       .collection("records")
//       .findOne(myquery, function (err, result) {
//         if (err) throw err;
//         res.json(result);
//       });
//  });
 
module.exports = recordRoutes;