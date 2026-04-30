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

function redirectTo(pathname: string, request: NextRequest, preserveQuery = false): NextResponse {
  const target = new URL(pathname, request.url);
  if (preserveQuery) target.search = request.nextUrl.search;
  return NextResponse.redirect(target);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 結果ページの旧パスは ID を保ったまま新パスへ
  if (pathname.startsWith("/axis/result/")) {
    const id = pathname.replace("/axis/result/", "");
    return redirectTo(`/accountdiagnosis/result/${id}`, request);
  }
  if (pathname.startsWith("/result/")) {
    const id = pathname.replace("/result/", "");
    return redirectTo(`/accountdiagnosis/result/${id}`, request);
  }

  // 顧客向けに見せたくない旧パスは診断フォームへ集約
  if (
    pathname === "/" ||
    pathname === "/diagnose" ||
    pathname.startsWith("/diagnose/") ||
    pathname === "/result" ||
    pathname === "/axis" ||
    pathname === "/axis/diagnose"
  ) {
    return redirectTo("/accountdiagnosis/diagnose", request, true);
  }

  // 管理画面は Basic 認証
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
  matcher: [
    "/",
    "/diagnose",
    "/diagnose/:path*",
    "/result",
    "/result/:path*",
    "/axis",
    "/axis/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
