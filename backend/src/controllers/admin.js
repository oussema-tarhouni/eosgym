const Admin = require("../models/adminModel");
const Approval = require("../models/approvalModel"); // CHANGED
const storage = require("../services/storage");
const { detectImageType } = require("../utils/imageType");

async function handleProductImageUpload(req) {
  if (!req.file) return undefined;
  const type = detectImageType(req.file.buffer);
  if (!type) { const e = new Error("Image invalide ou corrompue"); e.status = 400; throw e; }
  const key = await storage.uploadAvatar(req.file.buffer, type);
  return storage.buildPublicUrl(key);
}

const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error("Erreur admin:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  stats: wrap(async (req, res) => res.json(await Admin.getStats())),

  // users
  listUsers: wrap(async (req, res) => res.json(await Admin.listUsers())),
  updateUser: wrap(async (req, res) => {
    await Admin.updateUser(req.params.id, req.body);
    res.json({ message: "Utilisateur mis à jour" });
  }),
  deleteUser: wrap(async (req, res) => {
    const ok = await Admin.deleteUser(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Utilisateur supprimé" });
  }),

  // CHANGED: pending account approvals
  listPendingApprovals: wrap(async (req, res) => res.json(await Approval.listPendingUsers())),
  approveUser: wrap(async (req, res) => {
    const ok = await Approval.approve(req.params.id);
    if (!ok) return res.status(404).json({ error: "Aucune demande en attente pour cet utilisateur" });
    res.json({ message: "Compte approuvé" });
  }),
  rejectUser: wrap(async (req, res) => {
    const ok = await Approval.reject(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Compte refusé" });
  }),

  // trainers
  listTrainers: wrap(async (req, res) => res.json(await Admin.listTrainers())),
  createTrainer: wrap(async (req, res) => res.status(201).json({ id: await Admin.createTrainer(req.body) })),
  updateTrainer: wrap(async (req, res) => {
    await Admin.updateTrainer(req.params.id, req.body);
    res.json({ message: "Coach mis à jour" });
  }),
  deleteTrainer: wrap(async (req, res) => {
    const ok = await Admin.deleteTrainer(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Coach supprimé" });
  }),

  // classes
  listClasses: wrap(async (req, res) => res.json(await Admin.listClasses())),
  createClass: wrap(async (req, res) => res.status(201).json({ id: await Admin.createClass(req.body) })),
  updateClass: wrap(async (req, res) => {
    await Admin.updateClass(req.params.id, req.body);
    res.json({ message: "Cours mis à jour" });
  }),
  deleteClass: wrap(async (req, res) => {
    const ok = await Admin.deleteClass(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Cours supprimé" });
  }),

  // membership plans
  listPlans: wrap(async (req, res) => res.json(await Admin.listPlans())),
  createPlan: wrap(async (req, res) => res.status(201).json({ id: await Admin.createPlan(req.body) })),
  updatePlan: wrap(async (req, res) => {
    await Admin.updatePlan(req.params.id, req.body);
    res.json({ message: "Formule mise à jour" });
  }),
  deletePlan: wrap(async (req, res) => {
    const ok = await Admin.deletePlan(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Formule supprimée" });
  }),

  // memberships
  listMemberships: wrap(async (req, res) => res.json(await Admin.listMemberships())),
  updateMembership: wrap(async (req, res) => {
    await Admin.updateMembership(req.params.id, req.body);
    res.json({ message: "Abonnement mis à jour" });
  }),
  deleteMembership: wrap(async (req, res) => {
    const ok = await Admin.deleteMembership(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Abonnement supprimé" });
  }),

  // bookings
  listBookings: wrap(async (req, res) => res.json(await Admin.listBookings())),
  updateBookingStatus: wrap(async (req, res) => {
    const ok = await Admin.updateBookingStatus(req.params.id, req.body.status);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Réservation mise à jour" });
  }),

  // store products
  listProducts: wrap(async (req, res) => res.json(await Admin.listProducts())),
  createProduct: wrap(async (req, res) => {
    const data = { ...req.body };
    const image_url = await handleProductImageUpload(req);
    if (image_url) data.image_url = image_url;
    if (data.is_active !== undefined) data.is_active = data.is_active === 'true' || data.is_active === '1' ? 1 : 0;
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    res.status(201).json({ id: await Admin.createProduct(data) });
  }),
  updateProduct: wrap(async (req, res) => {
    const data = { ...req.body };
    const image_url = await handleProductImageUpload(req);
    if (image_url) data.image_url = image_url;
    if (data.is_active !== undefined) data.is_active = data.is_active === 'true' || data.is_active === '1' ? 1 : 0;
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    await Admin.updateProduct(req.params.id, data);
    res.json({ message: "Produit mis à jour" });
  }),
  deleteProduct: wrap(async (req, res) => {
    const ok = await Admin.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Produit supprimé" });
  }),

  // class categories
  listClassCategories: wrap(async (req, res) => res.json(await Admin.listClassCategories())),
  createClassCategory: wrap(async (req, res) => res.status(201).json({ id: await Admin.createClassCategory(req.body) })),
  updateClassCategory: wrap(async (req, res) => { await Admin.updateClassCategory(req.params.id, req.body); res.json({ message: "OK" }); }),
  deleteClassCategory: wrap(async (req, res) => {
    const ok = await Admin.deleteClassCategory(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Supprimé" });
  }),

  // workouts
  listWorkouts: wrap(async (req, res) => res.json(await Admin.listWorkouts())),
  createWorkout: wrap(async (req, res) => res.status(201).json({ id: await Admin.createWorkout(req.body) })),
  updateWorkout: wrap(async (req, res) => { await Admin.updateWorkout(req.params.id, req.body); res.json({ message: "OK" }); }),
  deleteWorkout: wrap(async (req, res) => {
    const ok = await Admin.deleteWorkout(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Supprimé" });
  }),

  // diet logs
  listDietLogs: wrap(async (req, res) => res.json(await Admin.listDietLogs())),
  createDietLog: wrap(async (req, res) => res.status(201).json({ id: await Admin.createDietLog(req.body) })),
  updateDietLog: wrap(async (req, res) => { await Admin.updateDietLog(req.params.id, req.body); res.json({ message: "OK" }); }),
  deleteDietLog: wrap(async (req, res) => {
    const ok = await Admin.deleteDietLog(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Supprimé" });
  }),

  // notifications
  listNotifications: wrap(async (req, res) => res.json(await Admin.listNotifications())),
  createNotification: wrap(async (req, res) => res.status(201).json({ id: await Admin.createNotification(req.body) })),
  updateNotification: wrap(async (req, res) => { await Admin.updateNotification(req.params.id, req.body); res.json({ message: "OK" }); }),
  deleteNotification: wrap(async (req, res) => {
    const ok = await Admin.deleteNotification(req.params.id);
    if (!ok) return res.status(404).json({ error: "Introuvable" });
    res.json({ message: "Supprimé" });
  }),
};
