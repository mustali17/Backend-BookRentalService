const express = require("express");
const app = express();
const authRoutes = express.Router();
const requireLogin = require("../middleware/requireLogin");
const authControllers = require("../controllers/authControllers");

authRoutes.post("/user/signup", authControllers.signup);

authRoutes.post("/user/signin", authControllers.signin);

authRoutes.get("/user/:id", requireLogin, authControllers.getUserbyID);

authRoutes.post("/user/update/:id", authControllers.updateUser);
authRoutes.get("/admin", authControllers.admin);

authRoutes.post("/user/addusername/:email", authControllers.addUsername);

authRoutes.get("/getusers", authControllers.getUsers);

authRoutes.put("/:id", authControllers.updateUserbyId);

authRoutes.route("/delete/:id").delete(authControllers.deleteUser);

module.exports = authRoutes;
