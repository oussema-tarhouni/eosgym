const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth");
const { authenticate } = require("../middleware/auth");
const { authLimiter, emailLimiter, otpLimiter, refreshLimiter } = require("../middleware/rateLimiter");
const { upload } = require("../middleware/upload");

router.post("/register", authLimiter, upload.single("avatar"), controller.register);
router.post("/login", authLimiter, controller.login);
router.get("/me", authenticate, controller.me);
router.put("/profile", authenticate, upload.single("avatar"), controller.updateProfile);
router.put("/password", authenticate, controller.changePassword);

router.post("/send-otp", authenticate, otpLimiter, controller.sendOtp);
router.post("/verify-otp", authenticate, otpLimiter, controller.verifyOtp);

router.get("/plans", authenticate, controller.getPlans); // CHANGED
router.post("/subscription", authenticate, controller.submitSubscription); // CHANGED

router.post("/forgot-password", emailLimiter, controller.forgotPassword);
router.post("/reset-password", emailLimiter, controller.resetPassword);
router.post("/verify-email", controller.verifyEmail);
router.post("/resend-verification", emailLimiter, controller.resendVerification);

router.post("/refresh", refreshLimiter, controller.refresh);
router.post("/logout", controller.logout);

module.exports = router;
