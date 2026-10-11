/**
 * Run with: node scripts/access-admin.js   (from the backend/ folder)
 * Requires: npm install open --save-dev
 * Requires env vars in eos_env.env: ADMIN_SCRIPT_SECRET (and optionally BACKEND_URL / FRONTEND_URL)
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../eos_env.env") });
const open = require("open");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4200";
const SECRET = process.env.ADMIN_SCRIPT_SECRET;

async function main() {
  if (!SECRET) {
    console.error("Missing ADMIN_SCRIPT_SECRET in eos_env.env");
    process.exit(1);
  }

  const res = await fetch(`${BACKEND_URL}/api/admin-gate/generate`, {
    method: "POST",
    headers: { "x-admin-script-secret": SECRET },
  });

  if (!res.ok) {
    console.error("Failed to generate code:", res.status, await res.text());
    process.exit(1);
  }

  const { code } = await res.json();
  const url = `${FRONTEND_URL}/admin/${code}`;

  console.log("\nAdmin access link (valid 10 minutes, single use):");
  console.log(url + "\n");

}

main();
