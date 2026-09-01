import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPdfPath = path.resolve(__dirname, "../public/SwiftTab_Chanakya_Sales_Playbook.pdf");
const rootPdfPath = path.resolve(__dirname, "../../SwiftTab_Chanakya_Sales_Playbook.pdf");
const artifactDir = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\9b07d981-43c6-407d-aff2-9662148cb12a";
const artifactPdfPath = path.join(artifactDir, "SwiftTab_Chanakya_Sales_Playbook.pdf");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 40, bottom: 40, left: 40, right: 40 },
  info: {
    Title: "SwiftTab - The Chanakya Sales Strategy & Field Playbook",
    Author: "SwiftTab (justswifttab.com)",
    Subject: "Restaurant Walk-in Sales Guide"
  }
});

const writeStream = fs.createWriteStream(publicPdfPath);
doc.pipe(writeStream);

// Helper for section headers
function addSectionHeader(title, subtitle) {
  doc.moveDown(0.8);
  doc.rect(doc.x, doc.y, 515, 24).fill("#064E3B"); // Emerald dark
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(12).text(title, doc.x + 10, doc.y + 6);
  if (subtitle) {
    doc.fillColor("#4B5563").font("Helvetica-Oblique").fontSize(9).text(subtitle, doc.x, doc.y + 6);
  }
  doc.moveDown(0.6);
  doc.fillColor("#1F2937").font("Helvetica").fontSize(10);
}

function addSubHeader(title) {
  doc.moveDown(0.5);
  doc.fillColor("#047857").font("Helvetica-Bold").fontSize(11).text(title);
  doc.moveDown(0.2);
  doc.fillColor("#1F2937").font("Helvetica").fontSize(9.5);
}

function addCalloutBox(title, bodyText, bgColor = "#F0FDF4", borderColor = "#A7F3D0", textColor = "#065F46") {
  doc.moveDown(0.4);
  const startY = doc.y;
  doc.rect(doc.x, startY, 515, 60).fillAndStroke(bgColor, borderColor);
  doc.fillColor(textColor).font("Helvetica-Bold").fontSize(10).text(title, doc.x + 10, startY + 8);
  doc.fillColor("#374151").font("Helvetica").fontSize(9).text(bodyText, doc.x + 10, startY + 24, { width: 495 });
  doc.y = startY + 68;
}

// ------------------- PAGE 1: TITLE & STRATEGIC FOUNDATIONS -------------------

// Brand Header Banner
doc.rect(40, 40, 515, 50).fill("#0F172A"); // Slate 900
doc.fillColor("#34D399").font("Helvetica-Bold").fontSize(18).text("SWIFTTAB", 55, 50);
doc.fillColor("#F8FAFC").font("Helvetica-Bold").fontSize(11).text("THE CHANAKYA IN-PERSON SALES PLAYBOOK", 55, 70);
doc.fillColor("#94A3B8").font("Helvetica").fontSize(9).text("Direct Marketing & Walk-in Closing Guide | justswifttab.com", 300, 70, { align: "right" });

doc.y = 105;
doc.fillColor("#111827").font("Helvetica-Bold").fontSize(13).text("Core Philosophy: The 4 Royal Strategems (चतुर्विध नीति)", { underline: true });
doc.moveDown(0.4);
doc.font("Helvetica").fontSize(9.5).text(
  "In restaurant sales, owners dismiss generic salespeople within 5 seconds. To close premium monthly retainers (₹5,999 to ₹9,999/mo), position yourself as a strategic profit advisor using Chanakya's 4 Pillars:"
);

// 4 Pillars Grid
doc.moveDown(0.5);
const pillars = [
  { name: "1. SAMA (साम - Alliance & Peer Respect)", desc: "Compliment their craftsmanship. Talk as an equal growth partner, not a subordinate vendor begging for business." },
  { name: "2. DAMA (दाम - Financial Gain / Artha)", desc: "Show immediate, quantifiable arithmetic: +20% table spend via AI pairings, saving ₹1.2 Lakhs in aggregator commissions." },
  { name: "3. BHEDA (भेद - The Competitive Edge)", desc: "Make traditional laminated paper menus feel prehistoric compared to 3D gyro-tilt cards and real-time calorie tracking." },
  { name: "4. DANDA (दंड - Fear of Loss)", desc: "Highlight the permanent damage of 1-star Google reviews and revenue lost when customers walk away during unmanaged rushes." }
];

pillars.forEach(p => {
  doc.fillColor("#065F46").font("Helvetica-Bold").fontSize(9.5).text(p.name);
  doc.fillColor("#374151").font("Helvetica").fontSize(9).text(p.desc, { indent: 15 });
  doc.moveDown(0.3);
});

// Timing & Reconnaissance
addSectionHeader("PRE-VISIT PROTOCOL: TIMING & TARGETING");
doc.font("Helvetica").fontSize(9.5).text("• Golden Pitching Hours: 3:30 PM - 5:30 PM (Post-lunch lull). Never visit during rush (1:00-3:00 PM or 8:00-10:30 PM).");
doc.text("• Target Decision Maker: Managing Partner, Owner, or Executive GM. Ask politely: 'I have a 2-minute strategic briefing on table spend specifically for the owner.'");
doc.text("• Pre-flight Check: Phone charged to 100%, screen brightness max, URL justswifttab.com/demo open in browser tab.");

// ------------------- PAGE 2: THE 5-STEP PITCH SCRIPT -------------------
doc.addPage();

// Brand Mini Header
doc.rect(40, 40, 515, 20).fill("#0F172A");
doc.fillColor("#34D399").font("Helvetica-Bold").fontSize(9).text("SWIFTTAB FIELD SCRIPT", 50, 46);
doc.fillColor("#94A3B8").font("Helvetica").fontSize(8).text("CONFIDENTIAL - FIELD EXECUTION ONLY", 350, 46, { align: "right" });

doc.y = 70;
addSectionHeader("THE 5-STEP WALK-IN CONVERSATION FLOW");

addSubHeader("STEP 1: The 15-Second Disarming Hook (Sāma)");
doc.font("Helvetica-Oblique").fontSize(9).fillColor("#1F2937").text(
  `"Namaste Sir. My name is [Your Name]. I came specifically to your restaurant because your food quality and brand are top-tier in this locality.\n\nI am not here to sell you hardware or replace your POS billing. I came to show you how leading dining spots in Bangalore & Mumbai are generating 20% higher bill sizes per table without hiring extra staff or paying 25% commissions to Swiggy/Zomato.\n\nGive me exactly 60 seconds. If what I show you on this screen doesn't blow your mind, I will walk right out."`
);

addSubHeader("STEP 2: The 3D Interactive Demonstration (Hand over your phone)");
doc.font("Helvetica-Oblique").fontSize(9).fillColor("#1F2937").text(
  `"Sir, open menus in 99% of restaurants look like dry text on paper. Customers have to guess what the dish looks like.\n\nTilt my phone in your hand. Look at that dish card.\n(Owner tilts phone -> 3D parallax glides, specular glare shifts, steam pulses).\n\nWhen a guest scans your table QR:\n1. 3D Studio Photography: Mouthwatering magazine-quality visuals.\n2. Instant Calorie & Protein Macros: Fitness guests and gym-goers find high-protein dishes instantly with 1 tap.\n3. Smart Chef Pairing Upsells: When they tap 'Add', AI suggests: '84% of guests pair this with Garlic Naan & Cold Coffee'. With 1 tap, bill size jumps by ₹150 - ₹250 per table."`
);

addSubHeader("STEP 3: The Economic Arithmetic (Dāma & Arthashastra)");
doc.font("Helvetica-Oblique").fontSize(9).fillColor("#1F2937").text(
  `"Sir, let's do simple mathematics on a napkin:\n• You have 15-20 tables serving ~40 orders per day.\n• If our Smart AI Pairing adds just ₹100 extra per table, that is ₹4,000 extra revenue per day.\n• That is ₹1,20,000 in additional net revenue every month purely from automated upsells.\n• Plus, during peak hours, orders flash to the kitchen instantly. Table turnover is 30% faster — that's 6 to 8 extra tables turned on a Saturday night."`
);

addSubHeader("STEP 4: Google Review Shield & 1-Tap WhatsApp CRM (Bheda & Protection)");
doc.font("Helvetica-Oblique").fontSize(9).fillColor("#1F2937").text(
  `"Now Sir, what destroys a restaurant's footfall? A 1-star Google review. One bad review stays permanently and scares off 50 customers.\n\nSwiftTab includes a Google Review Shield:\n• 4 & 5 Stars -> Instantly redirects the guest to Google Maps to post their 5-star review.\n• 1 to 3 Stars -> Routes their private complaint directly to your WhatsApp. You fix the issue privately before a public negative review is ever posted.\n• WhatsApp Digital Receipts: Automatically collects real guest phone numbers for repeat VIP marketing."`
);

addSubHeader("STEP 5: The No-Risk Royal Close");
doc.font("Helvetica-Oblique").fontSize(9).fillColor("#1F2937").text(
  `"Sir, Chanakya taught that the best deal is where the upside is unlimited and the risk is zero. You don't need any new hardware. It runs on any phone or tablet in your kitchen.\n\nHand me your printed paper menu right now. Our AI will digitize your entire menu with 3D photos and macros in under 5 minutes. Try it live at 5 tables this weekend. If your table spend doesn't jump and guests aren't raving, you pay zero and cancel with 1 click.\n\nShall we scan your menu right now and get Table 1 live?"`
);

// ------------------- PAGE 3: OBJECTION HANDLING & CHECKLIST -------------------
doc.addPage();

// Brand Mini Header
doc.rect(40, 40, 515, 20).fill("#0F172A");
doc.fillColor("#34D399").font("Helvetica-Bold").fontSize(9).text("SWIFTTAB FIELD OBJECTION BATTLECARD", 50, 46);
doc.fillColor("#94A3B8").font("Helvetica").fontSize(8).text("CONFIDENTIAL", 450, 46, { align: "right" });

doc.y = 70;
addSectionHeader("CHANAKYA COUNTER-TACTICS FOR COMMON OBJECTIONS");

const objections = [
  {
    q: `Objection 1: "My customers prefer traditional paper menus."`,
    a: `Counter: "Sir, traditional menus don't show steam, appetizing photography, or health macros. When diners see 3D photos, their appetite and order impulse double. Keep your paper menus on the side for elderly guests — but give your 18-45 year old diners the 3D visual menu, and watch your weekend bill size surge by 20%."`
  },
  {
    q: `Objection 2: "I already use Petpooja / Posist / Zomato."`,
    a: `Counter: "Sir, SwiftTab is not a billing POS — it is a Dine-in Guest Experience & Revenue Engine. Zomato takes 25% commissions on deliveries. SwiftTab works seamlessly alongside your billing setup and charges 0% commission. 100% of your dine-in money goes straight into your bank via direct UPI."`
  },
  {
    q: `Objection 3: "₹5,999/month is too expensive for software."`,
    a: `Counter: "Sir, ₹5,999 is just ₹200 per day — less than the cost of one single plate of Paneer Tikka. If SwiftTab helps you upsell just two extra appetizers or beverages a day, the entire system is 100% free, and everything else is pure profit in your pocket."`
  },
  {
    q: `Objection 4: "What if my kitchen staff cannot handle technology?"`,
    a: `Counter: "Sir, if your cook can use WhatsApp, he can run SwiftTab. When an order arrives, a loud audio chime rings, and the table number and dish appear in giant letters. He taps one green button when it is ready. Zero training required."`
  }
];

objections.forEach(obj => {
  addSubHeader(obj.q);
  doc.font("Helvetica").fontSize(8.8).fillColor("#374151").text(obj.a, { indent: 10 });
  doc.moveDown(0.2);
});

addSectionHeader("PRE-ENTRY POCKET CHECKLIST");
doc.font("Helvetica").fontSize(9).fillColor("#1F2937").text("[  ] Phone charged (100%) and screen brightness set to maximum.");
doc.text("[  ] Demo menu loaded and verified on justswifttab.com/demo.");
doc.text("[  ] Visiting during the 3:30 PM - 5:30 PM window.");
doc.text("[  ] Target identified: Owner, Managing Partner, or Executive General Manager.");
doc.text("[  ] Phone placed in the owner's hand within the first 45 seconds.");
doc.text("[  ] Paper menu collected immediately for 60-second on-device scan.");

doc.moveDown(0.8);
doc.rect(40, doc.y, 515, 30).fill("#0F172A");
doc.fillColor("#F8FAFC").font("Helvetica-Bold").fontSize(9).text("SWIFTTAB - TURNING RESTAURANT TABLES INTO REVENUE ENGINES", 50, doc.y + 10, { align: "center" });

doc.end();

writeStream.on("finish", () => {
  // Also copy to root and artifact directory
  try {
    fs.copyFileSync(publicPdfPath, rootPdfPath);
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
    fs.copyFileSync(publicPdfPath, artifactPdfPath);
  } catch (e) {
    console.error("Copy error:", e);
  }
  console.log("PDF generated successfully at:", publicPdfPath);
});
