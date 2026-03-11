import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const user = (form.get("user") ?? "").toString();
  const pass = (form.get("pass") ?? "").toString();

  const expectedUser = process.env.ADMIN_USER ?? "admin";
  const expectedPass = process.env.ADMIN_PASS ?? "admin";

  if (user !== expectedUser || pass !== expectedPass) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const res = NextResponse.redirect(new URL("/admin", request.url));
  res.cookies.set(COOKIE_NAME, expectedPass, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日
  });
  return res;
}
