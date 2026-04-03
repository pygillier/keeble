import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PB_URL = process.env.POCKETBASE_URL ?? 'http://localhost:8090';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const token = (await cookies()).get('pb_auth')?.value;
  if (!token) {
    return new NextResponse(null, { status: 401 });
  }

  const { path } = await params;
  const pbUrl = `${PB_URL}/api/files/${path.join('/')}`;

  const upstream = await fetch(pbUrl, {
    headers: { Authorization: token },
  });

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status });
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
