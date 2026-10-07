import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TIMEZONE_COOKIE, todayIn } from "@/lib/dates";

/** The signed-in user's ID, or a redirect to the login page. For pages. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/auth/login");
  return id;
}

/** The signed-in user's display name, if any. */
export async function getUserName(): Promise<string | null> {
  const session = await auth();
  return session?.user?.name ?? null;
}

/** The signed-in user's ID, or null. For server actions. */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Today's date in the user's timezone (reported by the browser via cookie). */
export async function getUserToday(): Promise<string> {
  const tz = (await cookies()).get(TIMEZONE_COOKIE)?.value;
  return todayIn(tz ? decodeURIComponent(tz) : undefined);
}
