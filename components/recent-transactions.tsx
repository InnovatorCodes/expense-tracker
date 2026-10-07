import type { Transaction } from "@/types/transaction";
import { TransactionRow } from "@/components/transaction-row";
import { EmptyState, Panel, PanelLink } from "@/components/panel";

const RecentTransactions = ({
  transactions,
}: {
  transactions: Transaction[];
}) => (
  <Panel
    title="Recent Transactions"
    action={<PanelLink href="/transactions">View all</PanelLink>}
  >
    {transactions.length === 0 ? (
      <EmptyState
        title="No transactions recorded yet."
        hint="Add one using the '+' button."
      />
    ) : (
      <ul className="-mx-3 divide-y divide-border/30">
        {transactions.map((t) => (
          <li key={t.id}>
            <TransactionRow transaction={t} />
          </li>
        ))}
      </ul>
    )}
  </Panel>
);

export default RecentTransactions;
