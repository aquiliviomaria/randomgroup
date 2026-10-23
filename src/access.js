import { validateTournament } from "./engine.js";
const encoder = new TextEncoder();
const MAX_BYTES = 200_000;
async function keyFor(password, salt) {
  if (!globalThis.crypto?.subtle)
    throw new Error("Abra o site em HTTPS para proteger o acesso com senha.");
  const base = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 250_000 },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
function encode(bytes) {
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(text) {
  if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length > MAX_BYTES * 2)
    throw new Error("O acesso não é válido.");
  try {
    return Uint8Array.from(
      atob(text.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );
  } catch {
    throw new Error("O acesso não é válido.");
  }
}
async function transform(bytes, Stream) {
  const reader = new Blob([bytes])
    .stream()
    .pipeThrough(new Stream("deflate"))
    .getReader();
  const parts = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES)
        throw new Error("O acesso excede o limite permitido.");
      parts.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const output = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}
export async function protectTournament(tournament, password) {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  )
    throw new Error("Escolha uma senha entre 8 e 128 caracteres.");
  let bytes = encoder.encode(JSON.stringify(validateTournament(tournament)));
  if (bytes.length > MAX_BYTES)
    throw new Error("O torneio excede o limite permitido.");
  const compressed = typeof CompressionStream !== "undefined";
  if (compressed) bytes = await transform(bytes, CompressionStream);
  const salt = crypto.getRandomValues(new Uint8Array(16)),
    iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      await keyFor(password, salt),
      bytes,
    ),
  );
  const output = new Uint8Array(30 + cipher.length);
  output.set([1, compressed ? 1 : 0]);
  output.set(salt, 2);
  output.set(iv, 18);
  output.set(cipher, 30);
  return encode(output);
}
export async function unlockTournament(payload, password) {
  const data = decode(payload);
  if (data.length < 47 || data[0] !== 1 || data[1] > 1)
    throw new Error("O acesso não é válido ou usa uma versão não suportada.");
  let bytes;
  try {
    bytes = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: data.slice(18, 30) },
        await keyFor(password, data.slice(2, 18)),
        data.slice(30),
      ),
    );
  } catch {
    throw new Error("Senha incorrecta ou acesso danificado.");
  }
  if (data[1]) {
    if (typeof DecompressionStream === "undefined")
      throw new Error("Actualize o navegador para abrir este acesso.");
    bytes = await transform(bytes, DecompressionStream);
  }
  try {
    return validateTournament(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    throw new Error("Os dados deste acesso não são válidos.");
  }
}
export function accessPayload(value) {
  const text = value.trim();
  if (text.startsWith("RG1.")) return text.slice(4);
  const match = text.match(/#torneio=([A-Za-z0-9_-]+)$/);
  if (match) return match[1];
  throw new Error(
    "Cole o link de acesso do RandomGroup ou abra um ficheiro de acesso.",
  );
}
export function accessLink(payload) {
  const url = new URL(window.location.href);
  url.hash = `torneio=${payload}`;
  return url.href;
}
