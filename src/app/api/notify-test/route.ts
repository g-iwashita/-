import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { listSubmissions } from "@/lib/db";
import { sendDiagnosisNotification } from "@/lib/email";

// 一時的な診断用エンドポイント（admin限定）。
// 直近の診断データで通知メールを再送し、成否とエラー全文を返す。
// メール疎通の確認が済んだら削除すること。
export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  const subs = await listSubmissions(1);
  if (subs.length === 0) {
    return NextResponse.json({ ok: false, error: "診断データがありません" });
  }

  try {
    await sendDiagnosisNotification(subs[0]);
    return NextResponse.json({ ok: true, sentFor: subs[0].id });
  } catch (e) {
    const detail = e instanceof Error ? e.stack ?? e.message : String(e);
    return NextResponse.json({ ok: false, error: detail });
  }
}
