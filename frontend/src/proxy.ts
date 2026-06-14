import { NextRequest, NextResponse } from "next/server";

import { API_URL } from "@/lib/config";

const AUTH_PATHS = ["/login", "/setup"];

// Once setup has been completed, it can never be undone, so we can stop
// asking the backend on every unauthenticated request.
let setupComplete = false;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("access_token");
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (isAuthenticated) {
    if (isAuthPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  let needsSetup = !setupComplete;
  if (needsSetup) {
    try {
      const statusResponse = await fetch(`${API_URL}/api/setup/status`, {
        cache: "no-store",
      });
      needsSetup = (await statusResponse.json()).needs_setup;
      setupComplete = !needsSetup;
    } catch {
      // assume setup is complete if the backend is unreachable
      needsSetup = false;
    }
  }

  if (pathname.startsWith("/setup")) {
    return needsSetup
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/login")) {
    return needsSetup
      ? NextResponse.redirect(new URL("/setup", request.url))
      : NextResponse.next();
  }

  return NextResponse.redirect(
    new URL(needsSetup ? "/setup" : "/login", request.url)
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
