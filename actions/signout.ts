"use server"; // This directive MUST be at the very top of the file

import { signOut as nextAuthSignOut } from "@/auth"; // Assuming your actual signOut is here

export async function signOut() {
  sessionStorage.removeItem('refreshed')
  console.log(sessionStorage.getItem('refreshed'));
  await nextAuthSignOut({
    redirectTo: "/"
  });
}
