const Trainer = require("../models/trainerModel");

async function list(req, res) {
  try {
    const trainers = await Trainer.getAll();
    res.json(trainers);
  } catch (err) {
    console.error("Erreur trainers:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { list };
