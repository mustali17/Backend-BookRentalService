const express = require("express");
const app = express();
const jwt=require("jsonwebtoken");
const orderRoutes = express.Router();
const requireLogin = require("../middleware/requireLogin");
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;


orderRoutes.post("/order",function (req, response) {
    let db_connect = dbo.getDb();
    const {name,phone,email,addr1,addr2,pin,state,country,userID,username,bookID,bookname,imgurl,price}=req.body
   
    if(!name || !phone || !email || !addr1 || !addr2 || !pin || !state || !country || !userID || !username || !bookID || !bookname){
       return response.status(422).json({error:"You will need to give all information"});    
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

orderRoutes.get("/order/:id",requireLogin,function (req, res) {
    let db_connect = dbo.getDb();
    let myquery = { userID: req.params.id };
    db_connect
        .collection("newOrder")
        .find(myquery).toArray( function (err, result) {
          if (err) throw err;
          res.json(result);
        });
   });


   orderRoutes.get('/order',function (req, res) {
    let db_connect = dbo.getDb("newBooks");
    db_connect
      .collection("newOrder")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
      });
   });
  
module.exports = orderRoutes;