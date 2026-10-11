const express = require("express");
const router = express.Router();
const controller = require("../controllers/content");
const { authenticate } = require("../middleware/auth");

// Public, unauthenticated reads for the home page feed/widget.
router.get("/posters", controller.listPostersPublic);
router.get("/notifications", controller.listNotificationsPublic);

// Per-user notifications (requires login)
router.get("/my-notifications", authenticate, controller.listMyNotifications);
router.post("/my-notifications/read", authenticate, controller.markMyNotificationsRead);

module.exports = router;
