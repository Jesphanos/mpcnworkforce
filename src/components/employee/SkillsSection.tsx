import { useState, useEffect } from "react";
import { Award, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const predefinedSkills = [
  "Writing",
  "Editing",
  "Data Entry",
  "Virtual Assistant",
  "Graphic Design",
  "Web Development",
  "Customer Service",
  "Social Media",
  "Translation",
  "Transcription",
  "Video Editing",
  "SEO",
  "Research",
  "Bookkeeping",
  "Project Management",
];

interface SkillsSectionProps {
  editable?: boolean;
}

export function SkillsSection({ editable = false }: SkillsSectionProps) {
  const { user, profile } = useAuth();
  const [skills, setSkills] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills as string[]);
      setSelectedSkills(profile.skills as string[]);
    }
  }, [profile]);

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (newSkill.trim() && !selectedSkills.includes(newSkill.trim())) {
      setSelectedSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ skills: selectedSkills })
      .eq("id", user.id);

    setIsSaving(false);

    if (error) {
      toast.error("Failed to update skills");
    } else {
      setSkills(selectedSkills);
      toast.success("Skills updated successfully");
      setIsOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-5 w-5" />
            Skills & Expertise
          </CardTitle>
          <CardDescription>Your professional capabilities</CardDescription>
        </div>
        {editable && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Edit Skills
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Skills</DialogTitle>
                <DialogDescription>
                  Select from predefined skills or add custom ones
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Predefined Skills */}
                <div className="flex flex-wrap gap-2">
                  {predefinedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => handleToggleSkill(skill)}
                    >
                      {skill}
                      {selectedSkills.includes(skill) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>

                {/* Custom Skill Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCustomSkill()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddCustomSkill}
                    disabled={!newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Custom Skills */}
                {selectedSkills
                  .filter((s) => !predefinedSkills.includes(s))
                  .map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleToggleSkill(skill)}
                    >
                      {skill}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Skills"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No skills added yet</p>
        )}
      </CardContent>
    </Card>
  );
}
