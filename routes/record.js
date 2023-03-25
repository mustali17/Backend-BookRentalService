const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

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
recordRoutes.get("/record", function (req, res) {
  let db_connect = dbo.getDb();
  db_connect
    .collection("records")
    .find({ onRent: false })
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

// This section will help you get a single record by id
recordRoutes.route("/record/:id").get(function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection("records").findOne(myquery, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

recordRoutes.patch("/onrent/:bookID", async (req, res) => {
  try {
    const { bookID } = req.params;
    let db_connect = dbo.getDb();
    const record = await db_connect.collection("records").findOneAndUpdate(
      { _id: ObjectId(bookID) },
      { $set: { onRent: true } },
      { returnOriginal: false } // Return the updated record
    );

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const multer = require("multer");
const { google } = require("googleapis");
const path = require("path");
const drive = google.drive({
  version: "v3",
  auth: new google.auth.OAuth2(
    "981631801421-rmos0icjmseinlpn60njbni5knar5kcb.apps.googleusercontent.com",
    "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",
    "http://localhost:3000/auth/google/callback"
  ),
});
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../BookRentalService/src/components/books");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
const stream = require("stream");
// const upload = multer({ storage: storage });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});
recordRoutes.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // create a file in Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: req.file.originalname,
        mimeType: req.file.mimetype,
      },
      media: {
        mimeType: req.file.mimetype,
        body: req.file.buffer,
        // use a transform to convert the buffer to a readable stream
        body: req.file.buffer
          ? new stream.PassThrough().end(req.file.buffer)
          : null,
      },
    });
    res.send("File uploaded successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong!");
  }
});
recordRoutes.post(
  "/record/add",
  requireLogin,
  upload.single("image"),
  function (req, response) {
    let db_connect = dbo.getDb();
    let myobj = {
      bookname: req.body.bookname,
      authorname: req.body.authorname,
      desc: req.body.desc,
      price: req.body.price,
      imgurl: req.file.filename, // Use the filename of the uploaded image
      ownermail: req.body.ownermail,
      onRent: false,
    };
    if (
      !myobj.bookname ||
      !myobj.authorname ||
      !myobj.desc ||
      !myobj.price ||
      !myobj.ownermail
    ) {
      return response
        .status(422)
        .json({ error: "You will need to give all information" });
    }
    db_connect.collection("records").insertOne(myobj, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
  }
);

recordRoutes.route("/update/:id").post(function (req, response) {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  let newvalues = {
    $set: {
      bookname: req.body.bookname,
      authorname: req.body.authorname,
      desc: req.body.desc,
      price: req.body.price,
      imgurl: req.body.imgurl,
      ownermail: req.body.ownermail,
    },
  };
});

// This section will help you delete a record
recordRoutes.route("/:id").delete((req, response) => {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
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
