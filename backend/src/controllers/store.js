const Admin = require("../models/adminModel");
const Store = require("../models/storeModel");

async function listProducts(req, res) {
  try {
    res.json(await Store.listActiveProducts(req.query.category));
  } catch (err) {
    console.error("Erreur liste produits:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

async function checkout(req, res) {
  try {
    const items = req.body.items;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Panier vide" });
    const orderId = await Admin.createOrder(req.userId, items);
    res.status(201).json({ id: orderId });
  } catch (err) {
    console.error("Erreur checkout:", err);
    res.status(400).json({ error: err.message || "Erreur serveur" });
  }
}

async function myOrders(req, res) {
  try {
    res.json(await Store.listOrdersForUser(req.userId));
  } catch (err) {
    console.error("Erreur mes commandes:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

module.exports = { listProducts, checkout, myOrders };
