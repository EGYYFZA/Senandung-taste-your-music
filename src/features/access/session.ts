import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const sessionCookie = "senandung_session";
export const sessionSeconds = 8 * 3600;

export function ownerCredentials() {
  const user = process.env.SENANDUNG_ACCESS_USER ?? "";
  const password = process.env.SENANDUNG_ACCESS_PASSWORD ?? "";
  if (
    !user ||
    user.includes(":") ||
    user.length > 100 ||
    password.length < 24 ||
    password.length > 256
  )
    return null;
  return { user, password };
}

export function sameSecret(left: string, right: string) {
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(left), hash(right));
}

type Owner = NonNullable<ReturnType<typeof ownerCredentials>>;
function signature(owner: Owner, expires: number) {
  return createHmac("sha256", owner.password)
    .update(JSON.stringify(["senandung-session-v1", owner.user, expires]))
    .digest("base64url");
}
export function issueSession(owner: Owner, now = Date.now()) {
  const expires = Math.floor(now / 1000) + sessionSeconds;
  return `${expires}.${signature(owner, expires)}`;
}
export function validSession(token: string | undefined, owner: Owner, now = Date.now()) {
  if (!token || !/^\d{10}\.[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const [expiration, mac] = token.split(".");
  const expires = Number(expiration);
  return expires > Math.floor(now / 1000) && sameSecret(mac, signature(owner, expires));
}
