// utils/firebase.ts
// This file initializes Firebase and provides helper functions to interact with Cloud Firestore.

// Import necessary functions from the Firebase SDK
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
  setDoc,
  getDoc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { Transaction } from "@/types/transaction"; // Import the Transaction interface and type


const localFireBaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// --- MANDATORY GLOBAL VARIABLES FOR CANVAS ENVIRONMENT ---
// These variables are provided by the Canvas runtime and are crucial
// for correctly initializing Firebase and structuring your Firestore paths.
// DO NOT remove or modify these lines.
// 'default-app-id' is a fallback for local development outside the Canvas environment.
//const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// __firebase_config is a JSON string of your Firebase project's config.
// It will be parsed into a JavaScript object.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : localFireBaseConfig;

// 1. Initialize Firebase App
// This creates and initializes a Firebase app instance using your project configuration.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Get Firestore Database Instance
// This gets the Firestore database instance associated with your Firebase app.
const db = getFirestore(app);

// --- Data Interface Definition ---
// Define the structure for an 'Expense' document.
// This helps with type safety throughout your application.
// --- Firestore Data Access Helper Functions ---

/**
 * Gets a reference to the user's private expenses collection in Firestore.
 * This function constructs the full path: /artifacts/{appId}/users/{userId}/expenses
 * This path adheres to the Canvas environment's security and data isolation requirements.
 *
 * @param userId The authenticated user's unique ID (obtained from Auth.js session).
 * @returns A CollectionReference to the user's expenses.
 * @throws Error if userId is not provided.
 */
const getUserTransactionsCollectionRef = (userId: string) => {
  // Using 'artifacts' and 'appId' as per previous discussion and existing structure.
  // If you wish to use 'users/{userId}/transactions' directly as discussed,
  // you would change this line to: `return collection(db, `users/${userId}/transactions`);`
  return collection(db, `users/${userId}/transactions`);
};

/**
 * Gets a reference to a user's main document in Firestore.
 * This document will store aggregated data like currentBalance.
 * Path: `artifacts/{appId}/users/{userId}`
 *
 * @param userId The ID of the currently authenticated user.
 * @returns A DocumentReference for the user's main document.
 */
const getUserDocRef = (userId: string) => {
  return doc(db, `users`, userId);
};

export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void
) => {
  const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);
  // Order transactions by date (descending) then by createdAt (descending)
  const q = query(transactionsCollectionRef, orderBy("date", "desc"), orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedTransactions: Transaction[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure createdAt is a Date object from Firestore Timestamp
      createdAt: (doc.data().createdAt?.toDate() || new Date()) as Date,
      // Ensure date is a string in "YYYY-MM-DD" format
      date: doc.data().date || new Date().toISOString().slice(0, 10),
    }) as Transaction); // Type assertion for safety

    callback(fetchedTransactions);
  }, (error) => {
    console.error("Error subscribing to transactions:", error);
    // You might want to handle this error more gracefully in your UI
  });

  return unsubscribe; // Return the unsubscribe function to clean up the listener
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
        // You might add other user profile fields here if they are not stored in Auth.js's User collection
        // e.g., userId: userId, createdAt: serverTimestamp() etc.
      });
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
