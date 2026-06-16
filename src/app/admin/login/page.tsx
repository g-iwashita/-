import Link from "next/link";
import styles from "../admin.module.css";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const inputStyle: React.CSSProperties = {
  padding: "11px 13px",
  borderRadius: 12,
  border: "1px solid #d8dde6",
  background: "#ffffff",
  color: "#1a1f36",
  fontSize: 14,
};

export default async function AdminLoginPage(props: Props) {
  const sp = (await props.searchParams) ?? {};
  const error = sp.error === "1";
  const changedAdmin = sp.changed === "admin";

  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ maxWidth: 420, paddingTop: 64 }}>
        <h1 className={styles.title}>管理画面ログイン</h1>
        {changedAdmin ? (
          <p style={{ color: "#2e7d46", marginBottom: 16 }}>
            管理者用パスワードを変更しました。新しいパスワードでログインしてください。
          </p>
        ) : null}
        {error ? (
          <p style={{ color: "#8b2e2e", marginBottom: 16 }}>
            ユーザー名またはパスワードが違います。
          </p>
        ) : null}
        <form
          action="/api/admin-login"
          method="post"
          style={{
            display: "grid",
            gap: 14,
            background: "#ffffff",
            border: "1px solid #e2e6ec",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 13, color: "#5a6478" }}>
              ユーザー名（管理者は admin、メンバーは member）
            </span>
            <input type="text" name="user" required autoComplete="username" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 13, color: "#5a6478" }}>パスワード</span>
            <input type="password" name="pass" required autoComplete="current-password" style={inputStyle} />
          </label>
          <button
            type="submit"
            style={{
              marginTop: 4,
              padding: "12px 16px",
              borderRadius: 999,
              border: 0,
              background: "#22335a",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ログイン
          </button>
        </form>
        <p style={{ marginTop: 24 }}>
          <Link href="/" style={{ color: "#6b7588" }}>
            ← トップへ
          </Link>
        </p>
      </main>
    </div>
  );
}
