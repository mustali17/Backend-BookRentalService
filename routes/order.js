const express = require("express");
const app = express();
const jwt=require("jsonwebtoken");
const orderRoutes = express.Router();
const requireLogin = require("../middleware/requireLogin");
const dbo = require("../db/conn");

orderRoutes.post("/order",function (req, response) {
    let db_connect = dbo.getDb();
    const {name,number,emailid,address,pincode,userID,username,bookID,bookname}=req.body
   
    if(!name || !number || !emailid || !address || !pincode || !userID || !username || !bookname || !bookID){
       return response.status(422).json({error:"You will need to give all information"});    
    }

        let myobj = {
            // username,
            name,
            number,
            emailid,
            address,
            pincode,
            userID,
            username,
            bookID,
            bookname,
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

module.exports = orderRoutes;