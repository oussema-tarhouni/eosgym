const ClassModel = require("../models/classModel");
const Booking = require("../models/bookingModel");
const Membership = require("../models/membershipModel");

async function list(req, res) {
  try {
    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to = req.query.to ? new Date(req.query.to) : undefined;
    res.json(await ClassModel.getUpcoming({ from, to }));
  } catch (err) {
    console.error("Erreur liste des cours:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function book(req, res) {
  try {
    const classItem = await ClassModel.findById(req.params.id);
    if (!classItem) return res.status(404).json({ error: "Cours introuvable" });
    if (classItem.spots_left <= 0) return res.status(409).json({ error: "Ce cours est complet" });

    const existing = await Booking.findActive(req.userId, classItem.id);
    if (existing) return res.status(409).json({ error: "Vous êtes déjà inscrit(e) à ce cours" });

    const membership = await Membership.getActiveForUser(req.userId);
    if (!membership) return res.status(403).json({ error: "Aucun abonnement actif" });
    if (membership.classes_per_month !== null && membership.classes_used_this_month >= membership.classes_per_month) {
      return res.status(403).json({ error: "Quota de cours atteint pour ce mois" });
    }

    const bookingId = await Booking.create(req.userId, classItem.id);
    await Membership.incrementClassesUsed(membership.id);

    res.status(201).json({ id: bookingId, class_id: classItem.id });
  } catch (err) {
    console.error("Erreur réservation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function cancelBooking(req, res) {
  try {
    const cancelled = await Booking.cancel(req.userId, req.params.id);
    if (!cancelled) return res.status(404).json({ error: "Réservation introuvable" });
    res.json({ message: "Réservation annulée" });
  } catch (err) {
    console.error("Erreur annulation:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function myBookings(req, res) {
  try {
    res.json(await Booking.getForUser(req.userId));
  } catch (err) {
    console.error("Erreur réservations:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { list, book, cancelBooking, myBookings };
