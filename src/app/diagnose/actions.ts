"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { insertSubmission } from "@/lib/db";
import { scoreDiagnosis, type DiagnosisAnswers } from "@/lib/scoring";

const schema = z.object({
  sourceUrl: z.string().url().optional().or(z.literal("")),
  returnBase: z.enum(["default", "axis"]).optional(),
  instagramAccountName: z
    .string()
    .min(1, "Instagramのアカウント名を入力してください")
    .max(100),
  operationMonths: z.coerce
    .number()
    .int()
    .min(0, "運用期間（月）を0以上で入力してください")
    .max(600),
  purpose: z.string().min(1, "運用目的を入力してください").max(2000),

  postingFrequency: z.enum(["daily", "few_per_week", "weekly", "rare"]),
  hasContentPlan: z.enum(["yes", "no"]),
  usesInsights: z.enum(["often", "sometimes", "rarely", "never"]),
  hasKpi: z.enum(["yes", "no"]),
});

export async function submitDiagnosis(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "入力内容を確認してください";
    redirect(`/diagnose?error=${encodeURIComponent(message)}`);
  }

  const { sourceUrl, returnBase, instagramAccountName, operationMonths, purpose, ...answers } =
    parsed.data;
  const result = scoreDiagnosis(answers as DiagnosisAnswers);

  const id = crypto.randomUUID();
  await insertSubmission({
    id,
    sourceUrl: sourceUrl ? sourceUrl : null,
    instagramAccountName,
    operationMonths,
    purpose,
    answersJson: JSON.stringify({ answers, breakdown: result.breakdown }),
    score: result.score,
    level: result.level,
  });

  const base = returnBase === "axis" ? "/axis" : "";
  redirect(`${base}/result/${id}`);
}

