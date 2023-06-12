const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const requireLogin = require("../middleware/requireLogin");
const ObjectId = require("mongodb").ObjectId;

const reviewRoutes = express.Router();
const dbo = require("../db/conn");

reviewRoutes.post("/review/add", requireLogin, function (req, response) {
  let db_connect = dbo.getDb();
  let myobj = {
    bookID: req.body.bookID,
    userId: req.body.userId,
    review: req.body.review,
    rating: req.body.rating,
  };
  if (!myobj.bookID || !myobj.userId) {
    return response
      .status(422)
      .json({ error: "You will need to give all information" });
  }
  db_connect.collection("reviews").insertOne(myobj, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
});

reviewRoutes.get("/review/:id", function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { bookID: req.params.id };
  db_connect
    .collection("reviews")
    .find(myquery)
    .toArray(function (err, result) {
      if (err) throw err;

      // Get the user IDs from the review data
      const userIds = result.map((review) => review.userId);

      // Convert user IDs to ObjectId type
      const userIdsAsObjectIds = userIds.map((userId) => ObjectId(userId));

      // Query the newUser collection to get the user name
      db_connect
        .collection("newUser")
        .find({ _id: { $in: userIdsAsObjectIds } })
        .toArray(function (err, userResult) {
          if (err) throw err;

          // Map the user names to the respective review objects
          const reviewsWithUsernames = result.map((review) => {
            const user = userResult.find(
              (user) => user._id.toString() === review.userId
            );
            return {
              ...review,
              username: user ? user.name : "Unknown User",
            };
          });

          res.json(reviewsWithUsernames);
        });
    });
});

module.exports = reviewRoutes;
