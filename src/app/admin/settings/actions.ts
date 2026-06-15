"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { setPassword } from "@/lib/authDb";
import { requireAdmin } from "@/lib/session";
import type { Role } from "@/lib/authToken";

const passSchema = z.string().min(8).max(200);

export async function changePasswordAction(formData: FormData) {
  await requireAdmin();

  const role = (formData.get("role") ?? "").toString();
  const next = (formData.get("password") ?? "").toString();
  const confirm = (formData.get("confirm") ?? "").toString();

  if (role !== "admin" && role !== "member") redirect("/admin/settings?error=role");
  if (next !== confirm) redirect("/admin/settings?error=mismatch");
  if (!passSchema.safeParse(next).success) redirect("/admin/settings?error=weak");

  await setPassword(role as Role, next);

  // admin 自身のパスワードを変えると現在のログインも失効するのでログイン画面へ。
  // member を変えた場合は admin のログインは維持される。
  redirect(role === "admin" ? "/admin/login?changed=admin" : "/admin/settings?changed=member");
}
