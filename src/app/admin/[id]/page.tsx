import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmissionById } from "@/lib/db";
import type { DiagnosisAnswers } from "@/lib/scoring";
import styles from "./detail.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminDetailPage(props: Props) {
  const { id } = await props.params;
  const submission = await getSubmissionById(id);
  if (!submission) notFound();

  let parsed: { answers?: Partial<DiagnosisAnswers>; breakdown?: Record<string, number> } = {};
  try {
    parsed = JSON.parse(submission.answersJson) as typeof parsed;
  } catch {
    parsed = {};
  }

  const a = parsed.answers ?? {};

  const answerLabels: Record<keyof DiagnosisAnswers, Record<string, string>> = {
    postingFrequency: {
      daily: "ほぼ毎日",
      few_per_week: "週に数回",
      weekly: "週1回程度",
      rare: "ほとんど投稿していない",
    },
    hasContentPlan: { yes: "はい", no: "いいえ" },
    usesInsights: {
      often: "毎週/毎回見て改善している",
      sometimes: "たまに見る",
      rarely: "ほとんど見ない",
      never: "見たことがない",
    },
    hasKpi: { yes: "はい", no: "いいえ" },
  };

  const answerRowsBase = [
    { key: "postingFrequency", question: "投稿頻度", value: a.postingFrequency ?? "-" },
    {
      key: "hasContentPlan",
      question: "投稿のコンテンツ企画（ネタ出し/台本/撮影計画など）",
      value: a.hasContentPlan ?? "-",
    },
    { key: "usesInsights", question: "インサイト（分析）を見る頻度", value: a.usesInsights ?? "-" },
    { key: "hasKpi", question: "KPIを決めているか", value: a.hasKpi ?? "-" },
  ] satisfies { key: keyof DiagnosisAnswers; question: string; value: string }[];

  const answerRows = answerRowsBase.map((r) => ({
    ...r,
    value: r.value === "-" ? "-" : answerLabels[r.key][r.value] ?? r.value,
  }));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.back} href="/admin">
          ← 一覧に戻る
        </Link>
        <Link className={styles.exportOne} href="/admin/export" prefetch={false}>
          CSV
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>回答詳細</h1>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.kicker}>日時</div>
            <div className={styles.value}>{new Date(submission.createdAt).toLocaleString()}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.kicker}>アカウント名</div>
            <div className={styles.value}>{submission.instagramAccountName}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.kicker}>運用期間</div>
            <div className={styles.value}>{submission.operationMonths}ヶ月</div>
          </div>
          <div className={styles.card}>
            <div className={styles.kicker}>運用目的</div>
            <div className={styles.value}>{submission.purpose}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.kicker}>配布元URL</div>
            <div className={styles.value}>{submission.sourceUrl ?? "-"}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.kicker}>スコア / レベル</div>
            <div className={styles.value}>
              <span className={styles.score}>{submission.score}</span> / {submission.level}
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>質問別の回答</h2>
          <div className={styles.answers}>
            {answerRows.map((r) => (
              <div key={r.key} className={styles.answerRow}>
                <div className={styles.answerQ}>{r.question}</div>
                <div className={styles.answerA}>{r.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>回答JSON（生データ）</h2>
          <pre className={styles.pre}>{submission.answersJson}</pre>
        </section>

        <div className={styles.actions}>
          <Link className={styles.public} href={`/result/${submission.id}`}>
            公開結果ページを開く
          </Link>
        </div>
      </main>
    </div>
  );
}

