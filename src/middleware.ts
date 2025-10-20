import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Protect app pages under these prefixes
const PROTECTED_PREFIXES = [
  "/home",
  "/library",
  "/notifications",
  "/search",
  "/user",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isProtected) return NextResponse.next();

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/home/:path*",
    "/library/:path*",
    "/notifications/:path*",
    "/search/:path*",
    "/user/:path*",
  ],
};
