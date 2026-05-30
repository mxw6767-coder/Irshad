import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/favicon")) return NextResponse.next();

  const hasAccess = request.cookies.get("irshad_entry_ok")?.value === "1";
  if (hasAccess) {
    if (pathname === "/entry") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname !== "/entry") {
    return NextResponse.redirect(new URL("/entry", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

