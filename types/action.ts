/** Result returned by every server action that the UI reports on. */
export type ActionResult =
  | { success: string; error?: never }
  | { error: string; success?: never };
