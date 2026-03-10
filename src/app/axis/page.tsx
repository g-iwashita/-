import Link from "next/link";
import styles from "./axis.module.css";

export default function AxisLandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>AxisOne</div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Instagram運用診断</h1>
        <p className={styles.lead}>
          いくつかの質問に答えるだけで、現在の運用レベルをスコアリングします。回答後すぐに結果が表示されます。
        </p>

        <form className={styles.form} action="/axis/diagnose" method="get">
          <label className={styles.field}>
            <span className={styles.label}>配布元URL（任意）</span>
            <input className={styles.input} name="url" placeholder="https://..." />
          </label>
          <button className={styles.primary} type="submit">
            診断を開始する
          </button>
          <Link className={styles.secondary} href="/">
            通常トップへ
          </Link>
        </form>
      </main>
    </div>
  );
}

