export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
  });
  const url = new URL(request.nextUrl);

  if (!token && url.pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (!token && url.pathname.startsWith("/tasks")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (token && url.pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  if (token && url.pathname.startsWith("/auth/register")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/home/:path*", "/auth/:path*", "/:path*"],
};
