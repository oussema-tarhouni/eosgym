const express = require("express");
const router = express.Router();
const controller = require("../controllers/trainers");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, controller.list);

module.exports = router;
