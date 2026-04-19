"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { insertSubmission } from "@/lib/db";
import { scoreDiagnosis, type DiagnosisAnswers } from "@/lib/scoring";

const yesNo = z.enum(["yes", "no"]);

const schema = z.object({
  sourceUrl: z.string().url().optional().or(z.literal("")),
  returnBase: z.enum(["default", "axis"]).optional(),
  instagramAccountName: z
    .string()
    .min(1, "Instagramのアカウント名を入力してください")
    .max(100),
  purpose: z.string().min(1, "運用目的を入力してください").max(2000),

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
  dailyTime: z.enum(["under_15", "between_15_30", "over_30"]),
});

export async function submitDiagnosis(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "入力内容を確認してください";
    const base = raw.returnBase === "axis" ? "/axis" : "";
    redirect(`${base}/diagnose?error=${encodeURIComponent(message)}`);
  }

  const { sourceUrl, returnBase, instagramAccountName, purpose, ...answers } =
    parsed.data;
  const result = scoreDiagnosis(answers as DiagnosisAnswers);

  const id = crypto.randomUUID();
  await insertSubmission({
    id,
    sourceUrl: sourceUrl ? sourceUrl : null,
    instagramAccountName,
    operationMonths: 0,
    purpose,
    answersJson: JSON.stringify({
      answers,
      breakdown: result.breakdown,
      bottleneck: result.bottleneck,
      currentState: result.currentState,
      bottleneckText: result.bottleneckText,
      nextActions: result.nextActions,
      timeAdvice: result.timeAdvice,
    }),
    score: result.score,
    level: result.level,
  });

  const base = returnBase === "axis" ? "/axis" : "";
  redirect(`${base}/result/${id}`);
}
