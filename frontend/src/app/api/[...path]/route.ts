/**
 * Catch-all proxy route — forwards /api/* requests from the browser to the
 * backend server. BACKEND_URL is a plain server-side env var (not NEXT_PUBLIC_),
 * so it is read at request time from the runtime environment, never baked into
 * the client bundle or the build manifest.
 *
 * Set BACKEND_URL in docker-compose `environment:` (e.g. http://backend:8000)
 * to use Docker internal networking. Defaults to http://localhost:8000 for
 * local development where both services run on the same host.
 */

import { NextRequest, NextResponse } from "next/server";

// Headers that must not be forwarded to the backend.
const STRIP_REQUEST = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailers", "transfer-encoding", "upgrade", "host",
]);

// Headers that must not be forwarded back to the browser.
// content-encoding and content-length are stripped because Node.js fetch()
// automatically decompresses gzip/br responses — forwarding these headers
// would cause ERR_CONTENT_DECODING_FAILED in the browser.
const STRIP_RESPONSE = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailers", "transfer-encoding", "upgrade",
  "content-encoding", "content-length",
]);

async function proxy(req: NextRequest, path: string[]): Promise<NextResponse> {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
  const targetUrl = new URL(`/api/${path.join("/")}`, backendUrl);
  targetUrl.search = req.nextUrl.search;

  // Forward relevant request headers
  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  const isBodyless = req.method === "GET" || req.method === "HEAD";
  let upstream: Response;
  try {
    upstream = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body: isBodyless ? undefined : req.body,
      // Required for streaming request bodies in Node.js fetch
      // @ts-ignore
      duplex: "half",
    });
  } catch (err) {
    // Backend unreachable — return a clean 502 so the UI can handle it gracefully
    return new NextResponse(JSON.stringify({ error: "Backend unavailable" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Forward response headers
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  // 304 responses must have no body
  if (upstream.status === 304) {
    return new NextResponse(null, { status: 304, headers: responseHeaders });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path);
}
