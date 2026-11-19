import { createHash, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const username = process.env.SENANDUNG_ACCESS_USER ?? "";
  const password = process.env.SENANDUNG_ACCESS_PASSWORD ?? "";
  const headers = { "Cache-Control": "private, no-store" };
  if (
    !username ||
    username.includes(":") ||
    username.length > 100 ||
    password.length < 24 ||
    password.length > 256
  )
    return new NextResponse("Akses pribadi belum dikonfigurasi oleh pemilik.", {
      status: 503,
      headers,
    });
  const authorization = request.headers.get("authorization") ?? "";
  const expected = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (authorization.length > 1024 || !timingSafeEqual(digest(authorization), digest(expected)))
    return new NextResponse("Masuk untuk membuka Senandung.", {
      status: 401,
      headers: { ...headers, "WWW-Authenticate": 'Basic realm="Senandung", charset="UTF-8"' },
    });
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
