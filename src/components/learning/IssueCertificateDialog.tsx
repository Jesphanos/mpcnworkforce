import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAdminLearningData, UserLearningProgress } from "@/hooks/useAdminLearningData";
import { getCertificationPaths } from "@/hooks/useLearningProgress";

interface IssueCertificateDialogProps {
  user: UserLearningProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eligibleCertifications: ReturnType<typeof getCertificationPaths>;
  completedModules: string[];
}

export function IssueCertificateDialog({
  user,
  open,
  onOpenChange,
  eligibleCertifications,
  completedModules,
}: IssueCertificateDialogProps) {
  const { issueCertificate, certificationPaths } = useAdminLearningData();
  const [selectedCertType, setSelectedCertType] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!selectedCertType && !isCustom) return;
    if (isCustom && !customName.trim()) return;

    const certPath = certificationPaths.find(p => p.id === selectedCertType);
    
    await issueCertificate.mutateAsync({
      userId: user.user_id,
      certificateType: isCustom ? "custom" : selectedCertType,
      certificateName: isCustom ? customName : (certPath?.name || selectedCertType),
      modulesCompleted: isCustom ? completedModules : (certPath?.requiredModules || []),
    });

    onOpenChange(false);
    setSelectedCertType("");
    setCustomName("");
    setIsCustom(false);
  };

  const allPaths = certificationPaths;
  const eligibleIds = eligibleCertifications.map(e => e.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Issue Certificate
          </DialogTitle>
          <DialogDescription>
            Issue a certification to {user.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={isCustom ? "custom" : selectedCertType}
            onValueChange={(value) => {
              if (value === "custom") {
                setIsCustom(true);
                setSelectedCertType("");
              } else {
                setIsCustom(false);
                setSelectedCertType(value);
              }
            }}
          >
            {/* Standard Certification Paths */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Standard Certifications</Label>
              {allPaths.map((path) => {
                const isEligible = eligibleIds.includes(path.id);
                return (
                  <div
                    key={path.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      isEligible ? "border-green-500/30 bg-green-500/5" : "opacity-60"
                    }`}
                  >
                    <RadioGroupItem 
                      value={path.id} 
                      id={path.id}
                      disabled={!isEligible}
                    />
                    <Label htmlFor={path.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{path.name}</span>
                        {isEligible ? (
                          <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30">
                            <CheckCircle2 className="h-3 w-3" />
                            Eligible
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <AlertTriangle className="h-3 w-3" />
                            Not Eligible
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requires {path.requiredModules.length} modules
                      </p>
                    </Label>
                  </div>
                );
              })}
            </div>

            {/* Custom Certificate Option */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium">Custom Certificate</Label>
              <div className="flex items-center space-x-3 p-3 rounded-lg border mt-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="flex-1 cursor-pointer">
                  <span className="font-medium">Issue Custom Certificate</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manually issue a certificate with a custom name
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Custom Name Input */}
          {isCustom && (
            <div className="space-y-2">
              <Label htmlFor="customName">Certificate Name</Label>
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Special Recognition Award"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={(!selectedCertType && !isCustom) || (isCustom && !customName.trim()) || issueCertificate.isPending}
          >
            {issueCertificate.isPending ? "Issuing..." : "Issue Certificate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
