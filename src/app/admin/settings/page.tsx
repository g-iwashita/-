import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { changePasswordAction } from "./actions";
import styles from "../admin.module.css";

// 認証必須ページ。常にリクエスト時にレンダリングする（静的化させない）。
export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_MESSAGES: Record<string, string> = {
  role: "対象アカウントが不正です。",
  mismatch: "確認用パスワードが一致しません。",
  weak: "パスワードは8文字以上にしてください。",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.3)",
  color: "#f5f6f8",
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(245,246,248,0.8)",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 4,
  padding: "10px 20px",
  borderRadius: 999,
  border: 0,
  background: "linear-gradient(90deg, var(--axis-accent), #f1d08a)",
  color: "#141414",
  fontWeight: 800,
  cursor: "pointer",
  justifySelf: "start",
};

const cardStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 16,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  marginBottom: 20,
};

export default async function SettingsPage(props: Props) {
  await requireAdmin();

  const sp = (await props.searchParams) ?? {};
  const changed = typeof sp.changed === "string" ? sp.changed : "";
  const errorCode = typeof sp.error === "string" ? sp.error : "";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/admin">
            ← 回答一覧に戻る
          </Link>
          <a className={styles.export} href="/api/admin-logout">
            ログアウト
          </a>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>設定</h1>

        {changed === "member" ? (
          <p style={{ color: "#7ddc9a", marginBottom: 16 }}>
            メンバー用パスワードを変更しました。新しいパスワードを残りのメンバーに共有してください。
          </p>
        ) : null}
        {errorCode && ERROR_MESSAGES[errorCode] ? (
          <p style={{ color: "rgba(255,120,120,0.95)", marginBottom: 16 }}>{ERROR_MESSAGES[errorCode]}</p>
        ) : null}

        {/* メンバー用パスワード変更（退職対応はこちら） */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 17, margin: "0 0 4px" }}>メンバー用パスワードの変更</h2>
          <p style={{ color: "rgba(245,246,248,0.65)", margin: "0 0 16px", lineHeight: 1.7, fontSize: 14 }}>
            変更すると、現在ログイン中のメンバー全員が自動的にログアウトされます。
            退職者が出たときは、ここで変更すれば即座にアクセスできなくなります。
            変更後は新しいパスワードを残りのメンバーへ共有してください。
          </p>
          <form action={changePasswordAction} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
            <input type="hidden" name="role" value="member" />
            <label style={{ display: "grid", gap: 4 }}>
              <span style={labelStyle}>新しいパスワード（8文字以上）</span>
              <input type="password" name="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={labelStyle}>確認のためもう一度</span>
              <input type="password" name="confirm" required minLength={8} autoComplete="new-password" style={inputStyle} />
            </label>
            <button type="submit" style={buttonStyle}>
              メンバー用パスワードを変更
            </button>
          </form>
        </div>

        {/* 管理者用パスワード変更 */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 17, margin: "0 0 4px" }}>管理者(admin)用パスワードの変更</h2>
          <p style={{ color: "rgba(245,246,248,0.65)", margin: "0 0 16px", lineHeight: 1.7, fontSize: 14 }}>
            変更すると、現在の管理者ログインも一度切れます。変更後は新しいパスワードで入り直してください。
          </p>
          <form action={changePasswordAction} style={{ display: "grid", gap: 12, maxWidth: 400 }}>
            <input type="hidden" name="role" value="admin" />
            <label style={{ display: "grid", gap: 4 }}>
              <span style={labelStyle}>新しいパスワード（8文字以上）</span>
              <input type="password" name="password" required minLength={8} autoComplete="new-password" style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={labelStyle}>確認のためもう一度</span>
              <input type="password" name="confirm" required minLength={8} autoComplete="new-password" style={inputStyle} />
            </label>
            <button type="submit" style={buttonStyle}>
              管理者用パスワードを変更
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
