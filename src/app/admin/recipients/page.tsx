import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { listRecipients } from "@/lib/authDb";
import { addRecipientAction, deleteRecipientAction } from "./actions";
import styles from "../admin.module.css";

// 認証必須ページ。常にリクエスト時にレンダリングする（静的化させない）。
export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "メールアドレスの形式が正しくありません。",
  dup: "そのメールアドレスはすでに登録されています。",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.3)",
  color: "#f5f6f8",
  minWidth: 0,
};

export default async function RecipientsPage(props: Props) {
  await requireAdmin();

  const sp = (await props.searchParams) ?? {};
  const added = sp.added === "1";
  const deleted = sp.deleted === "1";
  const errorCode = typeof sp.error === "string" ? sp.error : "";

  const recipients = await listRecipients();

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
        <h1 className={styles.title}>通知先メンバー</h1>
        <p style={{ color: "rgba(245,246,248,0.7)", marginTop: -8, marginBottom: 20, lineHeight: 1.7 }}>
          ここに登録したメールアドレス宛に、新しい診断回答が届くたびに通知メールが送られます。
        </p>

        {added ? (
          <p style={{ color: "#7ddc9a", marginBottom: 16 }}>通知先を追加しました。</p>
        ) : null}
        {deleted ? (
          <p style={{ color: "rgba(245,246,248,0.8)", marginBottom: 16 }}>通知先を削除しました。</p>
        ) : null}
        {errorCode && ERROR_MESSAGES[errorCode] ? (
          <p style={{ color: "rgba(255,120,120,0.95)", marginBottom: 16 }}>{ERROR_MESSAGES[errorCode]}</p>
        ) : null}

        <form
          action={addRecipientAction}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}
        >
          <input
            type="email"
            name="email"
            placeholder="メールアドレス"
            required
            autoComplete="off"
            style={{ ...inputStyle, flex: "2 1 220px" }}
          />
          <input
            type="text"
            name="label"
            placeholder="名前・メモ（任意）"
            style={{ ...inputStyle, flex: "1 1 160px" }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: 0,
              background: "linear-gradient(90deg, var(--axis-accent), #f1d08a)",
              color: "#141414",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            追加
          </button>
        </form>

        <div style={{ display: "grid", gap: 8 }}>
          {recipients.length ? (
            recipients.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, wordBreak: "break-all" }}>{r.email}</div>
                  {r.label ? (
                    <div style={{ fontSize: 13, color: "rgba(245,246,248,0.6)" }}>{r.label}</div>
                  ) : null}
                </div>
                <form action={deleteRecipientAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,120,120,0.5)",
                      background: "transparent",
                      color: "rgba(255,140,140,0.95)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    削除
                  </button>
                </form>
              </div>
            ))
          ) : (
            <p style={{ color: "rgba(245,246,248,0.6)" }}>
              まだ通知先が登録されていません。上のフォームから追加してください。
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
