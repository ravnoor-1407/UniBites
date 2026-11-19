// UniBites File-Based Persistent Database
// Serves as single source of truth across all restarts

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'db.json');
const OUTLETS_PATH = path.join(__dirname, 'outlets.json');
const MENU_PATH = path.join(__dirname, 'menuManifest.json');
const COURTS_PATH = path.join(__dirname, 'foodCourts.json');

class FileDatabase {
  constructor() {
    this.data = {
      users: [],
      foodCourts: [],
      outlets: [],
      menuItems: [],
      orders: [],
      seatHolds: [],
      groups: [],
      tokenCounter: 100,
    };
    this.init();
  }

  init() {
    try {
      const tmpPath = path.join('/tmp', 'unibites_db.json');
      if (fs.existsSync(tmpPath)) {
        const raw = fs.readFileSync(tmpPath, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`✅ Loaded database from temporary storage ${tmpPath}`);
        return;
      }
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`✅ Loaded existing UniBites database from ${DB_PATH}`);
      } else {
        console.log(`ℹ️ Initializing fresh UniBites database...`);
        this.seed();
      }
    } catch (err) {
      console.error('Error loading DB, re-seeding:', err.message);
      this.seed();
    }
  }

  seed() {
    const rawCourts = JSON.parse(fs.readFileSync(COURTS_PATH, 'utf-8'));
    const rawOutlets = JSON.parse(fs.readFileSync(OUTLETS_PATH, 'utf-8'));
    const rawMenu = JSON.parse(fs.readFileSync(MENU_PATH, 'utf-8'));

    // Hash demo password: 'demo123'
    const passwordHash = bcrypt.hashSync('demo123', 8);

    const defaultUsers = [
      {
        id: 'user-student-1',
        name: 'Aarav Sharma',
        rollNumber: '12204891',
        email: 'student@unibites.app',
        phone: '9876543210',
        password: passwordHash,
        role: 'student',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-vendor-1',
        name: 'Belgian Waffle Counter Staff',
        email: 'vendor1@unibites.app',
        phone: '9876500001',
        password: passwordHash,
        role: 'vendor',
        outletId: 'outlet-1',
        outletName: 'The Belgian Waffle Co.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-vendor-2',
        name: 'Block 14 Canteen Manager',
        email: 'vendor2@unibites.app',
        phone: '9876500002',
        password: passwordHash,
        role: 'vendor',
        outletId: 'outlet-canteen-b14',
        outletName: 'Block 14 Canteen (MSB)',
        createdAt: new Date().toISOString()
      }
    ];

    // Initialize outlets with default live status fields
    const outlets = rawOutlets.map(o => ({
      ...o,
      isPaused: false,
      pausedUntil: null,
      maxOrdersPer5Min: 15,
      totalSeats: o.totalSeats || (o.isAcademicCanteen ? 100 : 0),
      occupiedSeats: o.occupiedSeats !== undefined ? o.occupiedSeats : (o.isAcademicCanteen ? 42 : 0),
      queueCount: o.activeOrders || 3,
    }));

    // Initialize menu items with availability
    const menuItems = rawMenu.map(item => ({
      ...item,
      isAvailable: true
    }));

    // Initial demo order for student Aarav Sharma
    const sampleOrder = {
      id: 'ORD-98214',
      token: 'UB-101',
      studentRoll: '12204891',
      studentName: 'Aarav Sharma',
      studentPhone: '9876543210',
      outletId: 'outlet-1',
      outletName: 'The Belgian Waffle Co.',
      items: [
        {
          id: 'dish-001',
          name: 'Belgian Chocolate Overload Waffle',
          price: 145,
          quantity: 1,
          isVeg: true
        }
      ],
      subtotal: 145,
      platformFee: 5,
      totalAmount: 150,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      diningMode: 'Takeaway',
      pickupSlot: 'Immediate (~10 mins)',
      status: 'Preparing',
      prepMins: 6,
      orderedAt: new Date(Date.now() - 3 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date(Date.now() - 3 * 60000).toISOString()
    };

    this.data = {
      users: defaultUsers,
      foodCourts: rawCourts,
      outlets,
      menuItems,
      orders: [sampleOrder],
      seatHolds: [],
      groups: [],
      tokenCounter: 101,
    };

    this.save();
    console.log(`✅ Seeded fresh database with ${defaultUsers.length} users, ${outlets.length} outlets, ${menuItems.length} dishes.`);
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      // Fallback for read-only serverless filesystems (e.g. Vercel)
      try {
        const tmpPath = path.join('/tmp', 'unibites_db.json');
        fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (e) {
        // Safe in-memory retention
      }
    }
  }

  // ==================== USERS ====================
  getUsers() {
    return this.data.users;
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  findUserByRollOrEmail(identifier) {
    const term = identifier.trim().toLowerCase();
    return this.data.users.find(u => 
      (u.rollNumber && u.rollNumber.toLowerCase() === term) ||
      (u.email && u.email.toLowerCase() === term)
    );
  }

  createUser(userData) {
    const newUser = {
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      role: 'student', // default
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // ==================== OUTLETS ====================
  getFoodCourts() {
    return this.data.foodCourts;
  }

  getOutlets() {
    // Check auto-resuming paused outlets
    const now = Date.now();
    let updated = false;
    for (const o of this.data.outlets) {
      if (o.isPaused && o.pausedUntil && o.pausedUntil < now) {
        o.isPaused = false;
        o.pausedUntil = null;
        updated = true;
      }
    }
    if (updated) this.save();
    return this.data.outlets;
  }

  findOutlet(id) {
    return this.getOutlets().find(o => o.id === id);
  }

  updateOutlet(id, updates) {
    const outlet = this.data.outlets.find(o => o.id === id);
    if (!outlet) return null;
    Object.assign(outlet, updates);
    this.save();
    return outlet;
  }

  // ==================== MENU ITEMS ====================
  getMenuItems(outletId) {
    if (outletId) {
      return this.data.menuItems.filter(i => i.outletId === outletId);
    }
    return this.data.menuItems;
  }

  findMenuItem(id) {
    return this.data.menuItems.find(i => i.id === id);
  }

  updateMenuItem(id, updates) {
    const item = this.data.menuItems.find(i => i.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.save();
    return item;
  }

  // ==================== ORDERS ====================
  getOrders(filter = {}) {
    let list = [...this.data.orders];
    if (filter.outletId) {
      list = list.filter(o => o.outletId === filter.outletId);
    }
    if (filter.studentRoll) {
      list = list.filter(o => o.studentRoll === filter.studentRoll);
    }
    if (filter.status) {
      list = list.filter(o => o.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findOrder(id) {
    return this.data.orders.find(o => o.id === id || o.token === id);
  }

  createOrder(orderData) {
    this.data.tokenCounter = (this.data.tokenCounter || 100) + 1;
    const token = `UB-${this.data.tokenCounter}`;
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      token,
      status: 'Placed', // starts at Placed
      platformFee: 5,
      createdAt: new Date().toISOString(),
      orderedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...orderData
    };

    this.data.orders.unshift(newOrder);

    // Update queue count on outlet
    const outlet = this.data.outlets.find(o => o.id === newOrder.outletId);
    if (outlet) {
      outlet.queueCount = (outlet.queueCount || 0) + 1;
    }

    this.save();
    return newOrder;
  }

  updateOrder(id, updates) {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;
    Object.assign(order, updates);
    this.save();
    return order;
  }

  // ==================== SEAT HOLDS ====================
  getSeatHolds(outletId) {
    const now = Date.now();
    // Prune expired holds (held for 15 mins)
    this.data.seatHolds = this.data.seatHolds.filter(h => new Date(h.expiresAt).getTime() > now);
    if (outletId) {
      return this.data.seatHolds.filter(h => h.outletId === outletId);
    }
    return this.data.seatHolds;
  }

  holdSeats(outletId, seatIds, studentRoll) {
    const now = Date.now();
    const expiresAt = new Date(now + 15 * 60 * 1000).toISOString(); // 15 mins
    const newHold = {
      id: `hold-${Date.now()}`,
      outletId,
      seatIds,
      studentRoll,
      createdAt: new Date().toISOString(),
      expiresAt
    };
    this.data.seatHolds.push(newHold);
    this.save();
    return newHold;
  }

  releaseSeatHold(holdId) {
    this.data.seatHolds = this.data.seatHolds.filter(h => h.id !== holdId);
    this.save();
    return true;
  }

  // ==================== GROUPS ====================
  getGroup(groupCode) {
    return this.data.groups.find(g => g.groupCode === groupCode.toUpperCase());
  }

  createGroup(hostRoll, hostName, outletId) {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newGroup = {
      groupCode: code,
      hostRoll,
      hostName,
      outletId,
      members: [
        {
          name: hostName,
          roll: hostRoll,
          items: []
        }
      ],
      status: 'open',
      createdAt: new Date().toISOString()
    };
    this.data.groups.push(newGroup);
    this.save();
    return newGroup;
  }

  addItemToGroup(groupCode, memberName, memberRoll, item) {
    const group = this.getGroup(groupCode);
    if (!group || group.status !== 'open') return null;

    let member = group.members.find(m => m.roll === memberRoll);
    if (!member) {
      member = { name: memberName, roll: memberRoll, items: [] };
      group.members.push(member);
    }

    member.items.push(item);
    this.save();
    return group;
  }
}

// Singleton database instance
const db = new FileDatabase();
module.exports = db;
