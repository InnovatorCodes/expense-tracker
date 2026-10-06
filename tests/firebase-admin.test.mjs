import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { cert, deleteApp, getApps } from "firebase-admin/app";

// A throwaway key so cert() can parse real PEM data; nothing talks to Google.
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const PEM = privateKey.export({ type: "pkcs8", format: "pem" });
const ACCOUNT = {
  type: "service_account",
  project_id: "demo-project",
  client_email: "firebase-adminsdk@demo-project.iam.gserviceaccount.com",
  private_key: PEM,
};
const VARS = [
  "FIREBASE_SERVICE_ACCOUNT_KEY",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "GOOGLE_APPLICATION_CREDENTIALS",
];

let n = 0;
// Fresh module instance per test, because getDb() caches its client.
const load = () => import(`../lib/server/firebase-admin.ts?case=${++n}`);

afterEach(async () => {
  for (const v of VARS) delete process.env[v];
  await Promise.all(getApps().map((app) => deleteApp(app)));
});

const projectOf = (db) => db.projectId ?? db._settings?.projectId;

test("downloaded key JSON pasted as-is", async () => {
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify(ACCOUNT);
  const { getDb } = await load();
  assert.equal(projectOf(getDb()), "demo-project");
});

test("downloaded key JSON as base64", async () => {
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY = Buffer.from(
    JSON.stringify(ACCOUNT),
  ).toString("base64");
  const { getDb } = await load();
  assert.equal(projectOf(getDb()), "demo-project");
});

test("separate variables with the key on one line using \\n escapes", async () => {
  process.env.FIREBASE_PROJECT_ID = "demo-project";
  process.env.FIREBASE_CLIENT_EMAIL = ACCOUNT.client_email;
  // Exactly how hosting dashboards store it: one line, literal \n, in quotes.
  const oneLine = `"${PEM.trim().replace(/\n/g, "\\n")}"`;
  assert.ok(!oneLine.includes("\n") && oneLine.includes("\\n"));
  // Without normalisation the SDK rejects it, which is the bug this guards against.
  assert.throws(() =>
    cert({
      projectId: "p",
      clientEmail: ACCOUNT.client_email,
      privateKey: oneLine,
    }),
  );
  process.env.FIREBASE_PRIVATE_KEY = oneLine;
  const { getDb } = await load();
  assert.equal(projectOf(getDb()), "demo-project");
});

test("clear errors for incomplete or missing configuration", async () => {
  process.env.FIREBASE_CLIENT_EMAIL = ACCOUNT.client_email;
  assert.throws(() => getDbFrom(), /FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY/);
  delete process.env.FIREBASE_CLIENT_EMAIL;
  assert.throws(() => getDbFrom(), /credentials are not configured/);
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY = "{not json";
  assert.throws(() => getDbFrom(), /not valid JSON/);
});

let mod;
const getDbFrom = () => mod.getDb();
test.before(async () => {
  mod = await import("../lib/server/firebase-admin.ts?case=errors");
});
