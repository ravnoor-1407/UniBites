# UniBites 🎓⚡
> **"Order Smart. Skip the Queue. Never Miss a Class."**

UniBites is a modern, full-stack campus food pre-ordering and queue management system designed for universities. It enables students to browse campus food courts, kiosks, and academic block canteens (including Block 14 MSB, BH2, Food Square, etc.), place advance orders synchronized with lecture breaks, track preparation in real time, and pick up food at the counter using instant digital tokens (`UB-xxx`) without standing in long queues.

---

## 🌟 Key Features

1. **Pre-Order Food Ahead of Time**
   - Browse menus and order food before reaching the canteen (during lectures or before break).
   - Food is prepared and packed before the student arrives.

2. **Instant Pickup Digital Tokens (`UB-xxx`)**
   - High-contrast digital token badge and QR code generated immediately upon ordering.
   - Simply show the token at the collection counter for fast verification and handover.

3. **Live 4-Stage Order Tracking**
   - Live visual status stepper: `Order Placed` ➔ `Accepted` ➔ `Cooking` ➔ `Ready for Pickup` ➔ `Collected`.
   - Real-time preparation countdown and audible bell alert when food is ready.

4. **Smart Break-Time Meal Planner**
   - Select your current campus block (e.g., Block 14 MSB) and available break duration (15, 20, 30 mins).
   - Dynamic walking distance and queue calculations show dishes guaranteed to be ready before class resumes.

5. **Campus Canteen Integration & Seating**
   - 30 university outlets across campus (Campus Café, CSE & Apartments, BH2 Food Court, Academic Canteens).
   - Live canteen seat reservation with interactive seat maps and 15-minute holds.

6. **Dedicated Real-Time Vendor Portal**
   - Live incoming order queue with audio chime and instant status updates.
   - One-click dish stock toggling (mark sold-out / in-stock) and emergency outlet pause.

7. **100% Local Culinary Menu Imagery**
   - All 366 dishes mapped to square 800x800 WebP images (< 150 KB) matching dish names with zero broken external links.
   - Built-in visual image audit tool at `/dev/image-check`.

---

## 🎨 Design System

- **Primary Burgundy:** `#7A1F3D` (hover `#5E1730`)
- **Accent Mustard:** `#E3A82B` (hover `#C98F1A`)
- **Background Cream:** `#FBF6EC`
- **Surface White:** `#FFFFFF` | **Surface Alt:** `#F3EBDD`
- **Text:** `#2B1B1F` | **Muted:** `#6B5A5E` | **Border:** `#E7DCC8`
- **Typography:** Playfair Display (Headings), Plus Jakarta Sans (Body), JetBrains Mono (Tokens & Metrics)

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Lucide React, Socket.IO Client, Axios
- **Backend:** Node.js, Express, Socket.IO, JWT Authentication, JSON Database Engine (`fileDb`)
- **Testing & Verification:** Comprehensive E2E test suite (35 automated tests), automated image check (`npm run check:images`)

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone <your-repo-url>
cd UniBites
npm run install:all
```

### 3. Start Development Server
Run backend and frontend simultaneously with hot reload:
```bash
npm run dev
```
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **Dev Image Gallery:** `http://localhost:5173/dev/image-check`

### 4. Demo Accounts
| Role | Email / Reg No. | Password | Description |
| :--- | :--- | :--- | :--- |
| **Student** | `12204891` | `student123` | Student account with campus pre-order access |
| **Vendor 1** | `vendor1@unibites.app` | `vendor123` | Campus Café Kiosk #01 (Belgian Waffles) |
| **Vendor 2** | `vendor2@unibites.app` | `vendor123` | Block 14 MSB Academic Canteen |

---

## 🧪 Automated Testing & Image Audit

```bash
# Validate that 100% of dishes have local WebP images and zero broken URLs:
npm run check:images

# Build frontend production bundle:
npm run build:frontend
```

---

## 🌐 Deployment Guide

UniBites can be deployed in two simple ways:

### Option A: Monolithic Web Service (Recommended: Render / Railway / Fly.io)
Deploy the whole full-stack app as a single service. The Express backend serves the built React frontend and static images directly.

1. Push your repository to GitHub.
2. Create a new **Web Service** on [Render.com](https://render.com) (or Railway).
3. Connect your GitHub repository.
4. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `unibites_campus_secure_jwt_secret_2026`
   - `PORT`: `5000` (or leave default for Render)
6. Click **Deploy Web Service**. Your app is live with full API, WebSockets, and UI!

### Option B: Split Deployment (Vercel Frontend + Render Backend)
- **Backend (Render):**
  - Root directory: `backend`
  - Build command: `npm install`
  - Start command: `npm start`
- **Frontend (Vercel):**
  - Root directory: `frontend`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment Variables in Vercel:
    - `VITE_API_URL`: `https://your-backend.onrender.com/api`
    - `VITE_SOCKET_URL`: `https://your-backend.onrender.com`

---

## 📄 License
ISC © UniBites Team
