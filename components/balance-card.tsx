import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  /** e.g. "this Month" or "in September 2026" */
  periodLabel: string;
  today: string;
}

const BalanceCard = ({
  balance,
  income,
  expense,
  periodLabel,
  today,
}: BalanceCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      Current Balance
    </p>
    <p
      className={`text-3xl font-bold mt-1 ${balance < 0 ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-white"}`}
    >
      {formatMoney(balance)}
    </p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
      As of {formatDate(today)}
    </p>
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Stat
        label={`Income ${periodLabel}`}
        value={income}
        tone="green"
        icon={
          <ArrowUpRight
            className="text-green-600 dark:text-green-300"
            size={20}
          />
        }
      />
      <Stat
        label={`Expenses ${periodLabel}`}
        value={expense}
        tone="red"
        icon={
          <ArrowDownLeft className="text-red-600 dark:text-red-300" size={20} />
        }
      />
    </div>
  </div>
);

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "green" | "red";
  icon: React.ReactNode;
}) {
  const bg =
    tone === "green"
      ? "bg-green-50 dark:bg-green-900/50"
      : "bg-red-50 dark:bg-red-900/50";
  const iconBg =
    tone === "green"
      ? "bg-green-200 dark:bg-green-800"
      : "bg-red-200 dark:bg-red-800";
  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg ${bg}`}>
      <div className={`p-2 rounded-full ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-semibold text-gray-800 dark:text-white">
          {formatMoney(value)}
        </p>
      </div>
    </div>
  );
}

export default BalanceCard;
