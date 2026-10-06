import Link from "next/link";
import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 text-center">
      <Frown size={80} className="text-indigo-500 mb-6 animate-bounce" />
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4">404</h1>
      <p className="text-xl md:text-2xl mb-8 max-w-md">
        Oops! The page you&apos;re looking for doesn&apos;t exist. It might have
        been moved or deleted.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        Go Back Home
      </Link>
    </div>
  );
}
