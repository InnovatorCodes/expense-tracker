// Server-only Firestore access through the Firebase Admin SDK.
// The browser never talks to Firestore directly; firestore.rules denies all
// client access, and every read/write goes through code in lib/server.
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let db: Firestore | undefined;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. See .env.example for the Firebase Admin setup.`,
    );
  }
  return value;
}

/** Lazily initialised so `next build` works without credentials present. */
export function getDb(): Firestore {
  if (db) return db;
  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: requireEnv("FIREBASE_PROJECT_ID"),
          clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
          // Hosting providers usually store the key with literal "\n" sequences.
          privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\n/g, "\n"),
        }),
      });
  db = getFirestore(app);
  return db;
}

export const userDoc = (userId: string) => getDb().doc(`users/${userId}`);
export const transactionsCol = (userId: string) =>
  getDb().collection(`users/${userId}/transactions`);
export const budgetsCol = (userId: string) =>
  getDb().collection(`users/${userId}/budgets`);
