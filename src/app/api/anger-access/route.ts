import { NextResponse } from "next/server";
import {
  ANGER_ACCESS_COOKIE,
  getAngerAccessToken,
  getSafeAngerNextPath,
} from "@/lib/anger-access";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");
  const next = getSafeAngerNextPath(formData.get("next"));
  const configuredPassword = process.env.ANGER_ACCESS_PASSWORD;

  if (!configuredPassword) {
    const url = new URL("/anger-password", request.url);
    url.searchParams.set("next", next);
    url.searchParams.set("error", "missing-config");
    return NextResponse.redirect(url, 303);
  }

  if (password !== configuredPassword) {
    const url = new URL("/anger-password", request.url);
    url.searchParams.set("next", next);
    url.searchParams.set("error", "incorrect");
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set({
    name: ANGER_ACCESS_COOKIE,
    value: await getAngerAccessToken(configuredPassword),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
