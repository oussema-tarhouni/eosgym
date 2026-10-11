const MIME_BY_EXT = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" };

function uploadAvatar(buffer, ext) {
  const mime = MIME_BY_EXT[ext] || "application/octet-stream";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function buildPublicUrl(url) { return url; }

function extractKeyFromUrl(url) {
  if (typeof url !== "string" || !url.startsWith("data:image/")) return null;
  return url;
}

async function deleteAvatar() {}

module.exports = { uploadAvatar, deleteAvatar, extractKeyFromUrl, buildPublicUrl };
