import { getSupabaseServerClient } from "@/lib/supabaseServer";

export type Submission = {
  id: string;
  createdAt: string;
  sourceUrl: string | null;
  instagramAccountName: string;
  operationMonths: number;
  purpose: string;
  answersJson: string;
  score: number;
  level: string;
};

type DbRow = {
  id: string;
  created_at: string;
  source_url: string | null;
  instagram_account_name: string;
  operation_months: number;
  purpose: string;
  answers_json: unknown;
  score: number;
  level: string;
};

function mapRow(row: DbRow): Submission {
  return {
    id: row.id,
    createdAt: row.created_at,
    sourceUrl: row.source_url,
    instagramAccountName: row.instagram_account_name,
    operationMonths: row.operation_months,
    purpose: row.purpose,
    answersJson: typeof row.answers_json === "string" ? row.answers_json : JSON.stringify(row.answers_json),
    score: row.score,
    level: row.level,
  };
}

export async function insertSubmission(input: Omit<Submission, "createdAt">): Promise<Submission> {
  const createdAt = new Date().toISOString();
  const sb = getSupabaseServerClient();

  const payload = {
    id: input.id,
    created_at: createdAt,
    source_url: input.sourceUrl,
    instagram_account_name: input.instagramAccountName,
    operation_months: input.operationMonths,
    purpose: input.purpose,
    answers_json: safeJsonParse(input.answersJson),
    score: input.score,
    level: input.level,
  };

  const { error } = await sb.from("submissions").insert(payload);
  if (error) throw new Error(`DB insert failed: ${error.message}`);

  return { ...input, createdAt };
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("submissions")
    .select("*")
    .eq("id", id)
    .limit(1)
    .maybeSingle<DbRow>();

  if (error) throw new Error(`DB select failed: ${error.message}`);
  return data ? mapRow(data) : null;
}

export async function listSubmissions(limit = 200): Promise<Submission[]> {
  const sb = getSupabaseServerClient();
  const { data, error } = await sb
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<DbRow[]>();

  if (error) throw new Error(`DB select failed: ${error.message}`);
  return (data ?? []).map(mapRow);
}

export async function searchSubmissionsByAccountName(params: {
  query: string;
  match?: "partial" | "exact";
  limit?: number;
}): Promise<Submission[]> {
  const sb = getSupabaseServerClient();
  const limit = params.limit ?? 300;
  const q = params.query.trim();
  if (!q) return await listSubmissions(limit);

  const match = params.match ?? "partial";
  const query = sb.from("submissions").select("*").order("created_at", { ascending: false }).limit(limit);

  const { data, error } =
    match === "exact"
      ? await query.eq("instagram_account_name", q).returns<DbRow[]>()
      : await query.ilike("instagram_account_name", `%${q}%`).returns<DbRow[]>();

  if (error) throw new Error(`DB select failed: ${error.message}`);
  return (data ?? []).map(mapRow);
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return s;
  }
}

