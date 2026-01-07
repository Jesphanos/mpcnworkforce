import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Eye, 
  TrendingUp, 
  Lock, 
  Scale, 
  Award,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { MPCN_PRINCIPLES } from "@/config/humaneTerminology";

const iconMap = {
  Shield,
  Eye,
  TrendingUp,
  Lock,
  Scale,
  Award,
} as const;

export function GovernanceCharter() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{MPCN_PRINCIPLES.title}</CardTitle>
          <CardDescription className="text-base italic">
            "{MPCN_PRINCIPLES.tagline}"
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Principles Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {MPCN_PRINCIPLES.principles.map((principle) => {
          const Icon = iconMap[principle.icon as keyof typeof iconMap] || Shield;
          return (
            <Card key={principle.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{principle.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Commitments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Our Commitments
          </CardTitle>
          <CardDescription>
            How we uphold these principles in daily operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MPCN_PRINCIPLES.commitments.map((commitment, index) => (
              <li key={index} className="flex items-start gap-3">
                <Badge 
                  variant="secondary" 
                  className="mt-0.5 h-5 w-5 p-0 flex items-center justify-center text-xs shrink-0"
                >
                  {index + 1}
                </Badge>
                <span className="text-sm text-foreground">{commitment}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground px-4">
        <p>
          This charter guides all governance decisions within MPCN.
          Questions or concerns can be raised through the Feedback system.
        </p>
      </div>
    </div>
  );
}
