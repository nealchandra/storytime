import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  // Store current request origin/pathname in a custom header, there is otherwise no
  // way to access this in a server component/action
  requestHeaders.set('x-origin', request.nextUrl.origin);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
