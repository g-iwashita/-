import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmissionById } from "@/lib/db";
import styles from "@/app/result/[id]/result.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AxisResultPage(props: Props) {
  const { id } = await props.params;
  const submission = await getSubmissionById(id);
  if (!submission) notFound();

  let parsed: { answers?: unknown; breakdown?: Record<string, number> } = {};
  try {
    parsed = JSON.parse(submission.answersJson) as typeof parsed;
  } catch {
    parsed = {};
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/axis">
          AxisOne / Instagram運用診断
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>診断結果</h1>
        <div className={styles.card}>
          <div className={styles.scoreRow}>
            <div>
              <div className={styles.kicker}>スコア</div>
              <div className={styles.score}>{submission.score}</div>
            </div>
            <div>
              <div className={styles.kicker}>運用レベル</div>
              <div className={styles.level}>{submission.level}</div>
            </div>
          </div>

          <div className={styles.meta}>
            <div>
              <span className={styles.metaLabel}>アカウント名</span>
              <span className={styles.metaValue}>{submission.instagramAccountName}</span>
            </div>
            <div>
              <span className={styles.metaLabel}>運用期間</span>
              <span className={styles.metaValue}>{submission.operationMonths}ヶ月</span>
            </div>
            <div className={styles.metaWide}>
              <span className={styles.metaLabel}>運用目的</span>
              <span className={styles.metaValue}>{submission.purpose}</span>
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>内訳（仮）</h2>
          <div className={styles.breakdown}>
            {parsed.breakdown && Object.keys(parsed.breakdown).length ? (
              Object.entries(parsed.breakdown).map(([k, v]) => (
                <div key={k} className={styles.breakdownRow}>
                  <span className={styles.breakdownKey}>{k}</span>
                  <span className={styles.breakdownValue}>{v}</span>
                </div>
              ))
            ) : (
              <div className={styles.muted}>内訳データがありません。</div>
            )}
          </div>
        </section>

        <div className={styles.actions}>
          <Link className={styles.primary} href="/axis/diagnose">
            もう一度診断する
          </Link>
          <Link className={styles.secondary} href="/axis">
            トップへ
          </Link>
        </div>
      </main>
    </div>
  );
}

