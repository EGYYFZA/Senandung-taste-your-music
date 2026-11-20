import { type NextRequest, NextResponse } from "next/server";
import {
  issueSession,
  ownerCredentials,
  sameSecret,
  sessionCookie,
  sessionSeconds,
  validSession,
} from "@/features/access/session";
import { loginScreen } from "./screen";

const headers = { "Cache-Control": "private, no-store" };
function destination(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/";
  const allowed = /^\/(?:library|search|credits|design)?(?:\?[^#\\\s]*)?$/;
  return next.length <= 2048 && allowed.test(next) ? next : "/";
}
function screen(invalid = false) {
  return new Response(loginScreen(invalid), {
    status: invalid ? 401 : 200,
    headers: {
      ...headers,
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    },
  });
}
export function GET(request: NextRequest) {
  const owner = ownerCredentials();
  if (!owner) return new Response(null, { status: 503, headers });
  if (validSession(request.cookies.get(sessionCookie)?.value, owner))
    return new NextResponse(null, {
      status: 303,
      headers: { ...headers, Location: destination(request) },
    });
  return screen();
}
export async function POST(request: NextRequest) {
  const owner = ownerCredentials();
  if (!owner) return new Response(null, { status: 503, headers });
  const origin = URL.parse(request.headers.get("origin") ?? "");
  const local = origin && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if (
    !origin ||
    origin.origin !== request.headers.get("origin") ||
    origin.host !== request.headers.get("host") ||
    !(origin.protocol === "https:" || (local && origin.protocol === "http:"))
  )
    return new Response(null, { status: 403, headers });
  if (request.headers.get("content-type")?.split(";")[0] !== "application/x-www-form-urlencoded")
    return new Response(null, { status: 415, headers });
  const length = request.headers.get("content-length");
  if (!length || !/^\d{1,4}$/.test(length) || Number(length) > 8192)
    return new Response(null, { status: 413, headers });
  const form = new URLSearchParams(await request.text());
  const logout = form.get("intent") === "logout";
  if (
    !logout &&
    !(
      sameSecret(form.get("username") ?? "", owner.user) &&
      sameSecret(form.get("password") ?? "", owner.password)
    )
  )
    return screen(true);
  const response = new NextResponse(null, {
    status: 303,
    headers: { ...headers, Location: logout ? "/login" : destination(request) },
  });
  response.cookies.set(sessionCookie, logout ? "" : issueSession(owner), {
    httpOnly: true,
    secure: origin.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: logout ? 0 : sessionSeconds,
  });
  return response;
}
