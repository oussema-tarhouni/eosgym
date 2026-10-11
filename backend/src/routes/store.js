const express = require("express");
const router = express.Router();
const controller = require("../controllers/store");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/products", controller.listProducts);
router.post("/orders", controller.checkout);
router.get("/orders/mine", controller.myOrders);

module.exports = router;
