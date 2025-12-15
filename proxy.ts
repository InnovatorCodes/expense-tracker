import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

// Next.js 16 Proxy convention: export 'proxy' or default.
// Using the auth wrapper as default export.
export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isAuthRoute = nextUrl.pathname.startsWith("/auth");

    // Strategy:
    // 1. Always allow API auth routes.
    // 2. Auth routes: redirect to /dashboard if logged in.
    // 3. Protected routes: redirect to /auth/login if NOT logged in.

    const isPublicRoute = nextUrl.pathname === "/";

    if (isApiAuthRoute) {
        return;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return;
    }

    // If not logged in and not on a public route, redirect to login.
    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);

        return Response.redirect(
            new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        );
    }

    return;
});

// Optionally, don't invoke Proxy on some paths
export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
