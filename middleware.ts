import { NextResponse, type NextRequest } from "next/server";

function unauthorized(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("admin", "unauthorized");
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("basic ")) return unauthorized(request);

  const b64 = authHeader.slice(6).trim();
  let decoded = "";
  try {
    decoded = Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return unauthorized(request);
  }

  const [user, pass] = decoded.split(":");
  const expectedUser = process.env.ADMIN_USER ?? "admin";
  const expectedPass = process.env.ADMIN_PASS ?? "admin";

  if (user !== expectedUser || pass !== expectedPass) return unauthorized(request);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

