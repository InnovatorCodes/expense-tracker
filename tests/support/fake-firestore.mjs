// Minimal in-memory stand-in for the parts of the Firebase Admin Firestore
// API used by lib/server. Also re-exports the helpers from firebase-admin.ts.
export const store = new Map(); // path -> data
let auto = 0;
const snap = (path) => {
  const data = store.get(path);
  return {
    id: path.split("/").pop(),
    ref: docRef(path),
    exists: data !== undefined,
    data: () => (data ? { ...data } : undefined),
    get: (k) => data?.[k],
  };
};
const docRef = (path) => ({
  id: path.split("/").pop(),
  path,
  get: async () => snap(path),
  set: async (v, o) =>
    store.set(path, o?.merge ? { ...(store.get(path) ?? {}), ...v } : { ...v }),
  update: async (v) => store.set(path, { ...store.get(path), ...v }),
  delete: async () => store.delete(path),
});
const query = (col, filters = [], orders = [], lim = Infinity) => ({
  where: (f, op, v) => query(col, [...filters, [f, op, v]], orders, lim),
  orderBy: (f, dir = "asc") => query(col, filters, [...orders, [f, dir]], lim),
  limit: (n) => query(col, filters, orders, n),
  get: async () => {
    let docs = [...store.keys()]
      .filter(
        (p) =>
          p.startsWith(col + "/") && !p.slice(col.length + 1).includes("/"),
      )
      .map(snap);
    const ops = {
      "==": (a, b) => a === b,
      ">=": (a, b) => a >= b,
      "<=": (a, b) => a <= b,
    };
    docs = docs.filter((d) =>
      filters.every(([f, op, v]) => ops[op](d.get(f), v)),
    );
    docs.sort((a, b) => {
      for (const [f, dir] of orders) {
        const x = a.get(f),
          y = b.get(f);
        if (x < y) return dir === "desc" ? 1 : -1;
        if (x > y) return dir === "desc" ? -1 : 1;
      }
      return 0;
    });
    docs = docs.slice(0, lim);
    return { docs, empty: docs.length === 0 };
  },
  aggregate: (spec) => ({
    get: async () => {
      const { docs } = await query(col, filters, orders, lim).get();
      const out = {};
      for (const [k, f] of Object.entries(spec))
        out[k] = docs.reduce(
          (s, d) =>
            s + (typeof d.get(f.field) === "number" ? d.get(f.field) : 0),
          0,
        );
      return { data: () => out };
    },
  }),
});
const colRef = (path) => ({
  ...query(path),
  doc: (id = "auto" + ++auto) => docRef(`${path}/${id}`),
});
const db = {
  batch: () => {
    const ops = [];
    return {
      update: (ref, v) => ops.push(() => ref.update(v)),
      commit: async () => {
        for (const o of ops) await o();
      },
    };
  },
};
export const getDb = () => db;
export const userDoc = (u) => docRef(`users/${u}`);
export const transactionsCol = (u) => colRef(`users/${u}/transactions`);
export const budgetsCol = (u) => colRef(`users/${u}/budgets`);
export const AggregateField = { sum: (field) => ({ field }) };
export const FieldValue = { serverTimestamp: () => "TS" };
