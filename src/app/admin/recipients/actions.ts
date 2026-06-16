"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { addRecipient, deleteRecipient } from "@/lib/authDb";
import { requireAdmin } from "@/lib/session";

const emailSchema = z.string().email();

export type AddResult = { ok: boolean; error?: "invalid" | "dup" };

// useActionState から呼ぶ：(前回state, formData) => 新state
export async function addRecipientAction(
  _prev: AddResult | null,
  formData: FormData
): Promise<AddResult> {
  await requireAdmin();

  const email = (formData.get("email") ?? "").toString().trim().toLowerCase();
  const label = (formData.get("label") ?? "").toString().trim();

  if (!emailSchema.safeParse(email).success) return { ok: false, error: "invalid" };

  const ok = await addRecipient(email, label || null);
  if (!ok) return { ok: false, error: "dup" };

  revalidatePath("/admin/recipients");
  return { ok: true };
}

export async function deleteRecipientAction(id: string): Promise<void> {
  await requireAdmin();
  if (id) await deleteRecipient(id);
  revalidatePath("/admin/recipients");
}
