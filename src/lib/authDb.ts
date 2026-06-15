import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { Role } from "@/lib/authToken";

// ===== 管理画面のログイン情報（admin / member）=====

// ログイン情報のメタ（パスワードは返さない）。セッションの失効判定に session_version を使う。
export async function getCredentialMeta(role: Role): Promise<{ sessionVersion: number } | null> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("app_credentials")
    .select("session_version")
    .eq("role", role)
    .maybeSingle<{ session_version: number }>();
  if (error) throw new Error(`credential read failed: ${error.message}`);
  return data ? { sessionVersion: data.session_version } : null;
}

// ログイン検証。成功したら現在の session_version を返す（トークンに埋め込む）。
export async function verifyLogin(role: Role, plain: string): Promise<{ sessionVersion: number } | null> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("app_credentials")
    .select("password_hash, session_version")
    .eq("role", role)
    .maybeSingle<{ password_hash: string; session_version: number }>();
  if (error) throw new Error(`credential read failed: ${error.message}`);
  if (!data) return null;
  if (!verifyPassword(plain, data.password_hash)) return null;
  return { sessionVersion: data.session_version };
}

// パスワード変更。session_version を +1 して既存ログインを失効させる。
export async function setPassword(role: Role, newPlain: string): Promise<void> {
  const sb = getSupabaseServerClient();
  const current = await getCredentialMeta(role);
  const nextVersion = (current?.sessionVersion ?? 1) + 1;

  const payload = {
    role,
    password_hash: hashPassword(newPlain),
    session_version: nextVersion,
    updated_at: new Date().toISOString(),
  };

  // 行があれば更新、なければ作成（初期投入も兼ねる）
  const { error } = await sb.from("app_credentials").upsert(payload, { onConflict: "role" });
  if (error) throw new Error(`credential update failed: ${error.message}`);
}

// ===== メール通知の送信先 =====

export type Recipient = {
  id: string;
  email: string;
  label: string | null;
  createdAt: string;
};

type RecipientRow = {
  id: string;
  email: string;
  label: string | null;
  created_at: string;
};

export async function listRecipients(): Promise<Recipient[]> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("notification_recipients")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<RecipientRow[]>();
  if (error) throw new Error(`recipients read failed: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    label: r.label,
    createdAt: r.created_at,
  }));
}

// 追加。すでに同じメアドがあれば false を返す（重複は静かにスキップ）。
export async function addRecipient(email: string, label: string | null): Promise<boolean> {
  const sb = getSupabaseServerClient();
  const { error } = await sb
    .from("notification_recipients")
    .insert({ email, label: label || null });
  if (error) {
    // unique 制約違反（重複）は想定内
    if (error.code === "23505") return false;
    throw new Error(`recipient insert failed: ${error.message}`);
  }
  return true;
}

export async function deleteRecipient(id: string): Promise<void> {
  const sb = getSupabaseServerClient();
  const { error } = await sb.from("notification_recipients").delete().eq("id", id);
  if (error) throw new Error(`recipient delete failed: ${error.message}`);
}
