import { Pin } from "lucide-react";
import type { BudgetWithUsage } from "@/types/budget";
import { BudgetProgress } from "@/components/budget-progress";
import { EmptyState, Panel, PanelLink } from "@/components/panel";

const DashboardBudget = ({
  budget,
  daysLeft,
}: {
  budget: BudgetWithUsage | null;
  daysLeft?: number;
}) => (
  <Panel
    title="Pinned Budget"
    action={<PanelLink href="/budgets">Manage</PanelLink>}
  >
    {budget ? (
      <BudgetProgress budget={budget} daysLeft={daysLeft} />
    ) : (
      <EmptyState
        icon={<Pin className="h-8 w-8 mb-3" />}
        title="No budget pinned yet."
        hint="Pin one from the Budgets page to track it here."
      />
    )}
  </Panel>
);

export default DashboardBudget;
