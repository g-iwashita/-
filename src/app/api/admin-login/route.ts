import { NextRequest, NextResponse } from "next/server";
import { checkCredentials } from "@/lib/adminAuth";

const COOKIE_NAME = "admin_session";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const user = (form.get("user") ?? "").toString();
  const pass = (form.get("pass") ?? "").toString();

  if (!checkCredentials(user, pass)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const value = Buffer.from(`${user}:${pass}`, "utf8").toString("base64");
  const res = NextResponse.redirect(new URL("/admin", request.url));
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7日
  });
  return res;
}
