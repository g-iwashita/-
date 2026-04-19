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

  const yesNo = { yes: "はい", no: "いいえ" };
  const answerLabels: Record<keyof DiagnosisAnswers, Record<string, string>> = {
    businessAccount: yesNo,
    profileReview: yesNo,
    postConsistency: yesNo,
    targetClarity: yesNo,
    storiesDaily: yesNo,
    highlightsUpdated: yesNo,
    insightsCheck: yesNo,
    competitorCheck: yesNo,
    competitorAnalysis: yesNo,
    adUsage: yesNo,
    dailyTime: {
      under_15: "15分未満",
      between_15_30: "15〜30分",
      over_30: "30分以上",
    },
  };

  const answerRowsBase = [
    { key: "businessAccount", question: "Q1. ビジネス/クリエイターアカウント切替", value: a.businessAccount ?? "-" },
    { key: "profileReview", question: "Q2. プロフィール定期見直し", value: a.profileReview ?? "-" },
    { key: "postConsistency", question: "Q3. 投稿の統一感", value: a.postConsistency ?? "-" },
    { key: "targetClarity", question: "Q4. 誰に・何を発信するかの明確化", value: a.targetClarity ?? "-" },
    { key: "storiesDaily", question: "Q5. ストーリーズ毎日更新", value: a.storiesDaily ?? "-" },
    { key: "highlightsUpdated", question: "Q6. ハイライト定期更新", value: a.highlightsUpdated ?? "-" },
    { key: "insightsCheck", question: "Q7. インサイト定期確認", value: a.insightsCheck ?? "-" },
    { key: "competitorCheck", question: "Q8-A. 競合・同ジャンル定期チェック", value: a.competitorCheck ?? "-" },
    { key: "competitorAnalysis", question: "Q8-B. 伸びている投稿の分析", value: a.competitorAnalysis ?? "-" },
    { key: "adUsage", question: "Q9. 集客目的のInstagram広告運用", value: a.adUsage ?? "-" },
    { key: "dailyTime", question: "Q10. 1日の運用時間", value: a.dailyTime ?? "-" },
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

