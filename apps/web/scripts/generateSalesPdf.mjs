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
  margins: { top: 32, bottom: 32, left: 36, right: 36 },
  info: {
    Title: "SwiftTab - The Chanakya Sales Strategy & Field Playbook",
    Author: "SwiftTab (justswifttab.com)",
    Subject: "Restaurant Walk-in Sales Guide"
  }
});

const writeStream = fs.createWriteStream(publicPdfPath);
doc.pipe(writeStream);

const PAGE_WIDTH = 523;

function drawHeader(title, subtitle) {
  doc.rect(36, 32, PAGE_WIDTH, 42).fill("#0F172A");
  doc.fillColor("#34D399").font("Helvetica-Bold").fontSize(13).text("SWIFTTAB", 48, 40);
  doc.fillColor("#F8FAFC").font("Helvetica-Bold").fontSize(9.5).text(title, 48, 56);
  doc.fillColor("#94A3B8").font("Helvetica").fontSize(8).text(subtitle || "justswifttab.com | Field Playbook", 300, 48, { width: 245, align: "right" });
  doc.y = 86;
}

function drawSectionBanner(title) {
  doc.moveDown(0.35);
  const startY = doc.y;
  doc.rect(36, startY, PAGE_WIDTH, 18).fill("#064E3B");
  doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9).text(title, 46, startY + 4);
  doc.y = startY + 24;
}

function drawFooter(pageNumber) {
  const bottomY = 790;
  doc.rect(36, bottomY, PAGE_WIDTH, 18).fill("#0F172A");
  doc.fillColor("#94A3B8").font("Helvetica").fontSize(7.5).text("SwiftTab (justswifttab.com) - Next-Gen 3D QR Dining & Kitchen Intelligence", 46, bottomY + 5, { lineBreak: false });
  doc.fillColor("#34D399").font("Helvetica-Bold").fontSize(7.5).text(`Page ${pageNumber} of 3`, 440, bottomY + 5, { width: 105, align: "right", lineBreak: false });
}

// ==========================================
// PAGE 1: STRATEGIC FOUNDATIONS & TIMING
// ==========================================
drawHeader("THE CHANAKYA IN-PERSON SALES STRATEGY", "Direct Restaurant Walk-In Closing Guide");

doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(10.5).text("Core Philosophy: The 4 Royal Strategems (Chaturvidha Niti)");
doc.moveDown(0.2);
doc.fillColor("#334155").font("Helvetica").fontSize(8.5).text(
  "In restaurant sales, owners dismiss generic software vendors within 5 seconds. To close high-ticket subscriptions (Rs. 5,999 - Rs. 9,999/mo), position yourself as an elite strategic profit advisor using Chanakya's Four Royal Pillars:"
);

doc.moveDown(0.35);
const pillars = [
  {
    name: "1. SAMA (Alliance & Peer Respect):",
    desc: "Acknowledge their food quality and brand stature. Speak as a growth consultant, not a desperate vendor begging for software demo time."
  },
  {
    name: "2. DAMA (Tangible Financial Prosperity / Artha):",
    desc: "Present clear arithmetic: adding +20% to average table spend via smart AI pairings (+Rs. 1.2 Lakhs/mo) and saving 25% commission on deliveries."
  },
  {
    name: "3. BHEDA (The Decisive Competitive Edge):",
    desc: "Make traditional laminated paper menus feel obsolete compared to interactive 3D gyro-tilt cards and real-time calorie tracking."
  },
  {
    name: "4. DANDA (Fear of Loss & Inaction):",
    desc: "Remind them of the permanent cost of 1-star Google reviews and unmanaged rush-hour table walkouts that bleed revenue every weekend."
  }
];

pillars.forEach(p => {
  doc.fillColor("#065F46").font("Helvetica-Bold").fontSize(9).text(p.name);
  doc.fillColor("#334155").font("Helvetica").fontSize(8.3).text(p.desc, { indent: 12 });
  doc.moveDown(0.2);
});

drawSectionBanner("PRE-VISIT PROTOCOL: TIMING, TARGETING & ASSET PREP");

doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(8.5).text("1. The Golden Window (3:30 PM - 5:30 PM):");
doc.fillColor("#334155").font("Helvetica").fontSize(8).text(
  "Never pitch during lunch rush (1:00-3:00 PM) or dinner prep (8:00-10:30 PM). Visit strictly between 3:30 PM and 5:30 PM when the owner is relaxed and reviewing daily numbers.",
  { indent: 10 }
);
doc.moveDown(0.15);

doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(8.5).text("2. Gatekeeper Navigation (Reaching the Real Decision Maker):");
doc.fillColor("#334155").font("Helvetica").fontSize(8).text(
  "If a waiter or captain greets you, say with calm authority: 'Namaste bhaiya, I have a quick 2-minute strategic briefing on table turnover specifically for the owner or managing partner.'",
  { indent: 10 }
);
doc.moveDown(0.15);

doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(8.5).text("3. Phone Readiness Checklist:");
doc.fillColor("#334155").font("Helvetica").fontSize(8).text(
  "• Phone battery charged to 100% with screen brightness set to maximum.\n• Demo page (justswifttab.com/demo) already open and loaded in Chrome/Safari.\n• Clean phone screen (first impressions matter when handing your device to the owner).",
  { indent: 10 }
);

drawFooter(1);

// ==========================================
// PAGE 2: THE 5-STEP WALK-IN SCRIPT
// ==========================================
doc.addPage();
drawHeader("THE 5-STEP WALK-IN CONVERSATION FLOW", "Live In-Person Pitch Script");

drawSectionBanner("STEP 1: THE 15-SECOND DISARMING HOOK (SAMA)");
doc.fillColor("#1E293B").font("Helvetica-Oblique").fontSize(8.2).text(
  `"Namaste Sir. My name is [Your Name]. I came specifically to your restaurant because your food quality and brand are top-tier in this locality.\n\nI am not here to sell you hardware or replace your POS billing machine. I came to show you how top dining brands in Bangalore and Mumbai are generating 20% higher bill sizes per table without hiring extra staff or paying 25% commissions to Swiggy/Zomato.\n\nGive me exactly 60 seconds. If what I show you on this screen doesn't blow your mind, I will walk right out."`
);

drawSectionBanner("STEP 2: THE 3D VISUAL DEMONSTRATION (HAND OVER PHONE)");
doc.fillColor("#1E293B").font("Helvetica-Oblique").fontSize(8.2).text(
  `"Sir, open menus in 99% of restaurants look like dry text on paper. Customers have to guess what the dish looks like.\n\nTilt my phone in your hand. Look at that dish card. (Owner tilts phone -> 3D parallax glides, specular glare shifts, steam pulses).\n\nWhen a guest scans your table QR:\n1. 3D Studio Photography: Mouthwatering magazine-quality visuals that make dishes irresistible.\n2. Instant Calorie & Protein Macros: Fitness guests and gym-goers find high-protein dishes instantly with 1 tap.\n3. Smart Chef Pairing Upsells: When they tap 'Add', AI suggests: '84% of guests pair this with Garlic Naan & Cold Coffee'. With 1 tap, bill size jumps by Rs. 150 - Rs. 250 per table."`
);

drawSectionBanner("STEP 3: THE ECONOMIC ARITHMETIC (DAMA & ARTHASHASTRA)");
doc.fillColor("#1E293B").font("Helvetica-Oblique").fontSize(8.2).text(
  `"Sir, let's do simple mathematics on a napkin:\n• You have 15-20 tables serving ~40 orders per day.\n• If our Smart AI Pairing adds just Rs. 100 extra per table, that is Rs. 4,000 extra revenue per day.\n• That is Rs. 1,20,000 in additional net revenue every month purely from automated upsells.\n• Plus, during peak hours, orders flash to the kitchen instantly. Table turnover is 30% faster — that's 6 to 8 extra tables turned on a Saturday night."`
);

drawSectionBanner("STEP 4: GOOGLE REVIEW SHIELD & 1-TAP WHATSAPP CRM");
doc.fillColor("#1E293B").font("Helvetica-Oblique").fontSize(8.2).text(
  `"Now Sir, what destroys a restaurant's footfall? A 1-star Google review. One bad review stays permanently and scares off 50 customers.\n\nSwiftTab includes a Google Review Shield:\n• 4 & 5 Stars -> Instantly redirects the guest to Google Maps to post their 5-star review.\n• 1 to 3 Stars -> Routes their private complaint directly to your WhatsApp. You fix the issue privately before a public negative review is ever posted.\n• WhatsApp Digital Receipts: Automatically collects real guest phone numbers for repeat VIP marketing."`
);

drawSectionBanner("STEP 5: THE NO-RISK ROYAL CLOSE");
doc.fillColor("#1E293B").font("Helvetica-Oblique").fontSize(8.2).text(
  `"Sir, Chanakya taught that the best deal is where the upside is unlimited and the risk is zero. You don't need any new hardware. It runs on any phone or tablet in your kitchen.\n\nHand me your printed paper menu right now. Our AI will digitize your entire menu with 3D photos and macros in under 5 minutes. Try it live at 5 tables this weekend. If your table spend doesn't jump and guests aren't raving, you pay zero and cancel with 1 click.\n\nShall we scan your menu right now and get Table 1 live?"`
);

drawFooter(2);

// ==========================================
// PAGE 3: OBJECTION BATTLECARD & CHECKLIST
// ==========================================
doc.addPage();
drawHeader("OBJECTION BATTLECARD & PRE-ENTRY CHECKLIST", "Chanakya Counter-Tactics & Field Checklist");

drawSectionBanner("CHANAKYA COUNTER-TACTICS FOR COMMON OBJECTIONS");

const objections = [
  {
    q: "Objection 1: 'My customers prefer traditional physical paper menus.'",
    a: "Counter: 'Sir, traditional menus don't show steam, appetizing photography, or health macros. When diners see 3D photos, their appetite and order impulse double. Keep your paper menus on the side for elderly guests — but give your 18-45 year old diners the 3D visual menu, and watch your weekend bill size surge by 20%.'"
  },
  {
    q: "Objection 2: 'I already use Petpooja / Posist / Zomato / Swiggy.'",
    a: "Counter: 'Sir, SwiftTab is not a billing POS — it is a Dine-in Guest Experience & Revenue Engine. Zomato takes 25% commissions on deliveries. SwiftTab works seamlessly alongside your billing setup and charges 0% commission. 100% of your dine-in money goes straight into your bank via direct UPI.'"
  },
  {
    q: "Objection 3: 'Rs. 5,999/month is too expensive for software.'",
    a: "Counter: 'Sir, Rs. 5,999 is just Rs. 200 per day — less than the cost of one single plate of Paneer Tikka. If SwiftTab helps you upsell just two extra appetizers or beverages a day, the entire system is 100% free, and everything else is pure profit in your pocket.'"
  },
  {
    q: "Objection 4: 'What if my kitchen cooks cannot handle technology?'",
    a: "Counter: 'Sir, if your cook can use WhatsApp, he can run SwiftTab. When an order arrives, a loud audio chime rings, and the table number and dish appear in giant letters. He taps one green button when it is ready. Zero training required.'"
  }
];

objections.forEach(obj => {
  doc.fillColor("#065F46").font("Helvetica-Bold").fontSize(8.2).text(obj.q);
  doc.fillColor("#334155").font("Helvetica").fontSize(7.8).text(obj.a, { indent: 8 });
  doc.moveDown(0.18);
});

drawSectionBanner("PRE-ENTRY POCKET FIELD CHECKLIST");

const checklist = [
  "[  ] Phone battery at 100% with screen brightness at MAXIMUM.",
  "[  ] Demo page (justswifttab.com/demo) verified & tested on mobile browser.",
  "[  ] Visiting between 3:30 PM - 5:30 PM (No active rush in the kitchen).",
  "[  ] Decision maker verified: Owner, Managing Partner, or Executive GM.",
  "[  ] Phone placed directly in the owner's hand within the first 45 seconds.",
  "[  ] Paper menu collected on the spot for instant 60-second AI digitization.",
  "[  ] 3-Day Risk-Free Live Trial offered with zero lock-in."
];

checklist.forEach(item => {
  doc.fillColor("#0F172A").font("Helvetica").fontSize(8).text(item);
  doc.moveDown(0.08);
});

doc.moveDown(0.3);
doc.rect(36, doc.y, PAGE_WIDTH, 22).fill("#064E3B");
doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8.5).text(
  "CONFIDENTIAL FIELD GUIDE - SWIFTTAB (justswifttab.com)",
  48,
  doc.y + 6,
  { align: "center", width: PAGE_WIDTH - 24, lineBreak: false }
);

drawFooter(3);

doc.end();

writeStream.on("finish", () => {
  try {
    fs.copyFileSync(publicPdfPath, rootPdfPath);
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
    fs.copyFileSync(publicPdfPath, artifactPdfPath);
  } catch (e) {
    console.error("Copy error:", e);
  }
  console.log("Clean 3-Page PDF generated successfully at:", publicPdfPath);
});
