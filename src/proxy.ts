import { NextRequest, NextResponse } from "next/server";
import { ANGER_ACCESS_COOKIE, getAngerAccessToken } from "@/lib/anger-access";

export async function proxy(request: NextRequest) {
  const password = process.env.ANGER_ACCESS_PASSWORD;
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const isPathwayDebugMode = request.nextUrl.searchParams.get("debug") === "pathways";

  if (isPathwayDebugMode) {
    return NextResponse.next();
  }

  const passwordUrl = new URL("/anger-password", request.url);
  passwordUrl.searchParams.set("next", nextPath);

  if (!password) {
    passwordUrl.searchParams.set("error", "missing-config");
    return NextResponse.redirect(passwordUrl);
  }

  const accessCookie = request.cookies.get(ANGER_ACCESS_COOKIE)?.value;
  const accessToken = await getAngerAccessToken(password);

  if (accessCookie !== accessToken) {
    return NextResponse.redirect(passwordUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/anger/:path*"],
};
