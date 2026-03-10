import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Instagram運用診断ツール（叩き台）</h1>
          <p>
            URLを渡してフォーム回答すると、最後にスコアと運用レベルが表示されます。回答データは開発者用の管理画面に保存され、CSVで出力できます。
          </p>
        </div>

        <form className={styles.form} action="/axis/diagnose" method="get">
          <label className={styles.field}>
            <span className={styles.label}>配布元URL（任意）</span>
            <input className={styles.input} name="url" placeholder="https://..." />
          </label>
          <button className={styles.primary} type="submit">
            診断を開始する
          </button>
          <Link className={styles.secondary} href="/axis">
            Axis配布用トップ（/axis）
          </Link>
          <Link className={styles.secondary} href="/admin">
            管理画面（開発者用）
          </Link>
        </form>
      </main>
    </div>
  );
}
