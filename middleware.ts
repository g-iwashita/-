import { NextResponse, type NextRequest } from "next/server";
import { checkCredentials } from "@/lib/adminAuth";

const COOKIE_NAME = "admin_session";

function decodeCookie(cookieValue: string): { user: string; pass: string } | null {
  try {
    const decoded = atob(cookieValue);
    const i = decoded.indexOf(":");
    if (i < 0) return null;
    return { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie) {
    const cred = decodeCookie(cookie);
    if (cred && checkCredentials(cred.user, cred.pass)) return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("basic ")) {
    const b64 = authHeader.slice(6).trim();
    let decoded = "";
    try {
      decoded = atob(b64);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const i = decoded.indexOf(":");
    const user = i >= 0 ? decoded.slice(0, i) : "";
    const pass = i >= 0 ? decoded.slice(i + 1) : "";
    if (checkCredentials(user, pass)) return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

