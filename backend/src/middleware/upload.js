const multer = require("multer");

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.mimetype)) {
      return cb(new Error("Type d'image non autorisé (PNG, JPEG, WebP uniquement)"));
    }
    cb(null, true);
  },
});

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "Image trop grande (2 Mo max)" });
    return res.status(400).json({ error: err.message });
  }
  if (err && err.message) return res.status(400).json({ error: err.message });
  next(err);
}

module.exports = { upload, multerErrorHandler, MAX_AVATAR_SIZE };
