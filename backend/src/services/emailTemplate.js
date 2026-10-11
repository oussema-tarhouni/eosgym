// Shared dark/gold email layout matching the app (auth pages). Needs logo.png (cid:eoslogo) attached.
const GOLD = "#c9a227", GOLD_L = "#e6cd85";
const font = "Poppins,'Segoe UI',Arial,sans-serif";

function emailLayout({ eyebrow = "", title, intro, code, cta, link, note }) {
  const codeBlock = code
    ? `<tr><td align="center" style="padding:8px 32px 24px"><div style="display:inline-block;background:#111;border:1.5px solid ${GOLD};border-radius:12px;padding:16px 26px;font-size:34px;font-weight:700;letter-spacing:10px;color:${GOLD_L};font-family:'Courier New',monospace">${code}</div></td></tr>`
    : "";
  const btn = link
    ? `<tr><td align="center" style="padding:8px 32px 20px"><a href="${link}" style="display:inline-block;background-color:${GOLD};background-image:linear-gradient(90deg,${GOLD},${GOLD_L});color:#161616;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:1px;text-transform:uppercase;padding:15px 34px;border-radius:12px;font-family:${font}">${cta}</a></td></tr>
<tr><td style="padding:0 32px 8px;text-align:center"><p style="margin:0 0 6px;font-size:12px;color:#8a8a8a">Le bouton ne fonctionne pas ? Copiez ce lien :</p><p style="margin:0 0 8px;font-size:12px;word-break:break-all"><a href="${link}" style="color:${GOLD_L}">${link}</a></p></td></tr>`
    : "";
  return `<!DOCTYPE html><html lang="fr"><body style="margin:0;padding:0;background:#0f0f0f">
<div style="display:none;max-height:0;overflow:hidden">${intro}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#161616;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;font-family:${font}">
<tr><td align="center" style="padding:32px 24px 8px"><img src="cid:eoslogo" width="130" alt="EOS Fitness &amp; Pilates" style="display:block;border:0"></td></tr>
<tr><td style="padding:12px 32px 0"><div style="height:2px;background:${GOLD};opacity:.8"></div></td></tr>
<tr><td style="padding:28px 32px 8px;text-align:center">
${eyebrow ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${GOLD_L};font-weight:600">${eyebrow}</p>` : ""}
<h1 style="margin:0 0 12px;font-size:24px;font-weight:500;color:#f5f5f5">${title}</h1>
<p style="margin:0;font-size:14.5px;color:#a0a0a0;line-height:1.6">${intro}</p></td></tr>
<tr><td style="height:20px"></td></tr>
${codeBlock}${btn}
<tr><td style="padding:12px 32px 30px;text-align:center"><p style="margin:0;font-size:13px;color:#8a8a8a;line-height:1.6">${note}</p></td></tr>
<tr><td style="background:#111;border-top:1px solid #2a2a2a;padding:16px;text-align:center;font-size:12px;color:#6f6f6f">&copy; EOS Fitness &amp; Pilates</td></tr>
</table></td></tr></table></body></html>`;
}
module.exports = { emailLayout };
