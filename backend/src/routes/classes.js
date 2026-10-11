const express = require("express");
const router = express.Router();
const controller = require("../controllers/classes");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/", controller.list);
router.get("/bookings", controller.myBookings);
router.post("/:id/book", controller.book);
router.delete("/:id/book", controller.cancelBooking);

module.exports = router;
