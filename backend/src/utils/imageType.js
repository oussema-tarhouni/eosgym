const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
const WEBP_SIGNATURE = Buffer.from("WEBP");

function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  if (buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return "png";
  if (buffer.subarray(0, 3).equals(JPEG_SIGNATURE) && (buffer[3] === 0xff || buffer[3] === 0xe0 || buffer[3] === 0xe1)) return "jpeg";
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).equals(WEBP_SIGNATURE)) return "webp";
  return null;
}

function imageMimeType(type) {
  return { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" }[type] || "application/octet-stream";
}

module.exports = { detectImageType, imageMimeType };
