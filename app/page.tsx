// app/page.tsx
import { DollarSign, BarChart, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <a className="flex items-center justify-center" href="#">
          <DollarSign className="h-6 w-6 text-indigo-600" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">SpendSense</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:underline underline-offset-4 text-gray-600 dark:text-gray-300" href="#">
            Features
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4 text-gray-600 dark:text-gray-300" href="#">
            Pricing
          </a>
          <a className="text-sm font-medium hover:underline underline-offset-4 text-gray-600 dark:text-gray-300" href="#">
            About
          </a>
          <a href="/login" className="px-4 py-2 text-sm font-medium rounded-md text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800">
            Login
          </a>
          <a href="/dashboard" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Get Started
          </a>
        </nav>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center">
          <div className="container px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-gray-900 dark:text-white">
                Effortless Expense Tracking, Smarter Financial Future.
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Stop wondering where your money goes. SpendSense helps you take control of your finances with powerful, easy-to-use tools.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                <a
                  className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  href="/dashboard"
                >
                  Start Tracking for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900  flex flex-col items-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-indigo-100 px-3 py-1 text-sm text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900 dark:text-white">
                Everything You Need to Manage Your Money
              </h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                From intuitive tracking to insightful reports, our features are designed to give you a clear view of your financial life.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-12 py-12 lg:grid-cols-3">
              <div className="grid gap-2 text-center">
                <div className="flex justify-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                        <DollarSign className="h-6 w-6 text-indigo-600" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Easy Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Quickly add expenses and income from any device. Categorize transactions to see where your money goes.
                </p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="flex justify-center">
                     <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                        <BarChart className="h-6 w-6 text-indigo-600" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Visual Reports</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Understand your spending habits with clean, simple charts and graphs. Make informed decisions instantly.
                </p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="flex justify-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                        <ShieldCheck className="h-6 w-6 text-indigo-600" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bank-Level Security</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your financial data is serious business. We use top-tier encryption to keep your information safe and private.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">&copy; 2025 SpendSense. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  );
}
