import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.invoiceItem.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.gearAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.project.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.client.deleteMany();

  // --- CLIENTS ---
  const client1 = await prisma.client.create({
    data: {
      name: "אורן כהן",
      email: "oren@example.com",
      phone: "050-1234567",
      company: "כהן מדיה",
      instagram: "@orencohen",
      type: "client",
      leadSource: "referral",
      leadStatus: "won",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "נועה לוי",
      email: "noa@example.com",
      phone: "052-9876543",
      company: "סטודיו נועה",
      youtube: "@noalevi",
      type: "client",
      leadSource: "linkedin",
      leadStatus: "won",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: "יוסי דוד",
      email: "yossi@startup.co.il",
      phone: "054-5551234",
      company: "StartupTLV",
      linkedin: "yossidavid",
      type: "lead",
      leadSource: "organic",
      leadStatus: "qualified",
    },
  });

  const client4 = await prisma.client.create({
    data: {
      name: "מיכל אברהם",
      email: "michal@brand.co.il",
      phone: "053-7778899",
      company: "BrandUp",
      instagram: "@brandupil",
      type: "lead",
      leadSource: "social",
      leadStatus: "contacted",
    },
  });

  const client5 = await prisma.client.create({
    data: {
      name: "דני שרון",
      email: "danny@music.co.il",
      phone: "050-3334455",
      type: "client",
      leadSource: "referral",
      leadStatus: "won",
    },
  });

  // --- INTERACTIONS ---
  await prisma.interaction.createMany({
    data: [
      { clientId: client1.id, type: "meeting", summary: "פגישת תדרוך לפרויקט קליפ חדש" },
      { clientId: client1.id, type: "email", summary: "שליחת הצעת מחיר מעודכנת" },
      { clientId: client2.id, type: "call", summary: "שיחה על לו״ז צילומים לסדרת YouTube" },
      { clientId: client3.id, type: "meeting", summary: "פגישת היכרות ראשונית — סרטון תדמית לסטארטאפ" },
      { clientId: client4.id, type: "email", summary: "שליחת פורטפוליו ודוגמאות עבודה" },
      { clientId: client5.id, type: "call", summary: "תיאום מועד צילום קליפ" },
    ],
  });

  // --- PROJECTS ---
  const proj1 = await prisma.project.create({
    data: {
      title: "קליפ — ״כוכבים״ — אורן כהן",
      description: "קליפ מוזיקלי בסגנון סינמטי, צילום חוצות בתל אביב",
      clientId: client1.id,
      phase: "production",
      status: "scheduled",
      projectType: "music_video",
      budget: 25000,
      shootDate: new Date("2026-03-25"),
      deadline: new Date("2026-04-15"),
    },
  });

  const proj2 = await prisma.project.create({
    data: {
      title: "סדרת YouTube — מאחורי הקלעים",
      description: "סדרה בת 8 פרקים על תהליך הפקת וידאו",
      clientId: client2.id,
      phase: "post_production",
      status: "rough_cut",
      projectType: "youtube",
      budget: 40000,
      shootDate: new Date("2026-03-10"),
      deadline: new Date("2026-04-01"),
    },
  });

  const proj3 = await prisma.project.create({
    data: {
      title: "סרטון תדמית — StartupTLV",
      description: "סרט תדמית קצר לסטארטאפ טכנולוגי",
      clientId: client3.id,
      phase: "pre_production",
      status: "scripting",
      projectType: "corporate",
      budget: 15000,
      deadline: new Date("2026-04-20"),
    },
  });

  const proj4 = await prisma.project.create({
    data: {
      title: "פרסומת סושיאל — BrandUp",
      description: "3 סרטוני פרסומת לקמפיין ברשתות חברתיות",
      clientId: client4.id,
      phase: "pre_production",
      status: "moodboards",
      projectType: "social",
      budget: 12000,
      deadline: new Date("2026-04-10"),
    },
  });

  const proj5 = await prisma.project.create({
    data: {
      title: "קליפ — ״לילה בעיר״ — דני שרון",
      description: "קליפ לילי עם תאורה ניאונית, לוקיישנים עירוניים",
      clientId: client5.id,
      phase: "post_production",
      status: "color_sound",
      projectType: "music_video",
      budget: 30000,
      shootDate: new Date("2026-03-05"),
      deadline: new Date("2026-03-30"),
    },
  });

  // --- TASKS ---
  await prisma.task.createMany({
    data: [
      { projectId: proj1.id, title: "לסגור לוקיישן ראשי", completed: true },
      { projectId: proj1.id, title: "לתאם שחקנים/רקדנים", completed: false },
      { projectId: proj1.id, title: "להכין רשימת ציוד", completed: false },
      { projectId: proj2.id, title: "עריכת פרק 1 — גרסה גולמית", completed: true },
      { projectId: proj2.id, title: "עריכת פרק 2 — גרסה גולמית", completed: false },
      { projectId: proj2.id, title: "הכנת מוזיקה וגרפיקה", completed: false },
      { projectId: proj3.id, title: "כתיבת תסריט ראשוני", completed: false, dueDate: new Date("2026-03-20") },
      { projectId: proj5.id, title: "קולור גריידינג סופי", completed: false, dueDate: new Date("2026-03-22") },
      { projectId: proj5.id, title: "עיצוב סאונד ומיקס", completed: false, dueDate: new Date("2026-03-25") },
    ],
  });

  // --- EQUIPMENT ---
  const gear1 = await prisma.equipment.create({
    data: { name: "Sony FX3", category: "camera", brand: "Sony", model: "FX3", serialNumber: "SN-FX3-001", purchasePrice: 15000, status: "available" },
  });
  const gear2 = await prisma.equipment.create({
    data: { name: "Sony 24-70mm f/2.8 GM II", category: "lens", brand: "Sony", model: "24-70mm f/2.8 GM II", purchasePrice: 8500, status: "available" },
  });
  const gear3 = await prisma.equipment.create({
    data: { name: "DJI Mini 4 Pro", category: "drone", brand: "DJI", model: "Mini 4 Pro", purchasePrice: 4500, status: "available" },
  });
  const gear4 = await prisma.equipment.create({
    data: { name: "Aputure 600d Pro", category: "lighting", brand: "Aputure", model: "600d Pro", purchasePrice: 7000, status: "rented" },
  });
  const gear5 = await prisma.equipment.create({
    data: { name: "Rode NTG5", category: "audio", brand: "Rode", model: "NTG5", purchasePrice: 2500, status: "available" },
  });
  await prisma.equipment.create({
    data: { name: "DJI RS3 Pro", category: "grip", brand: "DJI", model: "RS3 Pro", purchasePrice: 3200, status: "in_repair", notes: "בתיקון — מנוע ציר נטייה" },
  });

  // --- GEAR ASSIGNMENTS ---
  await prisma.gearAssignment.createMany({
    data: [
      { equipmentId: gear1.id, projectId: proj1.id, notes: "מצלמה ראשית לצילום הקליפ" },
      { equipmentId: gear2.id, projectId: proj1.id, notes: "עדשה ראשית" },
      { equipmentId: gear3.id, projectId: proj1.id, notes: "צילום אוויר" },
      { equipmentId: gear5.id, projectId: proj2.id, notes: "מיקרופון ליפסינק" },
    ],
  });

  // --- QUOTES ---
  const quote1 = await prisma.quote.create({
    data: {
      quoteNumber: "Q-2026-001",
      clientId: client3.id,
      projectId: proj3.id,
      status: "sent",
      subtotal: 15000,
      tax: 2550,
      total: 17550,
      validUntil: new Date("2026-04-15"),
      items: {
        create: [
          { description: "יום צילום מלא כולל צוות", quantity: 1, unitPrice: 8000, total: 8000 },
          { description: "עריכה ופוסט-פרודקשן", quantity: 1, unitPrice: 5000, total: 5000 },
          { description: "הפקה וניהול פרויקט", quantity: 1, unitPrice: 2000, total: 2000 },
        ],
      },
    },
  });

  // --- INVOICES ---
  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-001",
      clientId: client2.id,
      projectId: proj2.id,
      status: "sent",
      subtotal: 40000,
      tax: 6800,
      total: 46800,
      dueDate: new Date("2026-04-01"),
      items: {
        create: [
          { description: "הפקת סדרת YouTube — 8 פרקים", quantity: 8, unitPrice: 4000, total: 32000 },
          { description: "גרפיקה ואנימציה", quantity: 1, unitPrice: 5000, total: 5000 },
          { description: "מוזיקה ועיצוב סאונד", quantity: 1, unitPrice: 3000, total: 3000 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-002",
      clientId: client1.id,
      projectId: proj1.id,
      status: "paid",
      subtotal: 25000,
      tax: 4250,
      total: 29250,
      paidAt: new Date("2026-03-10"),
      items: {
        create: [
          { description: "הפקת קליפ מוזיקלי", quantity: 1, unitPrice: 18000, total: 18000 },
          { description: "שכירת ציוד תאורה", quantity: 1, unitPrice: 4000, total: 4000 },
          { description: "הפקה ותיאומים", quantity: 1, unitPrice: 3000, total: 3000 },
        ],
      },
    },
  });

  // --- EXPENSES ---
  await prisma.expense.createMany({
    data: [
      { description: "מנוי Adobe Creative Cloud", category: "software", amount: 250, date: new Date("2026-03-01"), vendor: "Adobe" },
      { description: "מנוי DaVinci Resolve Studio", category: "software", amount: 1200, date: new Date("2026-01-15"), vendor: "Blackmagic Design" },
      { description: "שכירות סטודיו — מרץ", category: "rent", amount: 4500, date: new Date("2026-03-01") },
      { description: "תיקון גימבל DJI RS3 Pro", category: "gear", amount: 800, date: new Date("2026-03-05"), vendor: "DJI Service Center" },
      { description: "נסיעה ללוקיישן — חיפה", category: "travel", amount: 350, date: new Date("2026-03-08") },
      { description: "כרטיסי זיכרון CFexpress x2", category: "gear", amount: 1500, date: new Date("2026-02-20"), vendor: "B&H Photo" },
    ],
  });

  console.log("✅ Seed data created successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
