const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const daysAgo = (n, h = 0) => new Date(Date.now() - n * 86400000 - h * 3600000);

async function main() {
  await prisma.$transaction([
    prisma.restockRequest.deleteMany(),
    prisma.stockItem.deleteMany(),
    prisma.complaint.deleteMany(),
    prisma.request.deleteMany(),
    prisma.user.deleteMany(),
    prisma.camp.deleteMany(),
  ]);

  const camps = await Promise.all(
    [
      { name: "Alkhidmat Relief Camp - Rawalpindi", district: "Rawalpindi", province: "Punjab", lat: 33.5973, lng: 73.0645, phone: "051 5551234", capacity: 500, occupancy: 280 },
      { name: "Alkhidmat Relief Camp - Islamabad", district: "Islamabad", province: "Punjab", lat: 33.6687, lng: 73.0768, phone: "051 8443322", capacity: 450, occupancy: 210 },
      { name: "Alkhidmat Relief Camp - Lahore", district: "Lahore", province: "Punjab", lat: 31.48, lng: 74.32, phone: "042 35881234", capacity: 700, occupancy: 420 },
      { name: "Alkhidmat Relief Camp - Peshawar", district: "Peshawar", province: "Khyber Pakhtunkhwa", lat: 34.0151, lng: 71.5249, phone: "091 5841234", capacity: 600, occupancy: 410 },
      { name: "Alkhidmat Relief Camp - Karachi", district: "Karachi", province: "Sindh", lat: 24.918, lng: 67.0971, phone: "021 34991234", capacity: 800, occupancy: 530 },
      { name: "Alkhidmat Relief Camp - Quetta", district: "Quetta", province: "Balochistan", lat: 30.1798, lng: 66.975, phone: "081 2821234", capacity: 500, occupancy: 310 },
      { name: "Alkhidmat Relief Camp - Abbottabad", district: "Abbottabad", province: "Khyber Pakhtunkhwa", lat: 34.1688, lng: 73.2215, phone: "0992 381122", capacity: 350, occupancy: 175 },
      { name: "Alkhidmat Relief Camp - Swat", district: "Swat (Mingora)", province: "Khyber Pakhtunkhwa", lat: 34.7795, lng: 72.3614, phone: "0946 711223", capacity: 450, occupancy: 310 },
      { name: "Alkhidmat Relief Camp - Faisalabad", district: "Faisalabad", province: "Punjab", lat: 31.4187, lng: 73.0791, phone: "041 8761234", capacity: 500, occupancy: 290 },
      { name: "Alkhidmat Relief Camp - Multan", district: "Multan", province: "Punjab", lat: 30.1978, lng: 71.4697, phone: "061 6211234", capacity: 550, occupancy: 380 },
      { name: "Alkhidmat Relief Camp - Badin", district: "Badin", province: "Sindh", lat: 24.6561, lng: 68.8368, phone: "0300 1234567", capacity: 400, occupancy: 312 },
      { name: "Alkhidmat Relief Camp - Thatta", district: "Thatta", province: "Sindh", lat: 24.7461, lng: 67.9243, phone: "0300 2223331", capacity: 300, occupancy: 210 },
      { name: "Alkhidmat Relief Camp - Larkana", district: "Larkana", province: "Sindh", lat: 27.559, lng: 68.2121, phone: "0300 2223332", capacity: 350, occupancy: 168 },
      { name: "Alkhidmat Relief Camp - Sukkur", district: "Sukkur", province: "Sindh", lat: 27.7052, lng: 68.8574, phone: "0300 2223333", capacity: 500, occupancy: 402 },
      { name: "Alkhidmat Relief Camp - Hyderabad", district: "Hyderabad", province: "Sindh", lat: 25.396, lng: 68.3578, phone: "0300 2223334", capacity: 450, occupancy: 195 },
      { name: "Alkhidmat Relief Camp - Dera Ghazi Khan", district: "Dera Ghazi Khan", province: "Punjab", lat: 30.0489, lng: 70.6463, phone: "0300 2223335", capacity: 380, occupancy: 274 },
      { name: "Alkhidmat Relief Camp - Rajanpur", district: "Rajanpur", province: "Punjab", lat: 29.1053, lng: 70.3304, phone: "0300 2223336", capacity: 260, occupancy: 231 },
      { name: "Alkhidmat Relief Camp - Muzaffargarh", district: "Muzaffargarh", province: "Punjab", lat: 30.0736, lng: 71.1804, phone: "0300 2223337", capacity: 320, occupancy: 141 },
      { name: "Alkhidmat Relief Camp - Nowshera", district: "Nowshera", province: "Khyber Pakhtunkhwa", lat: 34.0153, lng: 71.9747, phone: "0300 2223338", capacity: 340, occupancy: 288 },
      { name: "Alkhidmat Relief Camp - Charsadda", district: "Charsadda", province: "Khyber Pakhtunkhwa", lat: 34.1453, lng: 71.7308, phone: "0300 2223339", capacity: 280, occupancy: 122 },
      { name: "Alkhidmat Relief Camp - Dera Ismail Khan", district: "Dera Ismail Khan", province: "Khyber Pakhtunkhwa", lat: 31.8313, lng: 70.9017, phone: "0300 2223340", capacity: 300, occupancy: 187 },
      { name: "Alkhidmat Relief Camp - Jaffarabad", district: "Jaffarabad", province: "Balochistan", lat: 28.9417, lng: 68.31, phone: "0300 2223341", capacity: 240, occupancy: 205 },
      { name: "Alkhidmat Relief Camp - Naseerabad", district: "Naseerabad", province: "Balochistan", lat: 30.1372, lng: 67.9117, phone: "0300 2223342", capacity: 220, occupancy: 96 },
    ].map((c) => prisma.camp.create({ data: c }))
  );

  const rwpCamp = camps.find((c) => c.district === "Rawalpindi") || camps[0];
  const nowsheraCamp = camps.find((c) => c.district === "Nowshera") || camps[0];
  const badinCamp = camps.find((c) => c.district === "Badin") || camps[0];
  const lahoreCamp = camps.find((c) => c.district === "Lahore") || camps[0];

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  const hamza = await prisma.user.create({
    data: { username: "hamza.khan", passwordHash: hash("volunteer2025"), role: "volunteer", name: "Hamza Khan", phone: "0300 1234567", campId: rwpCamp.id, available: true },
  });
  const ayesha = await prisma.user.create({
    data: { username: "ayesha.siddiqui", passwordHash: hash("volunteer2025"), role: "volunteer", name: "Ayesha Siddiqui", phone: "0321 7654321", campId: rwpCamp.id, available: true },
  });
  const bilal = await prisma.user.create({
    data: { username: "bilal.ahmed", passwordHash: hash("volunteer2025"), role: "volunteer", name: "Bilal Ahmed", phone: "0333 2223334", campId: rwpCamp.id, available: false },
  });
  await prisma.user.create({
    data: { username: "ahmad.raza", passwordHash: hash("camp2025"), role: "camp_manager", name: "Ahmad Raza", phone: "0345 1234567", campId: rwpCamp.id },
  });
  await prisma.user.create({
    data: { username: "admin@alkhidmat.org", passwordHash: hash("admin2025"), role: "admin", name: "Ali Hassan", phone: "0300 9998887" },
  });

  const requests = [
    // --- Rawalpindi / Islamabad Region Requests ---
    {
      code: "RIP-2026-00001", citizenName: "Fatima Bibi", phone: "0300 8765432", type: "medical", priority: "critical",
      needs: JSON.stringify(["High Fever", "Water Purification Tabs", "Children Under 5"]),
      district: "Rawalpindi", lat: 33.5973, lng: 73.0645, location: "Liaquat Bagh, Murree Road, Rawalpindi",
      peopleCount: 4, status: "in_transit", volunteerId: hamza.id, campId: rwpCamp.id,
      assignedAt: daysAgo(0, 3), startedAt: daysAgo(0, 1), createdAt: daysAgo(0, 4),
    },
    {
      code: "RIP-2026-00003", citizenName: "Allah Dino", phone: "0345 1112223", type: "water", priority: "high",
      needs: JSON.stringify(["Clean Water", "Water Purification Tabs"]),
      district: "Islamabad", lat: 33.6687, lng: 73.0768, location: "I-8 Sector / Expressway, Islamabad",
      peopleCount: 8, status: "pending", campId: rwpCamp.id, createdAt: daysAgo(0, 2),
    },
    {
      code: "RIP-2026-00004", citizenName: "Zarina Khatoon", phone: "0311 4445556", type: "shelter", priority: "medium",
      needs: JSON.stringify(["Emergency Tent", "Blankets"]),
      district: "Rawalpindi", lat: 33.61, lng: 73.08, location: "Dhok Kala Khan, Rawalpindi",
      peopleCount: 5, status: "pending", campId: rwpCamp.id, createdAt: daysAgo(0, 5),
    },

    // --- Nowshera Region Requests ---
    {
      code: "RIP-2026-00002", citizenName: "Bashir Ahmed", phone: "0333 5556661", type: "rescue", priority: "critical",
      needs: JSON.stringify(["Boat Rescue", "Clean Water"]),
      district: "Nowshera", lat: 34.0153, lng: 71.9747, location: "Kabul River Sector, Nowshera",
      peopleCount: 6, status: "assigned", campId: nowsheraCamp.id,
      assignedAt: daysAgo(0, 2), createdAt: daysAgo(0, 6),
    },
    {
      code: "RIP-2026-00010", citizenName: "Bashir Ahmed", phone: "0333 5556661", type: "rescue", priority: "critical",
      needs: JSON.stringify(["Boat Rescue", "Clean Water"]),
      district: "Nowshera", lat: 34.0153, lng: 71.9747, location: "Kabul River Sector, Nowshera",
      peopleCount: 6, status: "assigned", campId: nowsheraCamp.id,
      assignedAt: daysAgo(0, 2), createdAt: daysAgo(0, 6),
    },
    {
      code: "RIP-2026-00011", citizenName: "Haleeman", phone: "0313 9990001", type: "food", priority: "high",
      needs: JSON.stringify(["Food Packs"]),
      district: "Nowshera", lat: 33.99, lng: 71.85, location: "Pabbi, Nowshera",
      peopleCount: 7, status: "pending", campId: nowsheraCamp.id,
      createdAt: daysAgo(1),
    },

    // --- Badin Region Requests ---
    {
      code: "RIP-2026-00005", citizenName: "Muhammad Yousuf", phone: "0302 7778889", type: "medical", priority: "critical",
      needs: JSON.stringify(["High Fever", "Diarrhea", "Elderly Patient"]),
      district: "Badin", lat: 24.6833, lng: 68.7667, location: "Kadhan, Badin",
      peopleCount: 3, status: "pending", campId: badinCamp.id, createdAt: daysAgo(0, 1),
    },
    {
      code: "RIP-2026-00020", citizenName: "Abdul Rehman", phone: "0300 4447778", type: "rescue", priority: "critical",
      needs: JSON.stringify(["Boat Rescue", "Elderly Patient"]),
      district: "Badin", lat: 24.7667, lng: 68.9333, location: "Pangrio, Badin",
      peopleCount: 5, status: "resolved", campId: badinCamp.id,
      assignedAt: daysAgo(1), startedAt: daysAgo(0, 12), resolvedAt: daysAgo(0, 2), createdAt: daysAgo(1, 2),
    },
    {
      code: "RIP-2026-00021", citizenName: "Saima", phone: "0345 3336669", type: "water", priority: "medium",
      needs: JSON.stringify(["Clean Water"]),
      district: "Badin", lat: 24.649, lng: 68.8295, location: "Badin City Center",
      peopleCount: 4, status: "pending", campId: badinCamp.id, createdAt: daysAgo(0, 8),
    },

    // --- Lahore Region Requests ---
    {
      code: "RIP-2026-00008", citizenName: "Saima", phone: "0345 3336669", type: "water", priority: "medium",
      needs: JSON.stringify(["Clean Water"]),
      district: "Lahore", lat: 31.48, lng: 74.32, location: "Model Town, Ferozepur Road, Lahore",
      peopleCount: 4, status: "resolved", campId: lahoreCamp.id,
      createdAt: daysAgo(0, 8),
    },
    {
      code: "RIP-2026-00030", citizenName: "Tariq Mehmood", phone: "0300 1234567", type: "medical", priority: "critical",
      needs: JSON.stringify(["High Fever", "Medical First Aid"]),
      district: "Lahore", lat: 31.48, lng: 74.32, location: "Model Town, Ferozepur Road, Lahore",
      peopleCount: 4, status: "assigned", campId: lahoreCamp.id,
      createdAt: daysAgo(0, 3),
    },
    {
      code: "RIP-2026-00031", citizenName: "Nasreen Akhtar", phone: "0321 7654321", type: "food", priority: "high",
      needs: JSON.stringify(["Food Packs", "Clean Water"]),
      district: "Lahore", lat: 31.62, lng: 74.28, location: "Shahdara, Ravi River Basin, Lahore",
      peopleCount: 5, status: "resolved", campId: lahoreCamp.id,
      assignedAt: daysAgo(1, 4), startedAt: daysAgo(1, 3), resolvedAt: daysAgo(1, 1), createdAt: daysAgo(1, 5),
      resolution: JSON.stringify({ items: ["Food Pack x2"], peopleHelped: 5, notes: "Delivered directly to family" }),
    },
  ];

  for (const r of requests) {
    await prisma.request.create({ data: r });
  }

  const badinStock = [
    { name: "RippleNet Water Purification Kit", category: "water", quantity: 48, unit: "kits", reorderLevel: 15 },
    { name: "Paracetamol (500mg)", category: "medical", quantity: 420, unit: "tabs", reorderLevel: 100 },
    { name: "ORS Sachets", category: "medical", quantity: 180, unit: "sachets", reorderLevel: 150 },
    { name: "Zinc Tablets", category: "medical", quantity: 45, unit: "tabs", reorderLevel: 50 },
    { name: "Water Purification Tabs", category: "medical", quantity: 240, unit: "tabs", reorderLevel: 60 },
    { name: "Antiseptic Liquid (100ml)", category: "medical", quantity: 36, unit: "bottles", reorderLevel: 20 },
    { name: "Family Food Pack", category: "food", quantity: 85, unit: "packs", reorderLevel: 40 },
    { name: "Mineral Water (1.5L)", category: "water", quantity: 120, unit: "bottles", reorderLevel: 60 },
    { name: "Family Tent", category: "shelter", quantity: 24, unit: "units", reorderLevel: 10 },
    { name: "Blankets", category: "shelter", quantity: 60, unit: "units", reorderLevel: 30 },
  ];
  for (const s of badinStock) {
    await prisma.stockItem.create({ data: { ...s, campId: rwpCamp.id } });
    await prisma.stockItem.create({ data: { ...s, campId: badinCamp.id } });
  }

  const genericStock = [
    { name: "RippleNet Water Purification Kit", category: "water", quantity: 25, unit: "kits", reorderLevel: 10 },
    { name: "Family Food Pack", category: "food", quantity: 60, unit: "packs", reorderLevel: 40 },
    { name: "Mineral Water (1.5L)", category: "water", quantity: 90, unit: "bottles", reorderLevel: 60 },
    { name: "Blankets", category: "shelter", quantity: 45, unit: "units", reorderLevel: 30 },
    { name: "ORS Sachets", category: "medical", quantity: 200, unit: "sachets", reorderLevel: 150 },
  ];
  for (const camp of camps.slice(1).filter((camp) => camp.id !== badinCamp.id)) {
    for (const s of genericStock) {
      await prisma.stockItem.create({ data: { ...s, campId: camp.id } });
    }
  }

  await prisma.restockRequest.createMany({
    data: [
      { code: "RST-2026-00001", campId: rwpCamp.id, itemName: "AquaTabs Water Purification (50 Tabs)", quantity: 300, status: "pending", createdAt: daysAgo(0, 4) },
      { code: "RST-2026-00002", campId: rwpCamp.id, itemName: "Oral Rehydration Salts (ORS)", quantity: 250, status: "approved", createdAt: daysAgo(1, 2) },
      { code: "RST-2026-00003", campId: rwpCamp.id, itemName: "Family Dry Ration Pack (15kg)", quantity: 150, status: "pending", createdAt: daysAgo(0, 6) },
      { code: "RST-2026-00004", campId: badinCamp.id, itemName: "Family Food Pack", quantity: 200, status: "pending", createdAt: daysAgo(0, 5) },
      { code: "RST-2026-00005", campId: badinCamp.id, itemName: "Zinc Tablets", quantity: 100, status: "pending", createdAt: daysAgo(0, 3) },
      { code: "RST-2026-00006", campId: nowsheraCamp.id, itemName: "Mineral Water (1.5L)", quantity: 150, status: "approved", createdAt: daysAgo(1, 2) },
      { code: "RST-2026-00007", campId: lahoreCamp.id, itemName: "Family Tent", quantity: 20, status: "pending", createdAt: daysAgo(0, 8) },
    ],
  });

  await prisma.complaint.createMany({
    data: [
      { code: "CMP-2026-00001", citizenName: "Zubair Abbasi", phone: "0300 5551122", message: "Rations arrived in Raja Bazaar, but water purification tabs were missing in the parcel.", category: "delivery", campId: rwpCamp.id, status: "open", createdAt: daysAgo(0, 4) },
      { code: "CMP-2026-00002", citizenName: "Parveen Akhtar", phone: "0333 4443322", message: "Patient is experiencing severe fever and dehydration; urgently requested paracetamol & ORS.", category: "medical", campId: rwpCamp.id, status: "in_progress", createdAt: daysAgo(1, 2) },
      { code: "CMP-2026-00003", citizenName: "Tariq Mehmood", phone: "0345 9998877", message: "Volunteer arrived on motorcycle but family needed a tent for 6 people.", category: "service", campId: rwpCamp.id, status: "resolved", response: "Emergency family tent dispatched and erected by evening team.", createdAt: daysAgo(2, 5), resolvedAt: daysAgo(2, 1) },
      { code: "CMP-2026-00004", citizenName: "Sakina Bibi", phone: "0300 1112233", message: "Food pack was missing clean drinking water bottles promised with delivery.", category: "delivery", campId: badinCamp.id, status: "open", createdAt: daysAgo(0, 6) },
      { code: "CMP-2026-00005", citizenName: "Nazir Ahmed", phone: "0311 2223344", message: "Volunteer arrived 2 hours after the promised time due to flooded road.", category: "service", campId: badinCamp.id, status: "in_progress", createdAt: daysAgo(1, 3) },
      { code: "CMP-2026-00006", citizenName: "Mai Jannat", phone: "0333 4445566", message: "Wrong medicine delivered, needed pediatric zinc & ORS for infant.", category: "medical", campId: badinCamp.id, status: "resolved", response: "Corrected same day. Pediatric ORS sachets delivered by volunteer.", createdAt: daysAgo(2, 4), resolvedAt: daysAgo(2) },
      { code: "CMP-2026-00007", citizenName: "Gul Khan", phone: "0321 7776655", message: "Nowshera river sector relief boat was delayed by heavy water current.", category: "delivery", campId: nowsheraCamp.id, status: "open", createdAt: daysAgo(0, 2) },
    ],
  });

  console.log("Seed complete:", {
    camps: camps.length,
    users: 5,
    requests: requests.length,
    stock: badinStock.length + genericStock.length * 12,
    restocks: 4,
    complaints: 3,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
