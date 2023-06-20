const dbo = require("../db/conn");

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

module.exports = {
  admin,
};
