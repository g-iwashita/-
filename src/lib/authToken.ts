// 管理画面のセッショントークン（署名付き）。
// Web Crypto(HMAC-SHA256) で署名するため、Edge(middleware) でも Node でも同じコードで動く。
// 形式: base64url(JSON payload) + "." + base64url(署名)

export type Role = "admin" | "member";

export type SessionPayload = {
  role: Role;
  ver: number; // app_credentials.session_version。パスワード変更で失効判定に使う
  iat: number; // 発行時刻(秒)
};

// セッションの有効期限（7日）
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64urlDecode(s: string): Uint8Array {
  let b64 = s.replaceAll("-", "+").replaceAll("_", "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// crypto.subtle は ArrayBuffer 由来のビューを要求するため、確実に ArrayBuffer に載せ替える。
function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(view.byteLength);
  new Uint8Array(out).set(view);
  return out;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(encoder.encode(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(payload: SessionPayload, secret: string): Promise<string> {
  const body = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, toArrayBuffer(encoder.encode(body)));
  return `${body}.${base64urlEncode(new Uint8Array(sig))}`;
}

// 署名・構造・有効期限を検証する。問題なければ payload、ダメなら null。
// （session_version の照合は DB アクセスが必要なので lib/session.ts 側で行う）
export async function verifyToken(
  token: string | undefined | null,
  secret: string
): Promise<SessionPayload | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  let valid = false;
  try {
    const key = await importKey(secret);
    valid = await crypto.subtle.verify(
      "HMAC",
      key,
      toArrayBuffer(base64urlDecode(sig)),
      toArrayBuffer(encoder.encode(body))
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(decoder.decode(base64urlDecode(body))) as SessionPayload;
  } catch {
    return null;
  }

  if (payload.role !== "admin" && payload.role !== "member") return null;
  if (typeof payload.ver !== "number" || typeof payload.iat !== "number") return null;
  if (Date.now() / 1000 - payload.iat > SESSION_MAX_AGE_SEC) return null;

  return payload;
}
