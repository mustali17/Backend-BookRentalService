const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const admin = async (req, res) => {
  let db_connect = dbo.getDb();
  db_connect
    .collection("auth")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
};

const signup = async (req, response) => {
  let db_connect = dbo.getDb();
  const { name, lname, username, email, password, provider } = req.body;

  // check if user already exists in database
  if (provider == "google") {
    db_connect
      .collection("newUser")
      .findOne({ email })
      .then((existingUser) => {
        if (existingUser) {
          return response.json({
            error: "User already exists with this email",
          });
        } else {
          // if user does not exist in database, add user to database
          // bcrypt.hash(password, 12).then((hashedpasswoed) => {
          const user = {
            name,
            lname,
            username,
            email,
            password,
            provider,
            blocked: false,
          };

          db_connect
            .collection("newUser")
            .insertOne(user, function (err, result) {
              if (err) {
                console.log(err);
                return response
                  .status(500)
                  .json({ error: "Internal server error" });
              }
              response.json({
                message: "Welcome!",
              });
            });
          // });
        }
      })
      .catch((err) => {
        console.log(err);
        response.status(500).json({ error: "Internal server error" });
      });
  } else {
    if (!name || !username || !email || !password) {
      return response
        .status(422)
        .json({ error: "You will need to give all information" });
    }
    db_connect
      .collection("newUser")
      .findOne({ email })
      .then((existingUser) => {
        if (existingUser) {
          return response
            .status(422)
            .json({ error: "User already exists with this email" });
        } else {
          // if user does not exist in database, add user to database
          bcrypt.hash(password, 12).then((hashedpasswoed) => {
            const user = {
              name,
              username,
              email,
              password: hashedpasswoed,
              provider,
              blocked: false,
            };

            db_connect
              .collection("newUser")
              .insertOne(user, function (err, result) {
                if (err) throw err;
              });
            response.json({
              message: "Welcome!",
            });
          });
        }
      })
      .catch((err) => {
        console.log(err);
        response.status(500).json({ error: "Internal server error" });
      });
  }
};

const signin = async (req, response) => {
  let db_connect = dbo.getDb();
  const { email, password } = req.body;

  db_connect
    .collection("newUser")
    .findOne({ email: email })
    .then((savedUser) => {
      if (!savedUser) {
        return response.status(422).json({ error: "User does not exist!" });
      }
      if (savedUser.blocked) {
        return response.status(422).json({ error: "User is blocked!" });
      }
      bcrypt
        .compare(password, savedUser.password)
        .then((doMatch) => {
          if (doMatch) {
            const token = jwt.sign(
              { _id: savedUser._id },
              process.env.JWT_SECRET
            );
            const { _id, username, email } = savedUser;
            response.json({
              token,
              user: { _id, username, email },
              message: "Welcome!",
            });
            // response.json({message:"Welcome!"});
          } else {
            return response.status(422).json({ error: "Invalid Credentials" });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
};

const updateUser = async (req, response) => {
  let db_connect = dbo.getDb();
  let {
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
  } = req.body;
  let myquery = { _id: ObjectId(req.params.id) };
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
  };
  db_connect
    .collection("newUser")
    .updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
};

const addUsername = async (req, response) => {
  let db_connect = dbo.getDb();
  let { username, password } = req.body;
  let myquery = { email: req.params.email };
  bcrypt.hash(password, 12).then((hashedpasswoed) => {
    let newvalues = {
      $set: {
        username,
        password: hashedpasswoed,
      },
    };
    db_connect
      .collection("newUser")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        response.json(res);
      });
  });
};

const getUsers = async (req, res) => {
  let db_connect = dbo.getDb("newUser");
  db_connect
    .collection("newUser")
    .find({}, { projection: { password: 0 } })
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
};

const getUserbyID = async (req, res) => {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection("newUser").findOne(myquery, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
};

const deleteUser = async (req, response) => {
  const db_connect = dbo.getDb();
  const userId = ObjectId(req.params.id);

  db_connect.collection("newUser").findOne({ _id: userId }, (err, user) => {
    if (err) {
      console.error(err);
      response.status(500).send("Internal Server Error");
      return;
    }

    if (!user) {
      response.status(404).send("User not found");
      return;
    }

    const userQuery = { _id: userId };
    db_connect.collection("newUser").deleteOne(userQuery, (err, result) => {
      if (err) {
        console.error(err);
        response.status(500).send("Internal Server Error");
        return;
      }

      if (result.deletedCount === 0) {
        response.status(404).send("User not found");
        return;
      }

      console.log("User document deleted:", userId);
    });
  });
};

const updateUserbyId = async (req, res) => {
  const id = req.params.id;
  let db_connect = dbo.getDb();
  const updatedUser = req.body;

  try {
    const result = await db_connect
      .collection("newUser")
      .updateOne({ _id: ObjectId(id) }, { $set: updatedUser });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user." });
  }
};

module.exports = {
  admin,
  signup,
  signin,
  updateUser,
  addUsername,
  getUsers,
  getUserbyID,
  deleteUser,
  updateUserbyId,
};
