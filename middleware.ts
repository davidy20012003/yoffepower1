import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.split("/")[1];

  if (host === "yoffepower.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = "www.yoffepower.com";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  if (firstSegment && !isLocale(firstSegment) && !pathname.includes(".")) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
