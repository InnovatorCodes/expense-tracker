export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * Only allow same-site relative paths as post-login destinations, which
 * prevents open redirects such as ?callbackUrl=//evil.example.
 */
export function safeCallbackUrl(url: unknown): string {
  if (
    typeof url !== "string" ||
    !url.startsWith("/") ||
    url.startsWith("//") ||
    url.startsWith("/\\") ||
    url.startsWith("/auth")
  ) {
    return DEFAULT_LOGIN_REDIRECT;
  }
  return url;
}
