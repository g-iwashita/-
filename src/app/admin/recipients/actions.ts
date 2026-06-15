"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addRecipient, deleteRecipient } from "@/lib/authDb";
import { requireAdmin } from "@/lib/session";

const emailSchema = z.string().email();

export async function addRecipientAction(formData: FormData) {
  await requireAdmin();

  const email = (formData.get("email") ?? "").toString().trim().toLowerCase();
  const label = (formData.get("label") ?? "").toString().trim();

  if (!emailSchema.safeParse(email).success) {
    redirect("/admin/recipients?error=invalid");
  }

  const ok = await addRecipient(email, label || null);
  revalidatePath("/admin/recipients");
  redirect(ok ? "/admin/recipients?added=1" : "/admin/recipients?error=dup");
}

export async function deleteRecipientAction(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("id") ?? "").toString();
  if (id) await deleteRecipient(id);

  revalidatePath("/admin/recipients");
  redirect("/admin/recipients?deleted=1");
}
