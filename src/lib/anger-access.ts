export const ANGER_ACCESS_COOKIE = "anger_access";

export async function getAngerAccessToken(password: string) {
  const data = new TextEncoder().encode(`anger:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function getSafeAngerNextPath(value: unknown) {
  if (typeof value !== "string") return "/anger";
  if (!value.startsWith("/anger")) return "/anger";
  return value;
}
