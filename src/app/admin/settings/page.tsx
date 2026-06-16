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
  padding: "11px 13px",
  borderRadius: 12,
  border: "1px solid #d8dde6",
  background: "#ffffff",
  color: "#1a1f36",
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#5a6478",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 4,
  padding: "11px 22px",
  borderRadius: 999,
  border: 0,
  background: "#22335a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
  justifySelf: "start",
};

const cardStyle: React.CSSProperties = {
  padding: 22,
  borderRadius: 16,
  background: "#ffffff",
  border: "1px solid #e2e6ec",
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
          <p style={{ color: "#2e7d46", marginBottom: 16 }}>
            メンバー用パスワードを変更しました。新しいパスワードを残りのメンバーに共有してください。
          </p>
        ) : null}
        {errorCode && ERROR_MESSAGES[errorCode] ? (
          <p style={{ color: "#8b2e2e", marginBottom: 16 }}>{ERROR_MESSAGES[errorCode]}</p>
        ) : null}

        {/* メンバー用パスワード変更（退職対応はこちら） */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 17, margin: "0 0 4px" }}>メンバー用パスワードの変更</h2>
          <p style={{ color: "#5a6478", margin: "0 0 16px", lineHeight: 1.7, fontSize: 14 }}>
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
          <p style={{ color: "#5a6478", margin: "0 0 16px", lineHeight: 1.7, fontSize: 14 }}>
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
