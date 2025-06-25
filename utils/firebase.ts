// lib/firestore.ts
// This file initializes Firebase and provides utility functions
// for interacting with Cloud Firestore, specifically for user expenses.

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { Transaction } from "@/types/transaction";

// --- GLOBAL VARIABLES (Provided by Canvas Runtime) ---
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // This must be your correct project ID
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db, appId };

/**
 * Gets a reference to a user's specific transactions collection in Firestore.
 * IMPORTANT: This now points to a top-level `users` collection.
 * Path: `users/{userId}/transactions`
 *
 * @param userId The ID of the currently authenticated user.
 * @returns A CollectionReference for the user's transactions.
 */
const getUserTransactionsCollectionRef = (userId: string) => {
  const path = `users/${userId}/transactions`;
  return collection(db, path);
};

/**
 * Gets a reference to a user's main document in Firestore.
 * IMPORTANT: This now points to a top-level `users` collection.
 * Path: `users/{userId}`
 *
 * @param userId The ID of the currently authenticated user.
 * @returns A DocumentReference for the user's main document.
 */
const getUserDocRef = (userId: string) => {
  const path = `users/${userId}`;
  return doc(db, path);
};

/**
 * Fetches the default currency for a specific user.
 *
 * @param userId The ID of the currently authenticated user.
 * @returns The default currency string (e.g., "USD", "INR") or undefined if not set.
 */
export const getUserDefaultCurrency = async (userId: string): Promise<string | undefined> => {
  try {
    const userDocRef = getUserDocRef(userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data?.defaultCurrency as string;
    } else {
      return "INR"; // Default to INR if no currency is set
    }
  } catch (error) {
    console.error(`Firestore: Error fetching default currency for user ${userId}:`, error);
    return undefined;
  }
};

/**
 * Sets the default currency for a specific user.
 * This will create the user document if it doesn't exist.
 *
 * @param userId The ID of the currently authenticated user.
 * @param currency The currency to set as default (e.g., "USD", "INR").
 */
export const setUserDefaultCurrency = async (userId: string, currency: string) => {
  try {
    const userDocRef = getUserDocRef(userId);
    // Use setDoc with merge: true to update only the defaultCurrency field
    // without overwriting other fields if the document already exists.
    await setDoc(userDocRef, { defaultCurrency: currency }, { merge: true });
  } catch (error) {
    console.error(`Firestore: Error setting default currency for user ${userId}:`, error);
    throw error; // Re-throw to handle in calling function
  }
};

/**
 * Subscribes to a user's transactions in real-time.
 * It sets up an onSnapshot listener that calls a callback function
 * whenever the transactions collection changes.
 *
 * @param userId The ID of the currently authenticated user.
 * @param callback A function to call with the fetched transactions.
 * @returns A function to unsubscribe from the listener.
 */
export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void
) => {

  // If userId is missing, log an error and don't proceed with subscription
  if (!userId) {
    console.error("userId is undefined or null");
    callback([]); // Return empty array immediately
    return () => {}; // Return no-op unsubscribe
  }

  const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);
  const q = query(transactionsCollectionRef, orderBy("date", "desc"), orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedTransactions: Transaction[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const transaction: Transaction = {
        id: doc.id,
        name: data.name,
        amount: parseFloat(data.amount) || 0, // Ensure amount is parsed as number
        category: data.category,
        date: data.date,
        type: data.type, // 'expense' or 'income'
        notes: data.notes || undefined,
        createdAt: data.createdAt?.toDate() || new Date(), // Convert Firestore Timestamp to Date
      };
      return transaction;
    });

    callback(fetchedTransactions);
  }, (error) => {
    // This is the error handler for the onSnapshot listener itself
    console.error("Firestore: onSnapshot listener error:", error.name, error.message, error.code);
  });

  return unsubscribe;
};

/**
 * Subscribes to a user's balance in real-time.
 * It sets up an onSnapshot listener that calls a callback function
 * whenever the user's currentBalance field changes.
 *
 * @param userId The ID of the currently authenticated user.
 * @param callback A function to call with the fetched balance.
 * @returns A function to unsubscribe from the listener.
 */
export const subscribeToBalance = (
  userId: string,
  callback: (balance: number) => void
) => {
  if (!userId) {
    console.error("userId is undefined or null.");
    callback(0); // Default to 0 if no user
    return () => {};
  }

  const userDocRef = getUserDocRef(userId);

  const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      // Safely cast and default to 0 if 'currentBalance' field is missing or not a number
      const balance = (docSnap.data()?.currentBalance as number) || 0;
      callback(balance);
    } else {
      callback(0); // Default balance if user doc doesn't exist
    }
  }, (error) => {
    console.error("Firestore: Error subscribing to balance:", error.name, error.message, error.code);
  });

  return unsubscribe;
};

export const subscribeToMonthlyTotals = (
  userId: string,
  year: number,
  month: number, // 1-indexed month
  callback: (monthlyIncome: number, monthlyExpenses: number) => void
) => {
  if (!userId) {
    console.error("userId is undefined or null");
    callback(0, 0);
    return () => {};
  }

  const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);

  // Calculate the start and end dates for the current month in "YYYY-MM-DD" format
  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
  const endOfMonthDate = new Date(year, month, 0); // Day 0 of next month is last day of current month
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(endOfMonthDate.getDate()).padStart(2, '0')}`;

  const q = query(
    transactionsCollectionRef,
    where("date", ">=", startOfMonth),
    where("date", "<=", endOfMonth),
    orderBy("date", "asc"), // Order by date for consistency
    orderBy("createdAt", "asc") // Then by creation time for tie-breaking
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    let totalIncome = 0;
    let totalExpenses = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const amount = parseFloat(data.amount) || 0;
      if (data.type === 'income') {
        totalIncome += amount;
      } else if (data.type === 'expense') {
        totalExpenses += amount;
      }
    });

    callback(totalIncome, totalExpenses);
  }, (error) => {
    console.error("Firestore: Error subscribing to monthly totals:", error.name, error.message, error.code);
  });

  return unsubscribe;
};

/**
 * Retrieves the last 5 transactions for a specific user.
 * This is a one-time fetch, not a real-time subscription.
 *
 * @param userId The ID of the currently authenticated user.
 * @returns A promise that resolves to an array of the most recent 5 transactions.
 */
export const getRecentTransactions = async (userId: string): Promise<Transaction[]> => {
  if (!userId) {
    console.error("userId is undefined or null");
    return [];
  }

  try {
    const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);
    const q = query(
      transactionsCollectionRef,
      orderBy("date", "desc"), // Order by date descending (most recent first)
      orderBy("createdAt", "desc"), // Then by creation timestamp for tie-breaking
      limit(5) // Limit to the last 5 transactions
    );

    const querySnapshot = await getDocs(q); // Use getDocs for a one-time fetch

    const recentTransactions: Transaction[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const transaction: Transaction = {
        id: doc.id,
        name: data.name,
        amount: parseFloat(data.amount) || 0,
        category: data.category,
        date: data.date,
        type: data.type,
        notes: data.notes || undefined,
        createdAt: data.createdAt?.toDate() || new Date(), // Convert Firestore Timestamp to Date
      };
      return transaction;
    });

    return recentTransactions;
  } catch (error) {
    console.error("Firestore: Error fetching recent transactions:", error);
    // Depending on your error handling strategy, you might re-throw or return an empty array
    return [];
  }
};


/**
 * Retrieves the top N transactions for a specific user within the current year,
 * ordered by amount in descending order, regardless of type (income/expense).
 * This is a one-time fetch, not a real-time subscription.
 *
 * @param userId The ID of the currently authenticated user.
 * @param limitCount The number of top transactions to retrieve (e.g., 3).
 * @returns A promise that resolves to an array of top transactions.
 */
export const getTopTransactionsByAmountForCurrentYear = async (
  userId: string,
  limitCount: number = 3 // Default to 3 if not specified
): Promise<Transaction[]> => {
  if (!userId) {
    console.error("userId is undefined or null");
    return [];
  }

  try {
    const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);

    // Get the current year's start and end dates in YYYY-MM-DD format
    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01`;
    const endOfYear = `${currentYear}-12-31`;

    const q = query(
      transactionsCollectionRef,
      where("date", ">=", startOfYear),
      where("date", "<=", endOfYear),
      orderBy("amount", "desc"), // Order by amount descending
      orderBy("createdAt", "desc"), // Use createdAt as a tie-breaker for consistent results
      limit(limitCount) // Limit to the specified number of transactions
    );

    const querySnapshot = await getDocs(q);

    const topTransactions: Transaction[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const transaction: Transaction = {
        id: doc.id,
        name: data.name,
        amount: parseFloat(data.amount) || 0,
        category: data.category,
        date: data.date,
        type: data.type,
        notes: data.notes || undefined,
        createdAt: data.createdAt?.toDate() || new Date()
      };
      return transaction;
    });
    return topTransactions;
  } catch (error) {
    console.error("Firestore: Error fetching top transactions by amount:", error);
    // IMPORTANT: If you get an "The query requires an index" error here,
    // look for a link in your console and click it to create the composite index
    // for (amount descending, createdAt descending) and (date range where clauses).
    return [];
  }
};

export const getMonthlyCategorizedExpenses = async (
  userId: string,
  year: number,
  month: number, // 1-indexed month
): Promise<{ [key: string]: number }> => {
  if (!userId) {
    console.error("userId is undefined or null");
    return {};
  }

  const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);

  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
  const endOfMonthDate = new Date(year, month, 0);
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(endOfMonthDate.getDate()).padStart(2, '0')}`;

  const q = query(
    transactionsCollectionRef,
    where("type", "==", "expense"), // Only fetch expenses
    where("date", ">=", startOfMonth),
    where("date", "<=", endOfMonth),
    orderBy("date", "asc") // Order by date, can be adjusted
  );

  try {
    const snapshot = await getDocs(q); // Use getDocs for one-time fetch
    const categorizedExpenses: { [key: string]: number } = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'Other';
      const amount = parseFloat(data.amount) || 0;
      if(amount>0){
        if (categorizedExpenses[category]) {
          categorizedExpenses[category] += amount;
        } else {
          categorizedExpenses[category] = amount;
        }
      }
    });
    return categorizedExpenses;
  } catch (error) {
    console.error("Firestore: Error fetching monthly categorized expenses:", error);
    throw error; // Re-throw to be caught by the component
  }
};

export interface DailyFinancialData {
  date: string; // YYYY-MM-DD format
  income: number;
  expense: number;
}

export const getPastWeekIncomeExpenses = async (
  userId: string,
  daysAgo: number = 7
): Promise<DailyFinancialData[]> => {
  if (!userId) {
    console.error("userId is undefined or null");
    return [];
  }

  try {
    const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);

    const today = new Date();
    // Set to start of today (midnight)
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (daysAgo - 1)); // Go back N-1 days to include today

    const startDateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const endDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    // Query all transactions within the date range
    const q = query(
      transactionsCollectionRef,
      where("date", ">=", startDateString),
      where("date", "<=", endDateString),
      orderBy("date", "asc") // Order by date to process chronologically
    );

    const querySnapshot = await getDocs(q);

    // Initialize data structure for the last N days
    const dailyDataMap: { [key: string]: { income: number; expense: number } } = {};
    for (let i = 0; i < daysAgo; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dailyDataMap[dateKey] = { income: 0, expense: 0 };
    }

    // Aggregate data
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.date; // Date is already in YYYY-MM-DD format
      const amount = parseFloat(data.amount) || 0;
      const type = data.type;

      if (dailyDataMap[date]) { // Ensure date exists in our range
        if (type === 'income') {
          dailyDataMap[date].income += amount;
        } else if (type === 'expense') {
          dailyDataMap[date].expense += amount;
        }
      }
    });

    // Convert map to sorted array
    const result: DailyFinancialData[] = Object.keys(dailyDataMap)
      .sort() // Sort keys (dates) to ensure chronological order
      .map(dateKey => ({
        date: dateKey.slice(5), // Format to "MM-DD" for chart display
        income: dailyDataMap[dateKey].income,
        expense: dailyDataMap[dateKey].expense,
      }));
    return result;
  } catch (error) {
    console.error("Firestore: Error fetching daily income/expenses:", error);
    return [];
  }
};


/**
 * Adds a new transaction document (expense or income) to a user's transactions collection.
 *
 * @param userId The ID of the currently authenticated user.
 * @param transactionData The data for the new transaction (excluding id and createdAt).
 * @returns The ID of the newly added document.
 */
export const addTransaction = async (
  userId: string,
  transactionData: Omit<Transaction, 'id' | 'createdAt' | 'userId'>
) => {
  try {
    const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);
    const userDocRef = getUserDocRef(userId); // Get reference to the user's main document

    // 1. Add the transaction document
    const docRef = await addDoc(transactionsCollectionRef, {
      ...transactionData,
      userId: userId, // Ensure userId is also stored in the transaction document
      createdAt: serverTimestamp(), // Firestore specific: uses server timestamp
    });

    // 2. Atomically update the user's current balance
    const amountChange = transactionData.type === 'income' ? transactionData.amount : -transactionData.amount;

    // Check if the user document exists to ensure we don't try to update a non-existent document
    // If it doesn't exist, create it with the initial balance.
    const userDocSnapshot = await getDoc(userDocRef);
    if (!userDocSnapshot.exists()) {
      await setDoc(userDocRef, {
        currentBalance: amountChange, // Set initial balance
      });
      setUserDefaultCurrency(userId,'INR')
    } else {
      await updateDoc(userDocRef, {
        currentBalance: increment(amountChange),
      });
    }

    return docRef.id;
  } catch (e) {
    console.error("Error adding transaction and updating balance:", e);
    throw e;
  }
};

/**
 * Deletes a transaction document from a user's transactions collection.
 *
 * @param userId The ID of the currently authenticated user.
 * @param transactionId The ID of the transaction document to delete.
 */
export const deleteTransaction = async (userId: string, transactionId: string) => {
  try {
    let amountChange =0;
    const transactionDocRef = doc(getUserTransactionsCollectionRef(userId), transactionId);
    await getDoc(transactionDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        amountChange = data.type === 'income' ? -data.amount : data.amount; // Negate the amount for balance update
      } else {
        console.warn(`Transaction document with ID ${transactionId} does not exist.`);
        return; // Exit if the document doesn't exist
      }
    });
    await deleteDoc(transactionDocRef);
    const userDocRef = getUserDocRef(userId);
    const userDocSnapshot = await getDoc(userDocRef);
    if (!userDocSnapshot.exists()) {
      await setDoc(userDocRef, {
        currentBalance: amountChange, // Set initial balance
      });
      setUserDefaultCurrency(userId,'INR')
    } else {
      await updateDoc(userDocRef, {
        currentBalance: increment(amountChange),
      });
    }
  } catch (e) {
    console.error("Error removing transaction document: ", e);
    throw e;
  }
};
