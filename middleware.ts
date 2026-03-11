import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const expectedPass = process.env.ADMIN_PASS ?? "admin";
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie === expectedPass) return NextResponse.next();

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("basic ")) {
    const b64 = authHeader.slice(6).trim();
    let decoded = "";
    try {
      decoded = Buffer.from(b64, "base64").toString("utf8");
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const [user, pass] = decoded.split(":");
    const expectedUser = process.env.ADMIN_USER ?? "admin";
    if (user === expectedUser && pass === expectedPass) return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

