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
      console.log(`Firestore: Fetched default currency for user ${userId}:`, data?.defaultCurrency);
      return data?.defaultCurrency as string;
    } else {
      console.log(`Firestore: User document for ${userId} does not exist or defaultCurrency not set.`);
      return undefined;
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
    console.log(`Firestore: Default currency for user ${userId} set to ${currency}.`);
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
  console.log("subscribeToBalance called for userId:", userId);
  if (!userId) {
    console.error("subscribeToBalance: userId is undefined or null. Cannot subscribe.");
    callback(0); // Default to 0 if no user
    return () => {};
  }

  const userDocRef = getUserDocRef(userId);
  console.log("Firestore: Setting up onSnapshot listener for user balance:", userDocRef.path);

  const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
    console.log("Firestore: Balance onSnapshot triggered! Doc exists:", docSnap.exists());
    if (docSnap.exists()) {
      // Safely cast and default to 0 if 'currentBalance' field is missing or not a number
      const balance = (docSnap.data()?.currentBalance as number) || 0;
      console.log("Firestore: Fetched balance:", balance);
      callback(balance);
    } else {
      console.log("Firestore: User document does not exist for balance subscription.");
      callback(0); // Default balance if user doc doesn't exist
    }
  }, (error) => {
    console.error("Firestore: Error subscribing to balance:", error.name, error.message, error.code);
  });

  return unsubscribe;
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

    console.log("Transaction written with ID:", docRef.id, "and balance updated.");
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
    const transactionDocRef = doc(getUserTransactionsCollectionRef(userId), transactionId);
    await deleteDoc(transactionDocRef);
    console.log("Transaction document successfully deleted!");
  } catch (e) {
    console.error("Error removing transaction document: ", e);
    throw e;
  }
};
