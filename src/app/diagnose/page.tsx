import Link from "next/link";
import { submitDiagnosis } from "./actions";
import styles from "./diagnose.module.css";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DiagnosePage(props: Props) {
  const sp = (await props.searchParams) ?? {};
  const url = typeof sp.url === "string" ? sp.url : "";
  const error = typeof sp.error === "string" ? sp.error : "";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          Instagram運用診断
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Instagram運用診断フォーム</h1>
        <p className={styles.lead}>質問に回答すると、最後にスコアと運用レベルが表示されます。</p>

        {error ? <div className={styles.error}>入力エラー: {error}</div> : null}

        <form className={styles.form} action={submitDiagnosis}>
          <input type="hidden" name="sourceUrl" value={url} />
          <input type="hidden" name="returnBase" value="default" />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>基本情報（必須）</h2>
            <label className={styles.field}>
              <span className={styles.label}>Instagramのアカウント名</span>
              <input
                className={styles.input}
                name="instagramAccountName"
                placeholder="@example または example"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>運用期間（月）</span>
              <input className={styles.input} name="operationMonths" type="number" min={0} required />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>運用目的</span>
              <textarea
                className={styles.textarea}
                name="purpose"
                placeholder="例: 集客 / 採用 / 認知拡大 / 来店促進 / EC売上 など"
                required
                rows={4}
              />
            </label>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>診断質問（仮）</h2>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>投稿頻度</legend>
              <label className={styles.radio}>
                <input type="radio" name="postingFrequency" value="daily" required /> ほぼ毎日
              </label>
              <label className={styles.radio}>
                <input type="radio" name="postingFrequency" value="few_per_week" required /> 週に数回
              </label>
              <label className={styles.radio}>
                <input type="radio" name="postingFrequency" value="weekly" required /> 週1回程度
              </label>
              <label className={styles.radio}>
                <input type="radio" name="postingFrequency" value="rare" required /> ほとんど投稿していない
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>投稿のコンテンツ企画（ネタ出し/台本/撮影計画など）がありますか？</legend>
              <label className={styles.radio}>
                <input type="radio" name="hasContentPlan" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="hasContentPlan" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>インサイト（分析）をどれくらい見ていますか？</legend>
              <label className={styles.radio}>
                <input type="radio" name="usesInsights" value="often" required /> 毎週/毎回見て改善している
              </label>
              <label className={styles.radio}>
                <input type="radio" name="usesInsights" value="sometimes" required /> たまに見る
              </label>
              <label className={styles.radio}>
                <input type="radio" name="usesInsights" value="rarely" required /> ほとんど見ない
              </label>
              <label className={styles.radio}>
                <input type="radio" name="usesInsights" value="never" required /> 見たことがない
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>KPI（例: リーチ、保存数、プロフィールアクセス、CVなど）を決めていますか？</legend>
              <label className={styles.radio}>
                <input type="radio" name="hasKpi" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="hasKpi" value="no" required /> いいえ
              </label>
            </fieldset>
          </section>

          <div className={styles.actions}>
            <button className={styles.submit} type="submit">
              診断する（スコア表示）
            </button>
            <Link className={styles.back} href="/">
              戻る
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

