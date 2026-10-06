import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { DEFAULT_LOGIN_REDIRECT } from "./lib/auth-redirect";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  // Require a real user id rather than just a truthy `req.auth`, so a
  // misconfiguration that yields an error object can never count as logged in.
  const isLoggedIn = typeof req.auth?.user?.id === "string";

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isPublicRoute = nextUrl.pathname === "/";

  if (isApiAuthRoute || isPublicRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return Response.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl),
    );
  }
});

export const config = {
  matcher: ["/((?!.+\.[\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
