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
import { Budget } from "@/types/budget";

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

const getUserBudgetsCollectionRef = (userId: string) => {
  const path = `/users/${userId}/budgets`;
  return collection(db, path);
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
 * Subscribes to real-time updates of recent transactions for a user.
 * Fetches the most recent `limitCount` transactions.
 *
 * @param userId The ID of the user.
 * @param limitCount The maximum number of recent transactions to return (default: 5).
 * @param callback A function to be called with the fetched transactions whenever data changes.
 * @returns A function to unsubscribe from the listener.
 */
export const subscribeToRecentTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void,
  limitCount: number = 4 // Default to 5 recent transactions
) => {

  if (!userId) {
    console.error("userId is undefined or null");
    callback([]);
    return () => {}; // Return an empty unsubscribe function
  }

  const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);
  const q = query(
    transactionsCollectionRef,
    orderBy("date", "desc"), // Order by date descending
    orderBy("createdAt", "desc"), // Secondary sort for stable order
    limit(limitCount) // Limit to the most recent transactions
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedTransactions: Transaction[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const transaction: Transaction = {
        id: doc.id,
        name: data.name,
        amount: parseFloat(data.amount) || 0,
        category: data.category,
        date: data.date,
        type: data.type,
        notes: data.notes || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
      return transaction;
    });

    callback(fetchedTransactions);
  }, (error) => {
    console.error("Firestore: onSnapshot listener error for recent transactions:", error.name, error.message, error.code);
  });

  return unsubscribe;
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

/**
 * Subscribes to real-time updates of monthly categorized expenses for a user.
 * Aggregates expense transactions by category for the specified month.
 *
 * @param userId The ID of the user.
 * @param year The year of the month to query.
 * @param month The month (1-indexed, e.g., 6 for June).
 * @param callback A function to be called with the categorized expenses whenever data changes.
 * @returns A function to unsubscribe from the listener.
 */
export const subscribeToMonthlyCategorizedExpenses = (
  userId: string,
  year: number,
  month: number, // 1-indexed month
  callback: (categorizedExpenses: { [key: string]: number }) => void
) => {
  if (!userId) {
    console.error("userId is undefined or null");
    callback({});
    return () => {};
  }

  const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);

  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
  const endOfMonthDate = new Date(year, month, 0); // Day 0 of next month is last day of current month
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(endOfMonthDate.getDate()).padStart(2, '0')}`;

  const q = query(
    transactionsCollectionRef,
    where("type", "==", "expense"),
    where("date", ">=", startOfMonth),
    where("date", "<=", endOfMonth),
    orderBy("date", "asc") // Order by date for consistent snapshot results
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const categorizedExpenses: { [key: string]: number } = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'Other';
      const amount = parseFloat(data.amount) || 0;
      if (categorizedExpenses[category]) {
        categorizedExpenses[category] += amount;
      } else {
        categorizedExpenses[category] = amount;
      }
    });

    callback(categorizedExpenses);
  }, (error) => {
    console.error("Firestore: Error subscribing to monthly categorized expenses:", error.name, error.message, error.code);
  });

  return unsubscribe;
};

export const subscribeToPastWeekTransactions = (
  userId: string,
  daysAgo: number = 7,
  callback: (data: DailyFinancialData[]) => void
) => {
  if (!userId) {
    console.error("userId is undefined or null");
    callback([]);
    return () => {};
  }

  const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today (midnight)

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (daysAgo - 1)); // Go back N-1 days to include today

  const startDateString = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
  const endDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const q = query(
    transactionsCollectionRef,
    where("date", ">=", startDateString),
    where("date", "<=", endDateString),
    orderBy("date", "asc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    
    // Initialize data structure for the last N days
    const dailyDataMap: { [key: string]: { income: number; expense: number } } = {};
    for (let i = 0; i < daysAgo; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dailyDataMap[dateKey] = { income: 0, expense: 0 };
    }

    // Aggregate data from the snapshot
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.date;
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
        date: dateKey.slice(5), // MM-DD for chart X-axis
        fullDate: dateKey,      // YYYY-MM-DD for Date object construction
        income: dailyDataMap[dateKey].income,
        expense: dailyDataMap[dateKey].expense,
      }));

    callback(result);
  }, (error) => {
    console.error("Firestore: Error subscribing to daily income/expenses:", error.name, error.message, error.code);
  });

  return unsubscribe;
};

export const subscribeToTopTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void,
  limitCount: number = 3 // Default to 3 if not specified
) => {
  if (!userId) {
    callback([]);
    return () => {};
  }

  const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);

  const currentYear = new Date().getFullYear();
  const startOfYear = `${currentYear}-01-01`;
  const endOfYear = `${currentYear}-12-31`;

  const q = query(
    transactionsCollectionRef,
    where("date", ">=", startOfYear),
    where("date", "<=", endOfYear),
    orderBy("amount", "desc"), // Order by amount descending
    orderBy("createdAt", "desc"), // Secondary sort for stable order
    limit(limitCount) // Limit to the specified number of transactions
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log(`Firestore: Top transactions onSnapshot triggered! Docs count: ${snapshot.docs.length}`);
    const fetchedTransactions: Transaction[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const transaction: Transaction = {
        id: doc.id,
        name: data.name,
        amount: parseFloat(data.amount) || 0,
        category: data.category,
        date: data.date,
        type: data.type,
        notes: data.notes || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
      return transaction;
    });

    callback(fetchedTransactions);
  }, (error) => {
    console.error("Firestore: onSnapshot listener error for top transactions:", error.name, error.message, error.code);
  });

  return unsubscribe;
};

export interface DailyFinancialData {
  date: string; // YYYY-MM-DD format
  income: number;
  expense: number;
}

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
 * Updates an existing transaction and adjusts the user's balance accordingly.
 * @param userId The ID of the user.
 * @param transactionId The ID of the transaction to update.
 * @param updatedData The partial data to update the transaction with.
 * @param originalTransaction The original transaction object, needed to calculate balance adjustment.
 */
export const updateTransaction = async (
  userId: string,
  transactionId: string,
  updatedData: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>,
  originalTransaction: Transaction // Pass original transaction for balance adjustment
) => {
  try {
    const transactionDocRef = doc(getUserTransactionsCollectionRef(userId), transactionId);
    const userDocRef = getUserDocRef(userId);

    // Calculate balance adjustment
    let balanceChange = 0;

    // Determine the original value's impact
    const originalAmountImpact = originalTransaction.type === 'income' ? originalTransaction.amount : -originalTransaction.amount;

    const newAmount = typeof updatedData.amount === 'string' ? parseFloat(updatedData.amount) : updatedData.amount;
    const finalNewAmount = newAmount !== undefined ? newAmount : originalTransaction.amount;

    const newType = updatedData.type !== undefined ? updatedData.type : originalTransaction.type;
    const newAmountImpact = newType === 'income' ? finalNewAmount : -finalNewAmount;

    // The change in balance is (new impact) - (original impact)
    balanceChange = newAmountImpact - originalAmountImpact;

    // Perform the update
    await updateDoc(transactionDocRef, updatedData);

    // Update user balance
    if (balanceChange !== 0) {
      await updateDoc(userDocRef, {
        currentBalance: increment(balanceChange),
      });
    }
  } catch (e) {
    console.error("Error updating transaction:", e);
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


interface BudgetData{
  category: string;
  amount: number;
}

export const subscribeToBudgets= async (
  userId: string,
  budgetCallback: (budgets: Budget[]) => void,
  transactionCallback: (transactions: { [key: string]: number })=>void,
)=>{
  if (!userId) {
    console.error("userId is undefined or null");
    budgetCallback([]); // Return empty array immediately
    transactionCallback({})
    return () => {}; // Return no-op unsubscribe
  }

  const date=new Date();
  const transactionsCollectionRef = getUserTransactionsCollectionRef(userId);
  const startOfMonth = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-01`;
  const endOfMonthDate = new Date(date.getFullYear(), date.getMonth()+2, 0); // Day 0 of next month is last day of current month
  const endOfMonth = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(endOfMonthDate.getDate()).padStart(2, '0')}`;
  console.log(startOfMonth,endOfMonth)
  const q1 = query(
    transactionsCollectionRef,
    where("type", "==", "expense"),
    where("date", ">=", startOfMonth),
    where("date", "<=", endOfMonth), 
  );
  const categoryAmounts: { [key: string]: number } = {"All":0};
  await getDocs(q1).then((querySnapshot)=>{
    console.log(querySnapshot.docs.length);
    querySnapshot.docs.map(doc => {
      const data = doc.data();
      if(!categoryAmounts[data.category]){
        categoryAmounts[data.category]=0;
      }
      categoryAmounts[data.category]+=data.amount;
      categoryAmounts["All"]+=data.amount;
    });
    transactionCallback(categoryAmounts);
  });

  const budgetsCollectionRef = collection(db, 'users', userId, 'budgets');
  const q2 = query(budgetsCollectionRef, orderBy('createdAt'));

  const unsubscribe = onSnapshot(q2, (snapshot) => {
    const fetchedBudgets: Budget[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const budget: Budget = {
        id: doc.id,
        category: data.category,
        amount: data.amount,
        createdAt: data.createdAt?.toDate() || new Date(), // Convert Firestore Timestamp to Date
      };
      return budget;
    });
    
    budgetCallback(fetchedBudgets);
  }, (error) => {
    // This is the error handler for the onSnapshot listener itself
    console.error("Firestore: onSnapshot listener error:", error.name, error.message, error.code);
  });
  return unsubscribe;
}

/**
 * Adds a new budget to Firestore.
 * @param userId The ID of the user creating the budget.
 * @param budgetData The data for the new budget, excluding ID and createdAt.
 * @returns A promise that resolves to the ID of the newly created budget.
 */
export const addBudget = async (userId: string, budgetData: BudgetData) => {
  try {
    const { category,amount } = budgetData; // Destructure recurrence periods
    const budgetsCollectionRef = getUserBudgetsCollectionRef(userId);

    const q=query(budgetsCollectionRef,where("category","==",category))
    const existingDocs=await getDocs(q);
    
    // 2. Try to fetch the document

    if(!existingDocs.empty) {
      // Budget document for this category already exists
      throw new Error(
        `A budget already exists for category '${category}'.`
      );
    } else {
      // Budget document for this category does NOT exist, so create a new one
      const budgetDocRef= await addDoc(budgetsCollectionRef, {
        category: category, // Ensure category is explicitly set as a field
        amount: amount,
        createdAt: serverTimestamp()
      });
      return budgetDocRef.id; // Return the ID (category name)
    }
  } catch (e) {
    console.error('Error adding/updating budget:', e);
    throw e; // Re-throw the error for the caller to handle
  }
};


type UpdatableBudgetFields = Partial<Omit<Budget, 'id' | 'createdAt' | 'userId'>>;

export const updateBudget = async (
  userId: string,
  budgetId: string,
  updatedData: UpdatableBudgetFields
) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  if (!budgetId) {
    throw new Error("Category ID is required to edit a budget.");
  }
  if (Object.keys(updatedData).length === 0) {
    throw new Error("No data provided for update.");
  }

  try {
    // Get a reference to the specific budget document
    const budgetDocRef = doc(db, 'users', userId, 'budgets', budgetId);

    // Use updateDoc to update the specified fields
    // This will only update the fields provided in updatedData, leaving others untouched.
    await updateDoc(budgetDocRef, updatedData);
  } catch (e) {
    console.error(`Error editing budget for category ID: '${budgetId}',`, e);
    throw e; // Re-throw the error for the calling component/function to handle
  }
};

export const deleteBudget = async (
  userId: string,
  categoryId: string
) => {

  if (!userId) {
    throw new Error("User ID is required to delete a budget.");
  }
  if (!categoryId) {
    throw new Error("Category ID is required to delete a budget.");
  }

  try {
    // Get a reference to the specific budget document
    const budgetDocRef = doc(db, 'users', userId, 'budgets', categoryId);

    // Use deleteDoc to remove the document
    await deleteDoc(budgetDocRef);
  } catch (e) {
    console.error(`Error deleting budget for category '${categoryId}':`, e);
    throw e; // Re-throw the error for the calling component/function to handle
  }
};