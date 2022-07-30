const express = require("express");
const app = express();
const jwt=require("jsonwebtoken");
// const {JWT_SECRET}=require("../valueKeys")
const authRoutes = express.Router();
const requireLogin = require("../middleware/requireLogin");
const dbo = require("../db/conn");

const ObjectId = require("mongodb").ObjectId;

const bcrypt = require("bcryptjs");


authRoutes.post("/user/signup",function (req, response) {
    let db_connect = dbo.getDb();
    const {name,lname,username,email,password}=req.body
   
    if(!name || !username || !email || !password){
       return response.status(422).json({error:"You will need to give all information"});    
    }

    bcrypt.hash(password,12).then(hashedpasswoed=>{
        let myobj = {
            name,
            lname,
            username,
            email,
            password:hashedpasswoed,
            
          };
          
    
        db_connect
        .collection("newUser")
        .findOne({username:username}).then((savedUser=>{
            if(savedUser){
                return response.status(422).json({error:"Username already exist!"});
                
             }
            else{
                db_connect.collection("newUser").insertOne(myobj, function (err, res) {
                    if (err) throw err;
                    response.json(res);
                  });
            }
        }));
    });
});

authRoutes.post("/user/signin",function(req,response){
    let db_connect = dbo.getDb();
    const {email,password}=req.body;

    db_connect.collection("newUser").findOne({email:email}).then(savedUser=>{
        if(!savedUser){
            return response.status(422).json({error:"User does not exist!"});
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                const token=jwt.sign({_id:savedUser._id},process.env.JWT_SECRET);
                const {_id,username,email} = savedUser
                response.json({token,user:{_id,username,email},message:"Welcome!"})
                // response.json({message:"Welcome!"});
            } 
            else{
                return response.status(422).json({error:"Invalid Credentials"});
            }
        })
        .catch(err=>{
            console.log(err);
        })
    })

}); 

authRoutes.get("/user/:id",requireLogin,function (req, res) {
    let db_connect = dbo.getDb();
    let myquery = { _id: ObjectId( req.params.id )};
    db_connect
        .collection("newUser")
        .findOne(myquery, function (err, result) {
          if (err) throw err;
          res.json(result);
        });
   });

   authRoutes.post("/user/update/:id",function (req, response) {
        let db_connect = dbo.getDb(); 
    let {name,username,email,password,phone,addr1,addr2,pin,state,country}= req.body;
    let myquery = { _id: ObjectId( req.params.id )}; 
    let newvalues = {   
      $set: {     
        name,
        username,
        email,
        password,
        phone,
        addr1,
        addr2,
        pin,
        state,
        country,
      }, 
     }
     db_connect.collection("newUser").updateOne(myquery,newvalues,function(err,res){
        if(err) throw err;
        response.json(res);

     })
   });

   module.exports = authRoutes;