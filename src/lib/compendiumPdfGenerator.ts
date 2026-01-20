import jsPDF from "jspdf";

interface CompendiumSection {
  title: string;
  content: string[];
  scriptures?: { reference: string; text: string }[];
}

const compendiumSections: CompendiumSection[] = [
  {
    title: "SECTION I — GOD & WEALTH",
    content: [
      "God as Owner, Humans as Stewards",
      "The earth is the Lord's, and everything in it belongs to Him. We are not owners but stewards of what God has entrusted to us. This foundational truth shapes how we view money, possessions, and resources.",
      "",
      "Wealth as Responsibility",
      "Wealth is not inherently evil, nor is poverty inherently virtuous. What matters is how we acquire, manage, and use what we have been given. The Lord Jesus Christ taught us that 'to whom much is given, much is required.'",
      "",
      "Key Principles:",
      "• Everything belongs to God (Psalm 24:1)",
      "• We are accountable for what we manage (Matthew 25:14-30)",
      "• Generosity reflects God's heart (2 Corinthians 9:7)",
      "• Contentment is godly gain (1 Timothy 6:6)",
    ],
    scriptures: [
      { reference: "Proverbs 3:9-10", text: "Honor the LORD with your wealth, with the firstfruits of all your crops; then your barns will be filled to overflowing, and your vats will brim over with new wine." },
      { reference: "Matthew 25:21", text: "His master replied, 'Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things.'" },
      { reference: "Deuteronomy 8:18", text: "But remember the LORD your God, for it is he who gives you the ability to produce wealth." },
      { reference: "Psalm 24:1", text: "The earth is the LORD's, and everything in it, the world, and all who live in it." },
    ],
  },
  {
    title: "SECTION II — WORK, DILIGENCE & EXCELLENCE",
    content: [
      "Biblical Work Ethic",
      "Work is not a curse but a calling. God worked in creation and rested, establishing a pattern for humanity. Through our work, we participate in God's ongoing creative and sustaining activity in the world.",
      "",
      "The Lord Jesus Christ Himself worked as a carpenter, demonstrating the dignity of labor. The Apostle Paul encouraged believers to work diligently, 'as working for the Lord, not for human masters.'",
      "",
      "Discipline and Patience",
      "Success in any field requires consistent effort over time. The Bible repeatedly commends the diligent and warns against laziness. Quick riches are often fleeting, but steady work builds lasting wealth.",
      "",
      "Key Principles:",
      "• Diligent hands bring wealth (Proverbs 10:4)",
      "• Lazy hands make for poverty (Proverbs 6:9-11)",
      "• Work as unto the Lord (Colossians 3:23)",
      "• Excellence honors God (Daniel 6:3)",
    ],
    scriptures: [
      { reference: "Proverbs 10:4", text: "Lazy hands make for poverty, but diligent hands bring wealth." },
      { reference: "Colossians 3:23-24", text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters, since you know that you will receive an inheritance from the Lord as a reward." },
      { reference: "Proverbs 13:11", text: "Dishonest money dwindles away, but whoever gathers money little by little makes it grow." },
    ],
  },
  {
    title: "SECTION III — WORLDLY FINANCIAL PRINCIPLES",
    content: [
      "Risk Management",
      "Understanding and managing risk is essential for financial stewardship. Not all risks are equal—some are prudent, others are reckless. The wise person considers potential outcomes before committing resources.",
      "",
      "Diversification",
      "The ancient wisdom of 'not putting all eggs in one basket' aligns with biblical teaching. Ecclesiastes advises investing in multiple ventures because we cannot know what disaster may come.",
      "",
      "Compounding",
      "Time is one of the most powerful forces in wealth building. Small amounts invested wisely and consistently grow exponentially over time. This principle rewards patience and punishes procrastination.",
      "",
      "Accountability",
      "Financial decisions should be made with counsel and oversight. 'Plans fail for lack of counsel, but with many advisers they succeed.' Transparency and accountability protect against both error and temptation.",
      "",
      "Key Principles:",
      "• Diversify investments (Ecclesiastes 11:2)",
      "• Seek wise counsel (Proverbs 15:22)",
      "• Avoid excessive debt (Proverbs 22:7)",
      "• Plan for the future (Proverbs 21:5)",
      "• Be generous (Proverbs 11:25)",
    ],
    scriptures: [
      { reference: "Ecclesiastes 11:2", text: "Invest in seven ventures, yes, in eight; you do not know what disaster may come upon the land." },
      { reference: "Proverbs 15:22", text: "Plans fail for lack of counsel, but with many advisers they succeed." },
      { reference: "Proverbs 22:7", text: "The rich rule over the poor, and the borrower is slave to the lender." },
    ],
  },
  {
    title: "SECTION IV — INTEGRATION: FAITH & FINANCE",
    content: [
      "Where Scripture Aligns with Finance",
      "Many sound financial principles echo biblical wisdom. Diversification, patience, diligence, and integrity are praised in both realms. This alignment is not coincidental—God's wisdom applies universally.",
      "",
      "Where Faith Restrains Greed",
      "The pursuit of wealth without moral constraints leads to destruction. Faith provides guardrails: contentment over covetousness, generosity over hoarding, service over exploitation.",
      "",
      "The Lord Jesus Christ warned, 'Watch out! Be on your guard against all kinds of greed; life does not consist in an abundance of possessions.' This warning remains vital today.",
      "",
      "Trust + Discipline",
      "Faith does not eliminate the need for discipline, nor does discipline replace the need for faith. Both work together—we trust God while acting wisely; we work diligently while depending on His blessing.",
      "",
      "Key Integration Points:",
      "• Wealth is a tool, not a goal",
      "• Generosity is investment in eternity",
      "• Integrity protects long-term success",
      "• Contentment enables risk wisdom",
    ],
    scriptures: [
      { reference: "Luke 12:15", text: "Watch out! Be on your guard against all kinds of greed; life does not consist in an abundance of possessions." },
      { reference: "1 Timothy 6:17-19", text: "Command those who are rich in this present world not to be arrogant nor to put their hope in wealth, which is so uncertain, but to put their hope in God, who richly provides us with everything for our enjoyment." },
      { reference: "Matthew 6:24", text: "No one can serve two masters. Either you will hate the one and love the other, or you will be devoted to the one and despise the other. You cannot serve both God and money." },
    ],
  },
  {
    title: "SECTION V — GOD'S ASSURANCE & PROVISION",
    content: [
      "Provision",
      "God promises to provide for His children. This does not mean unlimited wealth, but sufficient provision for our needs. The Lord Jesus Christ taught us to pray, 'Give us today our daily bread,' trusting our Father for each day's needs.",
      "",
      "Guidance",
      "God offers wisdom to those who seek it. 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' Financial decisions made in prayer and according to biblical principles carry divine wisdom.",
      "",
      "Purpose",
      "Our wealth and work have eternal significance. We are building not just portfolios but legacies; not just profits but people. Every financial decision is an opportunity to glorify God and serve others.",
      "",
      "Humility in Success",
      "When prosperity comes, humility is essential. Success can lead to pride—the belief that 'my power and the strength of my hands have produced this wealth.' True success is recognized as God's blessing, not personal achievement alone.",
      "",
      "God's Promises:",
      "• He will never leave nor forsake us (Hebrews 13:5)",
      "• He knows our needs (Matthew 6:32)",
      "• His plans are for our welfare (Jeremiah 29:11)",
      "• His grace is sufficient (2 Corinthians 12:9)",
    ],
    scriptures: [
      { reference: "Philippians 4:19", text: "And my God will meet all your needs according to the riches of his glory in Christ Jesus." },
      { reference: "James 1:5", text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you." },
      { reference: "Jeremiah 29:11", text: "'For I know the plans I have for you,' declares the LORD, 'plans to prosper you and not to harm you, plans to give you hope and a future.'" },
      { reference: "Matthew 6:33", text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well." },
    ],
  },
];

export function generateCompendiumPdf(): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const addNewPageIfNeeded = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Title Page
  doc.setFillColor(30, 64, 175); // Primary blue
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("MPCN", pageWidth / 2, 60, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("Wealth & Stewardship", pageWidth / 2, 75, { align: "center" });
  doc.text("Compendium", pageWidth / 2, 85, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.text("Combining Biblical Wisdom with", pageWidth / 2, 110, { align: "center" });
  doc.text("Sound Financial Principles", pageWidth / 2, 120, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("\"The earth is the LORD's, and everything in it,", pageWidth / 2, 160, { align: "center" });
  doc.text("the world, and all who live in it.\"", pageWidth / 2, 170, { align: "center" });
  doc.setFont("helvetica", "italic");
  doc.text("— Psalm 24:1", pageWidth / 2, 180, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.text("MPCN Learn", pageWidth / 2, pageHeight - 40, { align: "center" });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 30, { align: "center" });

  // Content Pages
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  yPos = margin;

  // Table of Contents
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Table of Contents", margin, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  compendiumSections.forEach((section, index) => {
    doc.text(`${index + 1}. ${section.title}`, margin + 5, yPos);
    yPos += 8;
  });

  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  const disclaimer = doc.splitTextToSize(
    "This compendium is provided for educational purposes within the MPCN Learn system. It combines scriptural teaching with financial principles but does not constitute financial advice. Faith-based content is presented for reflection and voluntary engagement.",
    contentWidth
  );
  doc.text(disclaimer, margin, yPos);

  // Main Content
  compendiumSections.forEach((section) => {
    doc.addPage();
    yPos = margin;

    // Section Title
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 35, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, 25);
    
    doc.setTextColor(0, 0, 0);
    yPos = 50;

    // Section Content
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    section.content.forEach((paragraph) => {
      if (paragraph === "") {
        yPos += 5;
        return;
      }

      // Check if it's a heading (doesn't start with •)
      if (!paragraph.startsWith("•") && !paragraph.startsWith("Key")) {
        const words = paragraph.split(" ");
        const lowercaseCount = (paragraph.match(/[a-z]/g) || []).length;
        if (words.length <= 5 && lowercaseCount < paragraph.length / 2) {
          // Short text, likely a subheading
          addNewPageIfNeeded(15);
          doc.setFont("helvetica", "bold");
          doc.text(paragraph, margin, yPos);
          doc.setFont("helvetica", "normal");
          yPos += 8;
          return;
        }
      }

      const lines = doc.splitTextToSize(paragraph, contentWidth);
      const lineHeight = 5;
      const blockHeight = lines.length * lineHeight;

      addNewPageIfNeeded(blockHeight + 5);
      doc.text(lines, margin, yPos);
      yPos += blockHeight + 3;
    });

    // Scriptures
    if (section.scriptures && section.scriptures.length > 0) {
      yPos += 10;
      addNewPageIfNeeded(20);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Scripture References", margin, yPos);
      yPos += 10;

      doc.setFontSize(9);
      section.scriptures.forEach((scripture) => {
        const refLines = doc.splitTextToSize(`"${scripture.text}"`, contentWidth - 10);
        const blockHeight = refLines.length * 4.5 + 10;

        addNewPageIfNeeded(blockHeight);

        // Scripture box
        doc.setFillColor(245, 245, 250);
        doc.rect(margin, yPos - 3, contentWidth, blockHeight, "F");

        doc.setFont("helvetica", "bold");
        doc.text(scripture.reference, margin + 5, yPos + 3);
        
        doc.setFont("helvetica", "italic");
        doc.text(refLines, margin + 5, yPos + 10);

        yPos += blockHeight + 5;
      });
    }
  });

  // Final Page - Prayer of Dedication
  doc.addPage();
  yPos = 50;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("A Prayer of Stewardship", pageWidth / 2, yPos, { align: "center" });
  yPos += 20;

  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  const prayer = [
    "Lord God, Creator of heaven and earth,",
    "We acknowledge that everything belongs to You.",
    "All that we have comes from Your hand.",
    "",
    "Grant us wisdom to manage what You have entrusted to us.",
    "Give us diligence in our work and contentment in our hearts.",
    "Protect us from greed and guard us from fear.",
    "",
    "Through the Lord Jesus Christ,",
    "May our stewardship bring glory to Your name",
    "And blessing to those around us.",
    "",
    "Amen."
  ];

  prayer.forEach((line) => {
    doc.text(line, pageWidth / 2, yPos, { align: "center" });
    yPos += line === "" ? 5 : 8;
  });

  yPos += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("MPCN Learn • Wealth & Stewardship Compendium", pageWidth / 2, yPos, { align: "center" });
  doc.text("For educational use within MPCN only", pageWidth / 2, yPos + 8, { align: "center" });

  // Save the PDF
  doc.save("MPCN-Wealth-Stewardship-Compendium.pdf");
}
