const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const routes = require('./routes/record');
const auth = require('./routes/auth');
const order = require('./routes/order');
app.use('/api', routes)
app.use('/api', auth)
app.use('/api', order)
// get driver connection
const dbo = require("./db/conn");
 
app.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
 
  });
  console.log(`Server is running on port: ${port}`);
});

let date_ob=new Date();
let date=("0"+date_ob.getDate()).slice(-2);
let month=("0"+(date_ob.getMonth()+1)).slice(-2);
let year=date_ob.getFullYear();
var FDate=date+"/"+month+"/"+year;
console.log(FDate);