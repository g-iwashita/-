import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/login", request.url));
  res.cookies.set("admin_session", "", { path: "/", maxAge: 0 });
  return res;
}
