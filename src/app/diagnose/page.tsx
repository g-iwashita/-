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
        <p className={styles.lead}>
          11問の質問に答えると、あなたのInstagram運用レベルと次の一手が分かります。
        </p>

        {error ? <div className={styles.error}>入力エラー: {error}</div> : null}

        <form className={styles.form} action={submitDiagnosis}>
          <input type="hidden" name="sourceUrl" value={url} />
          <input type="hidden" name="returnBase" value="default" />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>基本情報</h2>
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
              <span className={styles.label}>運用目的</span>
              <textarea
                className={styles.textarea}
                name="purpose"
                placeholder="例: 集客 / 採用 / 認知拡大 / 来店促進 / EC売上 など"
                required
                rows={3}
              />
            </label>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>診断質問</h2>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q1. ビジネスアカウントまたはクリエイターアカウントに切り替えていますか？
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="businessAccount" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="businessAccount" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q2. 定期的にプロフィールを見直していますか？
                <span className={styles.legendNote}>
                  （「誰のためのアカウントか」「フォローするメリット」が明確になっているか）
                </span>
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="profileReview" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="profileReview" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q3. 投稿の統一感を意識して作成していますか？
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="postConsistency" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="postConsistency" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q4. アカウントで「誰に・何を発信するか」が明確になっていますか？
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="targetClarity" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="targetClarity" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q5. ストーリーズを毎日更新できていますか？
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="storiesDaily" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="storiesDaily" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q6. ハイライトを作成し、定期的に更新していますか？
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="highlightsUpdated" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="highlightsUpdated" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q7. インサイトを定期的に確認していますか？
                <span className={styles.legendNote}>
                  （フォロワーが最もアクティブな時間帯の把握を含む）
                </span>
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="insightsCheck" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="insightsCheck" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q8-A. 同業他社・同ジャンルのアカウントを定期的にチェックしていますか？
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="competitorCheck" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="competitorCheck" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q8-B. チェックしているアカウントの「伸びている投稿」を分析していますか？
                <span className={styles.legendNote}>
                  （なぜ伸びたか・どんな構成か等）
                </span>
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="competitorAnalysis" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="competitorAnalysis" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q9. 現在、集客目的でInstagram広告を運用していますか？
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="adUsage" value="yes" required /> はい
              </label>
              <label className={styles.radio}>
                <input type="radio" name="adUsage" value="no" required /> いいえ
              </label>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                Q10. Instagramに使える時間は1日どのくらいですか？
              </legend>
              <label className={styles.radio}>
                <input type="radio" name="dailyTime" value="under_15" required /> 15分未満
              </label>
              <label className={styles.radio}>
                <input type="radio" name="dailyTime" value="between_15_30" required /> 15〜30分
              </label>
              <label className={styles.radio}>
                <input type="radio" name="dailyTime" value="over_30" required /> 30分以上
              </label>
            </fieldset>
          </section>

          <div className={styles.actions}>
            <button className={styles.submit} type="submit">
              診断する
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
