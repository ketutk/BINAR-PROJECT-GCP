const express = require("express");
const router = express.Router();
const authRoute = require("./auth");
const notifRoute = require("./notifications");
const profileRoute = require("./profile");
const categoryRoute = require("./category");

/* GET home page. */
router.use("/auth", authRoute);
router.use("/notification", notifRoute);
router.use("/profile", profileRoute);
router.use("/category", categoryRoute);

module.exports = router;
