import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/authToken";

const COOKIE_NAME = "admin_session";

function redirectTo(pathname: string, request: NextRequest, preserveQuery = false): NextResponse {
  const target = new URL(pathname, request.url);
  if (preserveQuery) target.search = request.nextUrl.search;
  return NextResponse.redirect(target);
}

export async function middleware(request: NextRequest) {
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

  // 管理画面はセッショントークンで保護する。
  // ここでは署名・有効期限のみ検証（軽量）。役割(admin/member)や
  // パスワード変更による失効は各ページのサーバー側で最終チェックする。
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const secret = process.env.AUTH_SECRET;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = secret ? await verifyToken(token, secret) : null;
  if (payload) return NextResponse.next();

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
