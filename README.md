# Expense Tracker

A feature-rich expense tracker application built with modern web technologies to help you manage your finances effectively. This application allows users to track their expenses and budgets with support for multiple currencies, real-time data updates, and a customizable user interface.

---
**Live Demo:** [Check out the live demo here!](spendsense-tracker.vercel.app)

## ✨ Features

- **Authentication**: Secure user authentication implemented with **Auth.js**, supporting both credentials-based login and social login with **Google**.
- **Real-time Data**: Transactions are stored in **Firebase Firestore** with real-time subscriptions, ensuring that your data is always up-to-date across all sessions.
- **Multi-Currency Support**: Add transactions in 6 different currencies. All financial data is aggregated and displayed in a base currency (INR).
- **Transaction Management**: Users can easily add, edit, and categorize their transactions.
- **Budgeting**: Create and manage budgets. Pin your most important budget to the dashboard for quick access.
- **Data Visualization**: Interactive charts and UI components from **shadcn/ui** to visualize your financial data.
- **Customizable Theme**: Switch between light and dark themes with **next-themes**.
- **Responsive Design**: The application is fully responsive and works seamlessly on all devices.
- **TypeScript**: The entire project is built with **TypeScript**, ensuring type safety and improved developer experience.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Auth.js](https://authjs.dev/)
- **Database**:
  - [MongoDB](https://www.mongodb.com/) for user data.
  - [Firebase Firestore](https://firebase.google.com/docs/firestore) for transaction data.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm (or yarn/pnpm) installed on your machine.

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/InnovatorCodes/expense-tracker.git
    ```
2.  **Navigate to the project directory**
    ```sh
    cd expense-tracker
    ```
3.  **Install NPM packages**
    ```sh
    npm install
    ```
4.  **Set up environment variables**

    Create a `.env.local` file in the root of your project and add the following environment variables. You will need to get your own credentials from Google, MongoDB, and Firebase.

    ```env
    # Auth.js
    AUTH_SECRET="YOUR_AUTH_SECRET"
    AUTH_URL="http://localhost:3000/api/auth"
    GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
    GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

    # MongoDB
    MONGODB_URI="YOUR_MONGODB_CONNECTION_STRING"

    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"

    # Add any other variables you have used
    ```

5.  **Run the development server**

    ```sh
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
