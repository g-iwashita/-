export type DiagnosisAnswers = {
  postingFrequency: "daily" | "few_per_week" | "weekly" | "rare";
  hasContentPlan: "yes" | "no";
  usesInsights: "often" | "sometimes" | "rarely" | "never";
  hasKpi: "yes" | "no";
};

export type DiagnosisResult = {
  score: number; // 0-100
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  breakdown: Record<string, number>;
};

export function scoreDiagnosis(answers: DiagnosisAnswers): DiagnosisResult {
  const breakdown: Record<string, number> = {};

  breakdown.postingFrequency =
    answers.postingFrequency === "daily"
      ? 25
      : answers.postingFrequency === "few_per_week"
        ? 20
        : answers.postingFrequency === "weekly"
          ? 12
          : 5;

  breakdown.hasContentPlan = answers.hasContentPlan === "yes" ? 20 : 0;
  breakdown.usesInsights =
    answers.usesInsights === "often"
      ? 25
      : answers.usesInsights === "sometimes"
        ? 16
        : answers.usesInsights === "rarely"
          ? 8
          : 0;
  breakdown.hasKpi = answers.hasKpi === "yes" ? 30 : 0;

  const score = Math.max(
    0,
    Math.min(
      100,
      Object.values(breakdown).reduce((a, b) => a + b, 0)
    )
  );

  const level: DiagnosisResult["level"] =
    score >= 85 ? "Expert" : score >= 65 ? "Advanced" : score >= 40 ? "Intermediate" : "Beginner";

  return { score, level, breakdown };
}

