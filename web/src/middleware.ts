import { NextRequest, NextResponse } from 'next/server';

const PB_URL = process.env.POCKETBASE_URL ?? 'http://localhost:8090';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fetch setup status from PocketBase (migration 3 makes settings publicly listable)
  let setupCompleted = false;
  try {
    const res = await fetch(`${PB_URL}/api/collections/settings/records?limit=1`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      setupCompleted = (data.items?.[0]?.setup_completed as boolean) ?? false;
    }
  } catch {
    // PocketBase unreachable — allow the request through so the app can show an error
    return NextResponse.next();
  }

  // Redirect to /setup until setup is complete
  if (!setupCompleted && pathname !== '/setup') {
    return NextResponse.redirect(new URL('/setup', request.url));
  }

  // Once setup is done, /setup is no longer needed
  if (setupCompleted && pathname === '/setup') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // All routes except /login require a valid auth token cookie
  if (setupCompleted && pathname !== '/login') {
    const token = request.cookies.get('pb_auth')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except Next.js internals, static files and API routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
