import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, type SessionPayload } from "@/lib/authToken";
import { getCredentialMeta } from "@/lib/authDb";

export const SESSION_COOKIE = "admin_session";

// サーバー側でセッションを読み取り、署名・有効期限・session_version まで検証する。
// session_version が現在の値と違う＝パスワードが変更された後の古いログイン → 無効。
export async function readSession(): Promise<SessionPayload | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const payload = await verifyToken(token, secret);
  if (!payload) return null;

  let meta: { sessionVersion: number } | null;
  try {
    meta = await getCredentialMeta(payload.role);
  } catch {
    return null;
  }
  if (!meta) return null;
  if (meta.sessionVersion !== payload.ver) return null;

  return payload;
}

// ログイン必須（admin / member どちらでも可）。未ログインならログイン画面へ。
export async function requireSession(): Promise<SessionPayload> {
  const session = await readSession();
  if (!session) redirect("/admin/login");
  return session;
}

// admin 専用。member や未ログインは弾く。
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await readSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "admin") redirect("/admin");
  return session;
}
