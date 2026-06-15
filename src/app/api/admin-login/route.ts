import { NextRequest, NextResponse } from "next/server";
import { verifyLogin } from "@/lib/authDb";
import { signToken, SESSION_MAX_AGE_SEC, type Role } from "@/lib/authToken";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const user = (form.get("user") ?? "").toString().trim().toLowerCase();
  const pass = (form.get("pass") ?? "").toString();

  const fail = () =>
    NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);

  const secret = process.env.AUTH_SECRET;
  if (!secret) return fail();
  if (user !== "admin" && user !== "member") return fail();

  const role = user as Role;
  let result: { sessionVersion: number } | null;
  try {
    result = await verifyLogin(role, pass);
  } catch {
    return fail();
  }
  if (!result) return fail();

  const token = await signToken(
    { role, ver: result.sessionVersion, iat: Math.floor(Date.now() / 1000) },
    secret
  );

  // POST からのリダイレクトは 303 で GET に変換する
  const res = NextResponse.redirect(new URL("/admin", request.url), 303);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
  return res;
}
