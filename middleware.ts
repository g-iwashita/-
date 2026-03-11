import { NextResponse, type NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("管理者認証が必要です", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="管理画面", charset="UTF-8"',
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("basic ")) return unauthorized();

  const b64 = authHeader.slice(6).trim();
  let decoded = "";
  try {
    decoded = Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return unauthorized();
  }

  const [user, pass] = decoded.split(":");
  const expectedUser = process.env.ADMIN_USER ?? "admin";
  const expectedPass = process.env.ADMIN_PASS ?? "admin";

  if (user !== expectedUser || pass !== expectedPass) return unauthorized();
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

