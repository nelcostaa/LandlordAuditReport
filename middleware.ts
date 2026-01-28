import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  // Allow Stripe webhook and checkout endpoints without auth
  const isStripeEndpoint = req.nextUrl.pathname.startsWith("/api/stripe");
  if (isStripeEndpoint) {
    return NextResponse.next();
  }

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Run middleware on dashboard and API routes that need protection
  matcher: ["/dashboard/:path*", "/api/:path*"],
};

