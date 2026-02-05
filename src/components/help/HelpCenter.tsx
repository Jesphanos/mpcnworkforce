import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, Search, Book, MessageCircle, Video, ChevronRight,
  FileText, Users, TrendingUp, Shield, CreditCard, Settings, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: "Getting Started",
    question: "How do I submit my first work report?",
    answer: "Navigate to Reports from the sidebar. Select 'Submit Report' and provide your work details including platform, hours, task description, and relevant documentation. Your report enters the review workflow for approval."
  },
  {
    category: "Getting Started",
    question: "How do I update my profile?",
    answer: "Access your Profile via the sidebar. From there you can edit your details, add skills, set your timezone, and link external accounts."
  },
  {
    category: "Reports",
    question: "What happens after I submit a report?",
    answer: "Your report enters the multi-stage review workflow. Team leads review first, followed by admin review where applicable. You receive notifications at each status change."
  },
  {
    category: "Reports",
    question: "Can I modify a submitted report?",
    answer: "Reports in 'pending' status can be edited. Once reviewed, contact your team lead for any necessary changes."
  },
  {
    category: "Reports",
    question: "What does 'Needs Revision' mean?",
    answer: "This indicates your submission requires adjustments based on reviewer feedback. Review the comments, make the necessary changes, and resubmit. Revisions are a normal part of quality assurance."
  },
  {
    category: "Teams",
    question: "How do I view my team?",
    answer: "Team visibility is available through the Team section if you have appropriate access. Your team lead manages team composition."
  },
  {
    category: "Payments",
    question: "How are earnings calculated?",
    answer: "Earnings are calculated from approved work reports based on platform rates, performance factors, and applicable adjustments. The Finance team processes payments according to defined salary periods."
  },
  {
    category: "Payments",
    question: "When are payments processed?",
    answer: "Payments are processed at the close of each salary period. Final earnings are calculated based on approved reports within that period."
  },
  {
    category: "Security",
    question: "How do I enable two-factor authentication?",
    answer: "Navigate to Profile → Security. You can configure 2FA using an authenticator app or SMS verification."
  },
  {
    category: "Governance",
    question: "What is the Governance Charter?",
    answer: "The Governance Charter defines MPCN's operational principles including accountability, transparency, and decision-making standards. It's accessible via Settings."
  },
  {
    category: "Investments",
    question: "How do I become an investor?",
    answer: "Eligible members will see an investor onboarding option in their profile. Complete the verification process to understand terms and establish your investor profile."
  },
  {
    category: "Learning",
    question: "How does MPCN Learn work?",
    answer: "MPCN Learn provides structured educational modules covering foundations, organizational context, and role-specific training. Progress is tracked and contributes to your development record."
  },
];

const helpCategories = [
  { name: "Getting Started", icon: Book, color: "text-primary" },
  { name: "Reports", icon: FileText, color: "text-primary" },
  { name: "Teams", icon: Users, color: "text-primary" },
  { name: "Payments", icon: CreditCard, color: "text-primary" },
  { name: "Security", icon: Shield, color: "text-primary" },
  { name: "Governance", icon: Shield, color: "text-primary" },
  { name: "Investments", icon: TrendingUp, color: "text-primary" },
  { name: "Learning", icon: Book, color: "text-primary" },
];

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQs = faqItems.filter((item) => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedFAQs = filteredFAQs.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Help & Documentation
          </SheetTitle>
          <SheetDescription>
            Answers to common questions about MPCN operations
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {helpCategories.map((category) => (
              <Badge
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )}
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* FAQ List */}
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pr-4">
              {Object.entries(groupedFAQs).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {category}
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {items.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`${category}-${index}`}
                        className="border rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-sm text-left hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No matching questions found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="pt-4 border-t space-y-2">
            <p className="text-xs text-muted-foreground">Need more help?</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Support
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <Video className="h-4 w-4" />
                Video Guides
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Contextual help tooltip for specific features
interface ContextualHelpProps {
  title: string;
  content: string;
  className?: string;
}

export function ContextualHelp({ title, content, className }: ContextualHelpProps) {
  return (
    <div className={cn("group relative inline-block", className)}>
      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-popover border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <p className="font-medium text-sm mb-1">{title}</p>
        <p className="text-xs text-muted-foreground">{content}</p>
      </div>
    </div>
  );
}
