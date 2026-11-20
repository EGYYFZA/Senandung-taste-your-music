import { type NextRequest, NextResponse } from "next/server";
import {
  ownerCredentials,
  sameSecret,
  sessionCookie,
  validSession,
} from "./features/access/session";

export function proxy(request: NextRequest) {
  const owner = ownerCredentials();
  const headers = { "Cache-Control": "private, no-store" };
  if (!owner)
    return new NextResponse("Akses pribadi belum dikonfigurasi oleh pemilik.", {
      status: 503,
      headers,
    });
  const authorization = request.headers.get("authorization") ?? "";
  const expected = `Basic ${Buffer.from(`${owner.user}:${owner.password}`).toString("base64")}`;
  if (
    request.nextUrl.pathname !== "/login" &&
    !validSession(request.cookies.get(sessionCookie)?.value, owner) &&
    !(authorization.length <= 1024 && sameSecret(authorization, expected))
  ) {
    if (
      request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html") &&
      ["/", "/library", "/search", "/credits", "/design"].includes(request.nextUrl.pathname)
    ) {
      const login = new URL("/login", request.url);
      if (request.nextUrl.pathname !== "/")
        login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(login, { status: 303, headers });
    }
    return new NextResponse("Masuk untuk membuka Senandung.", {
      status: 401,
      headers: { ...headers, "WWW-Authenticate": 'Basic realm="Senandung", charset="UTF-8"' },
    });
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
