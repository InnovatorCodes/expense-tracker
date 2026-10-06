"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TIMEZONE_COOKIE } from "@/lib/dates";

/**
 * Tells the server the browser's timezone so "today" and "this month" are
 * computed for the user, not for the server (which usually runs in UTC).
 */
export function TimezoneSync() {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${TIMEZONE_COOKIE}=`))
      ?.split("=")[1];
    if (current && decodeURIComponent(current) === tz) return;
    document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    // Re-render server components with the correct local date.
    router.refresh();
  }, [router]);
  return null;
}
