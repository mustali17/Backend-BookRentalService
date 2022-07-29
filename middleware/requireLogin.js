const jwt = require("jsonwebtoken");
const dbo = require("../db/conn");
let db_connect = dbo.getDb();

module.exports = (req,res,next)=>{
    const {authorization} = req.headers;
    if(!authorization){
       return res.status(401).json({error:"you must be logged in"});
    }
    const token = authorization.replace("Bearer ","");
    jwt.verify(token,process.env.JWT_SECRET,(err,payload)=>{
        if(err){
           return res.status(401).json({error:"you must be logged in"});
        }
        const {_id} = payload
        // db_connect.collection("newUser").findById(_id).then(userData=>{
        //     req.user= userData
        // })
        next() 
    })
}