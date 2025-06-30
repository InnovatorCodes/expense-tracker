"use client"; // This component uses client-side interactivity
import { redirect } from "next/navigation";
import { Frown } from "lucide-react"; // Icon for the not-found page

const Button = ({
  children,
  onClick,
  className = "",
  type = "button",
  variant = "default",
  size = "md",
}) => {
  let baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  let variantStyles = "";
  let sizeStyles = "";

  switch (variant) {
    case "ghost":
      variantStyles =
        "bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
      break;
    case "default":
    default:
      variantStyles =
        "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800";
      break;
  }

  switch (size) {
    case "icon":
      sizeStyles = "h-10 w-10 p-0";
      break;
    case "md":
    default:
      sizeStyles = "h-10 px-4 py-2";
      break;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
    >
      {children}
    </button>
  );
};

const NotFound = () => {
  const handleGoHome = () => {
    redirect("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 text-center">
      <Frown size={80} className="text-indigo-500 mb-6 animate-bounce" />{" "}
      {/* Icon with a subtle bounce animation */}
      <h1 className="text-5xl md:text-7xl font-extrabold mb-4">404</h1>
      <p className="text-xl md:text-2xl mb-8 max-w-md">
        Oops! The page you{"'"}re looking for doesn{"'"}t exist. It might have
        been moved or deleted.
      </p>
      <Button
        onClick={handleGoHome}
        className="px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Go Back Home
      </Button>
      {/* Tailwind CSS setup for animation */}
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
