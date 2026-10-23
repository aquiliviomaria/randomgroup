import { brandedQRCode } from "./branded-qr.js";
export function exportHeader(heading, subtitle) {
  const header = document.createElement("header");
  Object.assign(header.style, {
    padding: "0 30px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
  });
  const title = document.createElement("div");
  title.style.cssText = "min-width:0;flex:1";
  const brand = document.createElement("div");
  brand.style.cssText =
    "display:flex;align-items:center;gap:24px;margin-bottom:18px";
  const sourceLogo = document.querySelector(".topbar .brand");
  const wordmark = sourceLogo
    ? sourceLogo.cloneNode(true)
    : document.createElement("strong");
  if (!sourceLogo) wordmark.textContent = "RandomGroup.";
  wordmark.removeAttribute("aria-label");
  wordmark.setAttribute("tabindex", "-1");
  wordmark.style.fontSize = "27px";
  wordmark.style.pointerEvents = "none";
  const slogan = document.createElement("span");
  slogan.textContent = "Juntos, por acaso.";
  slogan.style.cssText =
    "border-left:1px solid #dce3ef;padding-left:24px;color:#526078;font-size:16px;font-weight:500;white-space:nowrap";
  brand.append(wordmark, slogan);
  const name = document.createElement("span");
  name.textContent = heading;
  name.style.cssText = "font-size:26px;font-weight:700;overflow-wrap:anywhere";
  title.append(brand, name);
  header.append(title);
  const meta = document.createElement("span");
  meta.textContent = subtitle;
  meta.style.cssText = "font-size:16px;white-space:nowrap";
  header.append(meta);
  return header;
}
export async function exportFooter() {
  const footer = document.createElement("footer");
  footer.style.cssText =
    "padding:12px 30px 0;display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:12px;color:#526078";
  const date = document.createElement("span");
  date.textContent = new Date().toLocaleString("pt-PT", {
    timeZone: "Africa/Maputo",
  });
  const signature = document.createElement("div");
  signature.style.cssText = "display:flex;align-items:center;gap:10px";
  const signatureText = document.createElement("div");
  signatureText.textContent = "Created & Designed by Aquilivio Maria";
  const domain = document.createElement("small");
  domain.textContent = "randomgroup.vercel.app";
  domain.style.cssText =
    "display:block;text-align:right;font-size:10px;margin-top:5px";
  signatureText.append(domain);
  const qr = document.createElement("img");
  qr.src = await brandedQRCode();
  qr.width = 54;
  qr.height = 54;
  qr.alt = "QR code do RandomGroup";
  signature.append(signatureText, qr);
  footer.append(date, signature);
  return footer;
}
