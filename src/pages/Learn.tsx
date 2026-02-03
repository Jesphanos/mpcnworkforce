import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MPCNLearnHome } from "@/components/learn/MPCNLearnHome";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Learn() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 pb-6">
            <div>
              <h1 className="text-3xl font-bold">MPCN Learn</h1>
              <p className="text-muted-foreground">
                Building knowledge, character, and competence through structured learning
              </p>
            </div>
            <MPCNLearnHome />
          </div>
        </ScrollArea>
      </div>
    </DashboardLayout>
  );
}
