const Sentry = require("@sentry/node");

const sentryEnabled = !!(process.env.SENTRY_DSN && process.env.NODE_ENV !== "test");
if (sentryEnabled) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || "development", tracesSampleRate: 1.0 });
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth");
const classRoutes = require("./routes/classes");
const dashboardRoutes = require("./routes/dashboard");
const adminRoutes = require("./routes/admin");
const adminGateRoutes = require("./routes/adminGate");
const contentRoutes = require("./routes/content"); // CHANGED
const trainersRoutes = require("./routes/trainers");
const storeRoutes = require("./routes/store"); // CHANGED
const { multerErrorHandler } = require("./middleware/upload");

const app = express();

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

const frontendDist = path.join(__dirname, "../../frontend/dist/eos-angular");
const hasFrontend = fs.existsSync(path.join(frontendDist, "index.html"));

const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS || "http://localhost:4200")
  .split(",").map(o => o.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGINS, credentials: true, methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Session", "x-admin-script-secret"] }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  if (hasFrontend) return res.sendFile(path.join(frontendDist, "index.html"));
  res.json({ message: "EOS Fitness & Pilates API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-gate", adminGateRoutes);
app.use("/api/content", contentRoutes); // CHANGED
app.use("/api/trainers", trainersRoutes);
app.use("/api/store", storeRoutes); // CHANGED

app.use("/api", (req, res) => res.status(404).json({ error: "Route introuvable" }));

if (hasFrontend) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(multerErrorHandler);

if (sentryEnabled) Sentry.setupExpressErrorHandler(app);

app.use((err, req, res, next) => {
  console.error("Erreur non gérée:", err);
  res.status(500).json({ error: "Erreur serveur" });
});

module.exports = app;
