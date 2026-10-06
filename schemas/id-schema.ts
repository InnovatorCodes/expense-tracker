import * as z from "zod/v4";

/** Firestore auto-generated document IDs are 20 alphanumeric characters. */
export const docIdSchema = z.string().regex(/^[A-Za-z0-9]{1,128}$/);
