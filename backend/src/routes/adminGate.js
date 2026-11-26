const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminGate");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/generate", controller.generate);
router.get("/check/:code", controller.check);
router.post("/verify", authLimiter, controller.verify);

router.get("/session", controller.checkSession);
router.post("/logout", controller.logout);

module.exports = router;
