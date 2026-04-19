import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmissionById } from "@/lib/db";
import styles from "./result.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

type ParsedAnswers = {
  currentState?: string;
  bottleneckText?: string;
  nextActions?: string[];
  timeAdvice?: string | null;
};

export default async function ResultPage(props: Props) {
  const { id } = await props.params;
  const submission = await getSubmissionById(id);
  if (!submission) notFound();

  let parsed: ParsedAnswers = {};
  try {
    parsed = JSON.parse(submission.answersJson) as ParsedAnswers;
  } catch {
    parsed = {};
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          Instagram運用診断
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>診断結果</h1>
        <div className={styles.card}>
          <div className={styles.scoreRow}>
            <div>
              <div className={styles.kicker}>スコア</div>
              <div className={styles.score}>
                {submission.score}
                <span className={styles.scoreUnit}>/ 10点</span>
              </div>
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
            <div className={styles.metaWide}>
              <span className={styles.metaLabel}>運用目的</span>
              <span className={styles.metaValue}>{submission.purpose}</span>
            </div>
          </div>
        </div>

        {parsed.currentState ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>現在地</h2>
            <p className={styles.sectionText}>{parsed.currentState}</p>
          </section>
        ) : null}

        {parsed.bottleneckText ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>一番のボトルネック</h2>
            <p className={styles.sectionText}>{parsed.bottleneckText}</p>
          </section>
        ) : null}

        {parsed.nextActions && parsed.nextActions.length ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>次の一手</h2>
            <ol className={styles.nextActionList}>
              {parsed.nextActions.map((a, i) => (
                <li key={i} className={styles.nextActionItem}>
                  {a}
                </li>
              ))}
            </ol>
            {parsed.timeAdvice ? (
              <div className={styles.timeAdvice}>※ {parsed.timeAdvice}</div>
            ) : null}
          </section>
        ) : null}

        <div className={styles.actions}>
          <Link className={styles.primary} href="/diagnose">
            もう一度診断する
          </Link>
          <Link className={styles.secondary} href="/">
            トップへ
          </Link>
        </div>
      </main>
    </div>
  );
}
