import { listRecipients } from "@/lib/authDb";
import type { Submission } from "@/lib/db";
import type { DiagnosisAnswers } from "@/lib/scoring";

// 結果ページ等のリンクに使う公開URL。未設定なら本番URLにフォールバック。
const BASE_URL = process.env.APP_BASE_URL ?? "https://axis-instagram.vercel.app";

const YES_NO: Record<string, string> = { yes: "はい", no: "いいえ" };

const QUESTIONS: { key: keyof DiagnosisAnswers; label: string; map: Record<string, string> }[] = [
  { key: "businessAccount", label: "Q1. ビジネス/クリエイターアカウント切替", map: YES_NO },
  { key: "profileReview", label: "Q2. プロフィール定期見直し", map: YES_NO },
  { key: "postConsistency", label: "Q3. 投稿の統一感", map: YES_NO },
  { key: "targetClarity", label: "Q4. 誰に・何を発信するかの明確化", map: YES_NO },
  { key: "storiesDaily", label: "Q5. ストーリーズ毎日更新", map: YES_NO },
  { key: "highlightsUpdated", label: "Q6. ハイライト定期更新", map: YES_NO },
  { key: "insightsCheck", label: "Q7. インサイト定期確認", map: YES_NO },
  { key: "competitorCheck", label: "Q8-A. 競合・同ジャンル定期チェック", map: YES_NO },
  { key: "competitorAnalysis", label: "Q8-B. 伸びている投稿の分析", map: YES_NO },
  { key: "adUsage", label: "Q9. 集客目的のInstagram広告運用", map: YES_NO },
  {
    key: "dailyTime",
    label: "Q10. 1日の運用時間",
    map: { under_15: "15分未満", between_15_30: "15〜30分", over_30: "30分以上" },
  },
];

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type ParsedAnswers = {
  answers?: Partial<DiagnosisAnswers>;
  currentState?: string;
  growth?: string;
  improvements?: string[];
};

function parse(submission: Submission): ParsedAnswers {
  try {
    return JSON.parse(submission.answersJson) as ParsedAnswers;
  } catch {
    return {};
  }
}

function buildEmail(submission: Submission): { subject: string; text: string; html: string } {
  const parsed = parse(submission);
  const a = parsed.answers ?? {};
  const detailUrl = `${BASE_URL}/admin/${submission.id}`;

  const qaText = QUESTIONS.map((q) => {
    const raw = a[q.key];
    const value = raw ? q.map[raw] ?? raw : "-";
    return `${q.label}: ${value}`;
  }).join("\n");

  const text = [
    "Instagram運用診断に新しい回答が届きました。",
    "",
    `アカウント名: ${submission.instagramAccountName}`,
    `運用目的: ${submission.purpose}`,
    `スコア: ${submission.score} / 10`,
    `レベル: ${submission.level}`,
    submission.sourceUrl ? `配布元URL: ${submission.sourceUrl}` : "",
    `回答日時: ${new Date(submission.createdAt).toLocaleString("ja-JP")}`,
    "",
    "■ 質問別の回答",
    qaText,
    "",
    parsed.currentState ? `■ 現在地\n${parsed.currentState}` : "",
    parsed.growth ? `\n■ 伸びしろ\n${parsed.growth}` : "",
    parsed.improvements?.length ? `\n■ 改善案\n- ${parsed.improvements.join("\n- ")}` : "",
    "",
    `管理画面で詳細を見る: ${detailUrl}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const qaHtml = QUESTIONS.map((q) => {
    const raw = a[q.key];
    const value = raw ? q.map[raw] ?? raw : "-";
    return `<tr><td style="padding:4px 12px 4px 0;color:#555;">${escapeHtml(q.label)}</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`;
  }).join("");

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;max-width:640px;">
    <h2 style="margin:0 0 8px;">Instagram運用診断に新しい回答が届きました</h2>
    <table style="border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:4px 12px 4px 0;color:#555;">アカウント名</td><td style="padding:4px 0;font-weight:600;">${escapeHtml(submission.instagramAccountName)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#555;">運用目的</td><td style="padding:4px 0;">${escapeHtml(submission.purpose)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#555;">スコア / レベル</td><td style="padding:4px 0;font-weight:600;">${submission.score} / 10　（${escapeHtml(submission.level)}）</td></tr>
      ${submission.sourceUrl ? `<tr><td style="padding:4px 12px 4px 0;color:#555;">配布元URL</td><td style="padding:4px 0;">${escapeHtml(submission.sourceUrl)}</td></tr>` : ""}
      <tr><td style="padding:4px 12px 4px 0;color:#555;">回答日時</td><td style="padding:4px 0;">${escapeHtml(new Date(submission.createdAt).toLocaleString("ja-JP"))}</td></tr>
    </table>

    <h3 style="margin:20px 0 4px;">質問別の回答</h3>
    <table style="border-collapse:collapse;">${qaHtml}</table>

    ${parsed.currentState ? `<h3 style="margin:20px 0 4px;">現在地</h3><p style="margin:0;line-height:1.7;">${escapeHtml(parsed.currentState)}</p>` : ""}
    ${parsed.growth ? `<h3 style="margin:20px 0 4px;">伸びしろ</h3><p style="margin:0;line-height:1.7;">${escapeHtml(parsed.growth)}</p>` : ""}
    ${parsed.improvements?.length ? `<h3 style="margin:20px 0 4px;">改善案</h3><ul style="margin:0;padding-left:20px;line-height:1.7;">${parsed.improvements.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : ""}

    <p style="margin:24px 0 0;">
      <a href="${detailUrl}" style="display:inline-block;background:#141414;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;">管理画面で詳細を見る</a>
    </p>
  </div>`;

  return {
    subject: `【Instagram診断】新しい回答が届きました（${submission.instagramAccountName}）`,
    text,
    html,
  };
}

// 診断回答の通知メールを送信する。
// 設定不足・宛先ゼロ・送信失敗のいずれでも例外を投げず、呼び出し側の処理を止めない設計。
// （診断の保存と結果表示はメール通知より優先される）
export async function sendDiagnosisNotification(submission: Submission): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from) {
    console.warn("[notify] RESEND_API_KEY または MAIL_FROM が未設定のため通知をスキップしました");
    return;
  }

  const recipients = await listRecipients();
  if (recipients.length === 0) {
    console.warn("[notify] 通知先が登録されていないため通知をスキップしました");
    return;
  }

  const { subject, text, html } = buildEmail(submission);

  // 受信者同士でメアドが見えないよう BCC で送る（to は送信元自身）。
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [from],
      bcc: recipients.map((r) => r.email),
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}
