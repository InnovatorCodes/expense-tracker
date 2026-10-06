// Lets `node --test` load the app's TypeScript modules: resolves the "@/"
// path alias and swaps Firestore for an in-memory fake.
import { register } from "node:module";
register("./loader.mjs", import.meta.url);
