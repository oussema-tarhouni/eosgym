const express = require("express");
const router = express.Router();
const controller = require("../controllers/admin");
const contentController = require("../controllers/content");
const { requireGateSession } = require("../middleware/admin");
const { upload } = require("../middleware/upload");

router.use(requireGateSession);

router.get("/stats", controller.stats);

router.get("/users", controller.listUsers);
router.post("/users", controller.createUser);
router.put("/users/:id", controller.updateUser);
router.post("/users/:id/reset-password", controller.resetUserPassword);
router.delete("/users/:id", controller.deleteUser);

router.get("/pending-approvals", controller.listPendingApprovals);
router.post("/users/:id/approve", controller.approveUser);
router.post("/users/:id/reject", controller.rejectUser);

router.get("/trainers", controller.listTrainers);
router.post("/trainers", controller.createTrainer);
router.put("/trainers/:id", controller.updateTrainer);
router.delete("/trainers/:id", controller.deleteTrainer);

router.get("/classes", controller.listClasses);
router.post("/classes", controller.createClass);
router.put("/classes/:id", controller.updateClass);
router.delete("/classes/:id", controller.deleteClass);

router.get("/class-categories", controller.listClassCategories);
router.post("/class-categories", controller.createClassCategory);
router.put("/class-categories/:id", controller.updateClassCategory);
router.delete("/class-categories/:id", controller.deleteClassCategory);

router.get("/plans", controller.listPlans);
router.post("/plans", controller.createPlan);
router.put("/plans/:id", controller.updatePlan);
router.delete("/plans/:id", controller.deletePlan);

router.get("/memberships", controller.listMemberships);
router.put("/memberships/:id", controller.updateMembership);
router.delete("/memberships/:id", controller.deleteMembership);

router.get("/bookings", controller.listBookings);
router.put("/bookings/:id", controller.updateBookingStatus);

router.get("/workouts", controller.listWorkouts);
router.post("/workouts", controller.createWorkout);
router.put("/workouts/:id", controller.updateWorkout);
router.delete("/workouts/:id", controller.deleteWorkout);

router.get("/diet-logs", controller.listDietLogs);
router.post("/diet-logs", controller.createDietLog);
router.put("/diet-logs/:id", controller.updateDietLog);
router.delete("/diet-logs/:id", controller.deleteDietLog);

router.get("/products", controller.listProducts);
router.post("/products", upload.single("image"), controller.createProduct);
router.put("/products/:id", upload.single("image"), controller.updateProduct);
router.delete("/products/:id", controller.deleteProduct);

router.get("/posters", contentController.listPostersAdmin);
router.post("/posters", upload.single("image"), contentController.createPoster);
router.put("/posters/:id", upload.single("image"), contentController.updatePoster);
router.delete("/posters/:id", contentController.deletePoster);

router.get("/orders", controller.listOrders);
router.get("/orders/:id/items", controller.orderItems);
router.put("/orders/:id", controller.updateOrder);

router.get("/announcements", contentController.listAnnouncementsAdmin);
router.post("/announcements", upload.single("image"), contentController.createAnnouncement);
router.put("/announcements/:id", upload.single("image"), contentController.updateAnnouncement);
router.delete("/announcements/:id", contentController.deleteAnnouncement);

router.post("/notifications/send", upload.single("image"), contentController.sendNotification);
router.get("/notifications", controller.listNotifications);
router.post("/notifications", controller.createNotification);
router.put("/notifications/:id", controller.updateNotification);
router.delete("/notifications/:id", controller.deleteNotification);

module.exports = router;
