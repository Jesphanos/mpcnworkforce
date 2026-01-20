import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MPCNLearnHome } from "@/components/learn/MPCNLearnHome";

export default function Learn() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">MPCN Learn</h1>
          <p className="text-muted-foreground">
            Building knowledge, character, and competence through structured learning
          </p>
        </div>
        <MPCNLearnHome />
      </div>
    </DashboardLayout>
  );
}
