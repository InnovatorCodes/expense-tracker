import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import { Panel } from "@/components/panel";

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  /** e.g. "this month" or "in September 2026" */
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
  <Panel>
    <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
    <p
      className={`text-3xl font-bold mt-1 tabular-nums ${balance < 0 ? "text-destructive" : ""}`}
    >
      {formatMoney(balance)}
    </p>
    <p className="text-sm text-muted-foreground mt-1">
      As of {formatDate(today)}
    </p>
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Stat
        label={`Income ${periodLabel}`}
        value={income}
        tone="constructive"
        icon={<ArrowUpRight size={18} />}
      />
      <Stat
        label={`Expenses ${periodLabel}`}
        value={expense}
        tone="destructive"
        icon={<ArrowDownLeft size={18} />}
      />
    </div>
  </Panel>
);

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "constructive" | "destructive";
  icon: React.ReactNode;
}) {
  const styles =
    tone === "constructive"
      ? {
          box: "bg-constructive/10",
          chip: "bg-constructive/20 text-constructive",
        }
      : {
          box: "bg-destructive/10",
          chip: "bg-destructive/20 text-destructive",
        };
  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-lg ${styles.box}`}>
      <div className={`p-2 rounded-full ${styles.chip}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold tabular-nums">
          {formatMoney(value)}
        </p>
      </div>
    </div>
  );
}

export default BalanceCard;
