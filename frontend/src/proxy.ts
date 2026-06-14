import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const AUTH_PATHS = ["/login", "/setup"];

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

  let needsSetup = false;
  try {
    const statusResponse = await fetch(`${API_URL}/api/setup/status`, {
      cache: "no-store",
    });
    needsSetup = (await statusResponse.json()).needs_setup;
  } catch {
    // assume setup is complete if the backend is unreachable
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
