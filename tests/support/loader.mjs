import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = new URL("../../", import.meta.url);
const FAKE = new URL("./fake-firestore.mjs", import.meta.url).href;
const FAKED = new Set([
  "@/lib/server/firebase-admin",
  "firebase-admin/firestore",
]);

export async function resolve(specifier, context, next) {
  if (FAKED.has(specifier)) return { url: FAKE, shortCircuit: true };
  if (specifier.startsWith("@/")) {
    for (const ext of [".ts", ".tsx"]) {
      const url = new URL(specifier.slice(2) + ext, ROOT);
      if (existsSync(fileURLToPath(url)))
        return { url: url.href, shortCircuit: true };
    }
  }
  return next(specifier, context);
}
