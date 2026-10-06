// Server-only Firestore access through the Firebase Admin SDK.
// The browser never talks to Firestore directly; firestore.rules denies all
// client access, and every read/write goes through code in lib/server.
//
// Authentication uses a Google service account (the current Admin SDK method),
// not the deprecated Realtime Database secrets. Credentials are read from the
// first of these that is configured:
//   1. FIREBASE_SERVICE_ACCOUNT_KEY: the downloaded key JSON, raw or base64.
//   2. FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.
//   3. Application Default Credentials: GOOGLE_APPLICATION_CREDENTIALS pointing
//      at the key file, or the built-in identity on Google Cloud.
import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type AppOptions,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let db: Firestore | undefined;

/**
 * Accepts a private key however a hosting dashboard stored it: with real
 * newlines, with literal "\n" escape sequences, or wrapped in extra quotes.
 */
function normalizePrivateKey(key: string): string {
  return key
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");
}

function parseServiceAccountKey(raw: string): ServiceAccount {
  const text = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw.trim(), "base64").toString("utf8");
  let json: Record<string, string>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON (or base64-encoded JSON).",
    );
  }
  if (!json.project_id || !json.client_email || !json.private_key) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is missing project_id, client_email or private_key. " +
        "Use the key from Project settings > Service accounts > Generate new private key.",
    );
  }
  return {
    projectId: json.project_id,
    clientEmail: json.client_email,
    privateKey: normalizePrivateKey(json.private_key),
  };
}

function credentialOptions(): AppOptions {
  const env = process.env;

  if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const account = parseServiceAccountKey(env.FIREBASE_SERVICE_ACCOUNT_KEY);
    return { credential: cert(account), projectId: account.projectId };
  }

  if (env.FIREBASE_CLIENT_EMAIL || env.FIREBASE_PRIVATE_KEY) {
    const missing = [
      "FIREBASE_PROJECT_ID",
      "FIREBASE_CLIENT_EMAIL",
      "FIREBASE_PRIVATE_KEY",
    ].filter((name) => !env[name]);
    if (missing.length) {
      throw new Error(
        `Missing environment variable(s): ${missing.join(", ")}. See .env.example.`,
      );
    }
    return {
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(env.FIREBASE_PRIVATE_KEY!),
      }),
      projectId: env.FIREBASE_PROJECT_ID,
    };
  }

  if (env.GOOGLE_APPLICATION_CREDENTIALS || env.FIREBASE_PROJECT_ID) {
    return {
      credential: applicationDefault(),
      projectId: env.FIREBASE_PROJECT_ID,
    };
  }

  throw new Error(
    "Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY " +
      "(see .env.example). Note: legacy Database secrets are not used or supported.",
  );
}

/** Lazily initialised so `next build` works without credentials present. */
export function getDb(): Firestore {
  if (db) return db;
  const app = getApps().length ? getApp() : initializeApp(credentialOptions());
  db = getFirestore(app);
  return db;
}

export const userDoc = (userId: string) => getDb().doc(`users/${userId}`);
export const transactionsCol = (userId: string) =>
  getDb().collection(`users/${userId}/transactions`);
export const budgetsCol = (userId: string) =>
  getDb().collection(`users/${userId}/budgets`);
