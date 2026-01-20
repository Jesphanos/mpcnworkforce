import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download, 
  BookOpen, 
  Heart,
  Coins,
  Scale,
  HandHeart,
  Sparkles,
} from "lucide-react";

interface WealthCompendiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const compendiumSections = [
  {
    id: "god-wealth",
    title: "God & Wealth",
    icon: Heart,
    color: "text-rose-500",
    description: "Understanding stewardship and divine ownership",
    scriptures: [
      {
        reference: "Psalm 24:1",
        text: "The earth is the Lord's, and everything in it, the world, and all who live in it.",
      },
      {
        reference: "Deuteronomy 8:18",
        text: "Remember the Lord your God, for it is He who gives you the ability to produce wealth.",
      },
      {
        reference: "Proverbs 3:9-10",
        text: "Honor the Lord with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing.",
      },
      {
        reference: "Matthew 6:19-21",
        text: "Do not store up for yourselves treasures on earth... But store up for yourselves treasures in heaven... For where your treasure is, there your heart will be also.",
      },
      {
        reference: "1 Timothy 6:17-19",
        text: "Command those who are rich in this present world not to be arrogant nor to put their hope in wealth, which is so uncertain, but to put their hope in God, who richly provides us with everything for our enjoyment.",
      },
    ],
  },
  {
    id: "work-diligence",
    title: "Work, Diligence & Excellence",
    icon: Sparkles,
    color: "text-amber-500",
    description: "Biblical work ethic and the pursuit of excellence",
    scriptures: [
      {
        reference: "Proverbs 10:4",
        text: "Lazy hands make for poverty, but diligent hands bring wealth.",
      },
      {
        reference: "Proverbs 12:11",
        text: "Those who work their land will have abundant food, but those who chase fantasies have no sense.",
      },
      {
        reference: "Proverbs 22:29",
        text: "Do you see someone skilled in their work? They will serve before kings; they will not serve before officials of low rank.",
      },
      {
        reference: "Colossians 3:23-24",
        text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters... It is the Lord Christ you are serving.",
      },
      {
        reference: "2 Thessalonians 3:10",
        text: "The one who is unwilling to work shall not eat.",
      },
    ],
  },
  {
    id: "worldly-principles",
    title: "Worldly Financial Principles",
    icon: Coins,
    color: "text-green-500",
    description: "Practical wisdom for financial stewardship",
    principles: [
      {
        title: "Risk Management",
        description: "Never invest more than you can afford to lose. Diversify to protect against catastrophic loss. Understand what you're investing in before committing capital.",
      },
      {
        title: "Compound Growth",
        description: "Time is the most powerful factor in wealth building. Small, consistent contributions grow exponentially. Patience outperforms speculation.",
      },
      {
        title: "Living Below Means",
        description: "Spend less than you earn. Build reserves before luxuries. Avoid debt for consumption.",
      },
      {
        title: "Continuous Learning",
        description: "Financial literacy is a lifelong pursuit. Markets change; knowledge must evolve. Seek counsel from those with proven wisdom.",
      },
      {
        title: "Accountability",
        description: "Track your finances diligently. Review and adjust regularly. Be honest about mistakes and learn from them.",
      },
    ],
  },
  {
    id: "integration",
    title: "Integration: Faith & Finance",
    icon: Scale,
    color: "text-purple-500",
    description: "Where Scripture aligns with financial wisdom",
    points: [
      {
        title: "Patience is Both Biblical and Practical",
        scripture: "Proverbs 21:5 - 'The plans of the diligent lead surely to abundance.'",
        application: "Long-term investment strategies align with biblical patience.",
      },
      {
        title: "Diversification is Ancient Wisdom",
        scripture: "Ecclesiastes 11:2 - 'Invest in seven ventures, yes, in eight.'",
        application: "Spreading risk across multiple investments is scripturally sound.",
      },
      {
        title: "Greed is Universally Destructive",
        scripture: "Proverbs 15:27 - 'The greedy bring ruin to their households.'",
        application: "Faith restrains greed that leads to poor financial decisions.",
      },
      {
        title: "Integrity Builds Trust",
        scripture: "Proverbs 11:1 - 'The Lord detests dishonest scales.'",
        application: "Ethical business practices create sustainable success.",
      },
    ],
  },
  {
    id: "assurance",
    title: "God's Assurance",
    icon: HandHeart,
    color: "text-blue-500",
    description: "Promises of provision, guidance, and purpose",
    promises: [
      {
        theme: "Provision",
        scripture: "Philippians 4:19",
        text: "And my God will meet all your needs according to the riches of His glory in Christ Jesus.",
      },
      {
        theme: "Guidance",
        scripture: "Proverbs 3:5-6",
        text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight.",
      },
      {
        theme: "Purpose",
        scripture: "Jeremiah 29:11",
        text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
      },
      {
        theme: "Peace",
        scripture: "Philippians 4:6-7",
        text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
      },
      {
        theme: "Humility in Success",
        scripture: "James 4:10",
        text: "Humble yourselves before the Lord, and He will lift you up.",
      },
    ],
  },
];

export function WealthCompendiumDialog({ open, onOpenChange }: WealthCompendiumDialogProps) {
  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    // For now, we show the content inline
    alert("PDF download feature coming soon. Content is available below.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-6 w-6 text-primary" />
                MPCN Wealth & Stewardship Compendium
              </DialogTitle>
              <DialogDescription className="mt-1">
                Biblical scriptures and financial principles for godly stewardship
              </DialogDescription>
            </div>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  This compendium combines biblical wisdom and practical financial principles to guide 
                  MPCN members in faithful stewardship. It is educational, not operational, and contains 
                  no internal MPCN workflows. Approved by the General Overseer for member development.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">Overseer Approved</Badge>
                  <Badge variant="outline">Educational Resource</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            {compendiumSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={section.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${section.color}`} />
                      <span>Section {index + 1}: {section.title}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </CardHeader>
                  <CardContent>
                    {section.scriptures && (
                      <div className="space-y-4">
                        {section.scriptures.map((scripture, i) => (
                          <div key={i} className="pl-4 border-l-2 border-rose-200 dark:border-rose-800">
                            <p className="font-medium text-rose-600 dark:text-rose-400 text-sm">
                              {scripture.reference}
                            </p>
                            <p className="italic text-foreground mt-1">"{scripture.text}"</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.principles && (
                      <div className="space-y-4">
                        {section.principles.map((principle, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/50">
                            <h4 className="font-medium text-foreground">{principle.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{principle.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.points && (
                      <div className="space-y-4">
                        {section.points.map((point, i) => (
                          <div key={i} className="p-3 rounded-lg border">
                            <h4 className="font-medium text-foreground">{point.title}</h4>
                            <p className="text-sm text-purple-600 dark:text-purple-400 italic mt-1">
                              {point.scripture}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">{point.application}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.promises && (
                      <div className="space-y-4">
                        {section.promises.map((promise, i) => (
                          <div key={i} className="pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                            <Badge variant="outline" className="mb-2">{promise.theme}</Badge>
                            <p className="font-medium text-blue-600 dark:text-blue-400 text-sm">
                              {promise.scripture}
                            </p>
                            <p className="italic text-foreground mt-1">"{promise.text}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Closing Note */}
            <Separator />
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground italic">
                "For the Lord gives wisdom; from His mouth come knowledge and understanding."
              </p>
              <p className="text-xs text-muted-foreground mt-1">— Proverbs 2:6</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
