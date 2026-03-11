import Link from "next/link";
import styles from "../admin.module.css";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage(props: Props) {
  const sp = (await props.searchParams) ?? {};
  const error = sp.error === "1";

  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ maxWidth: 400, paddingTop: 80 }}>
        <h1 className={styles.title}>管理画面ログイン</h1>
        {error ? (
          <p style={{ color: "rgba(255,100,100,0.9)", marginBottom: 16 }}>
            ユーザー名またはパスワードが違います。
          </p>
        ) : null}
        <form action="/api/admin-login" method="post" style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 13, color: "rgba(245,246,248,0.8)" }}>ユーザー名</span>
            <input
              type="text"
              name="user"
              required
              autoComplete="username"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.3)",
                color: "#f5f6f8",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 13, color: "rgba(245,246,248,0.8)" }}>パスワード</span>
            <input
              type="password"
              name="pass"
              required
              autoComplete="current-password"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.3)",
                color: "#f5f6f8",
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "12px 16px",
              borderRadius: 999,
              border: 0,
              background: "linear-gradient(90deg, var(--axis-accent), #f1d08a)",
              color: "#141414",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ログイン
          </button>
        </form>
        <p style={{ marginTop: 24 }}>
          <Link href="/" style={{ color: "rgba(245,246,248,0.8)" }}>
            ← トップへ
          </Link>
        </p>
      </main>
    </div>
  );
}
