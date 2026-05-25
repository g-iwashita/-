import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// 毎回必ず実行させる（キャッシュで素通りさせない）
export const dynamic = "force-dynamic";

// Supabase 無料プランの自動一時停止（約7日間アクセスがないと停止）を防ぐための
// keep-alive エンドポイント。Vercel Cron から定期的に呼び出される。
export async function GET(request: Request) {
  // CRON_SECRET を設定している場合は、Vercel Cron 以外からのアクセスを拒否する
  // （Vercel Cron は Authorization: Bearer <CRON_SECRET> を自動付与する）
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const sb = getSupabaseServerClient();
    // 軽量クエリで DB に触れ、アクティブ状態を維持する
    const { error } = await sb.from("submissions").select("id").limit(1);
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
