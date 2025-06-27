export interface Budget {
  id: string; // Firestore document ID
  category: string; // The category this budget applies to (e.g., 'Food', 'Transport')
  amount: number;
  createdAt: Date; // Timestamp of when the budget was created
}
