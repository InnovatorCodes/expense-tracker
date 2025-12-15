import Link from "next/link";
import { DollarSign } from "lucide-react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <Link
        href="/"
        className="absolute top-0 left-0 ml-4 mt-4 flex items-center justify-center mr-auto"
      >
        <div className="bg-indigo-600 p-2 rounded-lg">
          <DollarSign className="text-white" size={28} />
        </div>
        <span className="ml-2 text-3xl font-bold text-gray-900 dark:text-white max-sm:text-xl">
          SpendSense
        </span>
      </Link>
      {children}
    </>
  );
}
