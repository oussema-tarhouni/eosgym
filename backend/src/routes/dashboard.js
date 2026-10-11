const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboard");
const { authenticate } = require("../middleware/auth");

router.get("/home", authenticate, controller.home);

module.exports = router;
