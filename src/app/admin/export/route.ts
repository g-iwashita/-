import { NextResponse } from "next/server";
import { listSubmissions } from "@/lib/db";
import type { DiagnosisAnswers } from "@/lib/scoring";

function csvEscape(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export async function GET() {
  const rows = await listSubmissions(5000);

  const answerKeys: (keyof DiagnosisAnswers)[] = [
    "businessAccount",
    "profileReview",
    "postConsistency",
    "targetClarity",
    "storiesDaily",
    "highlightsUpdated",
    "insightsCheck",
    "competitorCheck",
    "competitorAnalysis",
    "adUsage",
    "dailyTime",
  ];

  const header = [
    "id",
    "createdAt",
    "sourceUrl",
    "instagramAccountName",
    "purpose",
    "score",
    "level",
    ...answerKeys,
    "answersJson",
  ];

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      {
        let answers: Partial<DiagnosisAnswers> = {};
        try {
          const parsed = JSON.parse(r.answersJson) as { answers?: Partial<DiagnosisAnswers> };
          answers = parsed.answers ?? {};
        } catch {
          answers = {};
        }

        return [
          r.id,
          r.createdAt,
          r.sourceUrl ?? "",
          r.instagramAccountName,
          r.purpose,
          r.score,
          r.level,
          ...answerKeys.map((k) => answers[k] ?? ""),
          r.answersJson,
        ]
          .map(csvEscape)
          .join(",");
      }
    ),
  ].join("\n");

  return new NextResponse(lines, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="instagram-diagnosis-submissions.csv"`,
    },
  });
}

