import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { listRecipients } from "@/lib/authDb";
import { AddRecipientForm } from "./AddRecipientForm";
import { DeleteRecipientButton } from "./DeleteRecipientButton";
import styles from "../admin.module.css";
import local from "./recipients.module.css";

// 認証必須ページ。常にリクエスト時にレンダリングする（静的化させない）。
export const dynamic = "force-dynamic";

export default async function RecipientsPage() {
  await requireAdmin();

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
        <p className={local.lead}>
          ここに登録したメールアドレス宛に、新しい診断回答が届くたびに通知メールが送られます。
        </p>

        <AddRecipientForm />

        <div className={local.list}>
          {recipients.length ? (
            recipients.map((r) => (
              <div key={r.id} className={local.item}>
                <div className={local.itemInfo}>
                  <div className={local.email}>{r.email}</div>
                  {r.label ? <div className={local.label}>{r.label}</div> : null}
                </div>
                <DeleteRecipientButton id={r.id} />
              </div>
            ))
          ) : (
            <p className={local.empty}>
              まだ通知先が登録されていません。上のフォームから追加してください。
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
