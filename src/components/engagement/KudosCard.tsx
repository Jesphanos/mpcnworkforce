import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Award, Sparkles, Send, ThumbsUp, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const kudosTypes = [
  { id: "teamwork", label: "Great Teamwork", icon: ThumbsUp, color: "bg-blue-500" },
  { id: "innovation", label: "Innovation", icon: Sparkles, color: "bg-purple-500" },
  { id: "dedication", label: "Dedication", icon: Zap, color: "bg-yellow-500" },
  { id: "achievement", label: "Achievement", icon: Trophy, color: "bg-green-500" },
  { id: "helpful", label: "Helpful", icon: Heart, color: "bg-red-500" },
  { id: "quality", label: "Quality Work", icon: Star, color: "bg-orange-500" },
];

interface Kudos {
  id: string;
  from: { name: string; avatar?: string };
  to: { name: string; avatar?: string };
  type: string;
  message: string;
  createdAt: Date;
}

// Mock data for demonstration
const mockKudos: Kudos[] = [
  {
    id: "1",
    from: { name: "Sarah Chen" },
    to: { name: "Mike Johnson" },
    type: "teamwork",
    message: "Amazing collaboration on the client project!",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    from: { name: "Alex Rivera" },
    to: { name: "Jordan Lee" },
    type: "innovation",
    message: "Your new workflow idea saved us hours!",
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: "3",
    from: { name: "Team Lead" },
    to: { name: "Emily Davis" },
    type: "achievement",
    message: "Congratulations on hitting your monthly target!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
];

interface KudosCardProps {
  compact?: boolean;
}

export function KudosCard({ compact = false }: KudosCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleSendKudos = () => {
    if (!selectedType || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a kudos type and write a message.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Kudos sent! 🎉",
      description: "Your appreciation has been shared with the team.",
    });

    setShowForm(false);
    setSelectedType(null);
    setMessage("");
    setRecipient("");
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getKudosIcon = (typeId: string) => {
    const type = kudosTypes.find(t => t.id === typeId);
    if (!type) return Heart;
    return type.icon;
  };

  const getKudosColor = (typeId: string) => {
    const type = kudosTypes.find(t => t.id === typeId);
    return type?.color || "bg-primary";
  };

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Team Kudos
            </CardTitle>
            {!compact && (
              <CardDescription>Recognize your teammates' great work</CardDescription>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "Give Kudos"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Kudos type selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Type of Kudos</label>
                <div className="flex flex-wrap gap-2">
                  {kudosTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={selectedType === type.id ? "default" : "outline"}
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setSelectedType(type.id)}
                      >
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium mb-2 block">Your Message</label>
                <Textarea
                  placeholder="What did they do that deserves recognition?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleSendKudos} className="w-full gap-2">
                <Send className="h-4 w-4" />
                Send Kudos
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ScrollArea className={compact ? "h-[200px]" : "h-[300px]"}>
                <div className="space-y-3 pr-4">
                  {mockKudos.map((kudos, index) => {
                    const Icon = getKudosIcon(kudos.type);
                    return (
                      <motion.div
                        key={kudos.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          getKudosColor(kudos.type)
                        )}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium">{kudos.from.name}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium">{kudos.to.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {kudos.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getTimeAgo(kudos.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
