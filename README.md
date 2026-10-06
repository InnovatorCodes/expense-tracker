# Expense Tracker

A feature-rich expense tracker application built with modern web technologies to help you manage your finances effectively. This application allows users to track their expenses and budgets with support for multiple currencies and a customizable user interface.

---

**Live Demo:** [Check out the live demo here!](https://spendsense-tracker.vercel.app)

## ✨ Features

- **Authentication**: Secure, **Edge-compatible** authentication implemented with **Auth.js** and Next.js Proxy, supporting credentials and Google login.
- **Server-side data access**: Transactions and budgets live in **Firebase Firestore** and are only ever read and written by the Next.js server through the Firebase Admin SDK. The browser has no direct database access.
- **Multi-Currency Support**: Add transactions in 6 different currencies. Every transaction also stores its value in the base currency (INR) at the exchange rate of the day it was recorded, so past totals never change when rates move.
- **Transaction Management**: Add, edit, delete (with confirmation) and categorize transactions, browsing them month by month.
- **Budgeting**: Create monthly budgets per category or for all spending, and pin one to the dashboard.
- **Data Visualization**: Interactive, **high-contrast** charts and UI components from **shadcn/ui** to visualize your financial data.
- **Customizable Theme**: Switch between light and dark themes with **next-themes**.
- **Responsive Design**: Works on phones, tablets and desktops.
- **TypeScript**: The entire project is built with **TypeScript**.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Auth.js](https://authjs.dev/)
- **Database**:
  - [MongoDB](https://www.mongodb.com/) via [Prisma](https://www.prisma.io/) for user accounts.
  - [Firebase Firestore](https://firebase.google.com/docs/firestore) via the Firebase Admin SDK for transactions and budgets.
- **Exchange rates**: [ExchangeRate-API](https://www.exchangerate-api.com/), fetched on the server and cached for an hour.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes)

---

## 💱 How currencies are stored

Each transaction document keeps:

| Field          | Meaning                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `amount`       | What the user typed, in `currency`                                      |
| `currency`     | The currency it was entered in                                          |
| `exchangeRate` | Units of `currency` per 1 INR, captured on the server when it was saved |
| `baseAmount`   | `amount / exchangeRate`, rounded to 2 decimals: the value in INR        |

Balances, monthly totals, charts and budgets all add up `baseAmount`, so the numbers are stable over time. Editing a transaction keeps its original rate unless you change its currency. The balance is calculated from the transactions every time rather than stored as a running total, so it cannot drift.

Transactions created before this scheme are upgraded automatically, once per user, the first time that user loads a page while live exchange rates are available.

---

## 🚀 Getting Started

### Prerequisites

Node.js 20 or newer and npm.

### Installation

1.  **Clone the repo and install exactly the locked dependency versions**

    ```sh
    git clone https://github.com/InnovatorCodes/expense-tracker.git
    cd expense-tracker
    npm ci
    ```

2.  **Set up environment variables**

    Copy `.env.example` to `.env.local` and fill it in. You will need credentials from Google, MongoDB, Firebase and ExchangeRate-API.

    ```env
    AUTH_SECRET=""            # npx auth secret
    GOOGLE_CLIENT_ID=""
    GOOGLE_CLIENT_SECRET=""

    DATABASE_URL=""           # MongoDB connection string used by Prisma

    FIREBASE_PROJECT_ID=""    # From a Firebase service account key
    FIREBASE_CLIENT_EMAIL=""
    FIREBASE_PRIVATE_KEY=""   # One line, with \n escapes, in double quotes

    EXCHANGE_RATES_API_KEY="" # Server-only; never exposed to the browser
    ```

    The `NEXT_PUBLIC_FIREBASE_*` variables are no longer used and can be deleted.

3.  **Set up Firestore**

    Create a service account key in the Firebase console under **Project settings → Service accounts**. Then deploy the security rules and index from this repo with the [Firebase CLI](https://firebase.google.com/docs/cli):

    ```sh
    npx firebase-tools deploy --only firestore --project YOUR_PROJECT_ID
    ```

    The rules deny all direct client access, because the server uses the Admin SDK.

4.  **Run the development server**

    ```sh
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the development server          |
| `npm run build`     | Generate the Prisma client and build  |
| `npm run lint`      | Run ESLint                            |
| `npm run typecheck` | Run the TypeScript compiler           |
| `npm test`          | Run the unit tests (Node test runner) |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
