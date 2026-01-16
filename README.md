# Vauza Hotel POS - System v2.0

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Status](https://img.shields.io/badge/status-operational-success.svg)
![Tech](https://img.shields.io/badge/stack-MERN%20Lite-orange.svg)

A comprehensive, modern Point of Sale (POS) and Management System developed for Vauza Tamma Abadi. Designed to streamline hotel operations, handle reservations, manage payments, and ensure compliance with Nusuk regulations.

**Version 2.0 Update:** Features a completely redesigned "Slate" Design System for a premium, clean, and professional user experience, along with enhanced operational workflows.

---

## 📚 Documentation Resources

- **[📖 User Documentation](documentation.md)**: Full guide on how to use every feature (Reservations, Payments, Printing, etc.).
- **[🔄 Business Process](business_process.md)**: End-to-end workflow diagrams (Swimlane) and logic explanations.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** [React](https://react.dev/) (Vite)
- **Design System:** Custom "Slate" Theme (Tailwind CSS)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animation:** CSS Transitions & Glassmorphism effects
- **State Management:** React Hooks (`useState`, `useEffect`, Custom `useTable`)
- **HTTP Client:** Axios (Interceptors for Auth)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** Google Sheets API (Server-side relational mapping)
- **Storage:** Google Drive API (Secure file storage for Receipts/CLs)
- **Auth:** JWT (JSON Web Tokens) with Secure HTTP-only cookies

---

## ✨ Key Features (v2.0)

### 1. 📊 Modern Dashboard
- **Smart Alerts:** Auto-detection of overdue payments types (Red/Amber).
- **Live Stats:** Real-time metrics for Revenue (IDR/SAR), Active Reservations, and Clients.
- **Recent Activity:** Quick view of the latest 5 records for all modules.

### 2. 🏨 Reservation Management
- **Smart Booking Engine:** Handles Room Types (Double, Triple, Quad), Rates, and Meal Plans.
- **Auto-Calculations:** Automatically computes Stay Nights and Total Amounts based on dates and rates.
- **Status Workflow:** `New` -> `Tentative` -> `Definite` -> `Paid` with visual pill badges.
- **Dynamic Editing:** Edit dates, status (Amend/Upgraded), or notes with instant system recalculations.

### 3. 💳 Payment Processing
- **Multi-Currency:** Supports IDR and SAR payments.
- **Proof of Payment:** Upload and store receipts securely in Google Drive.
- **Receipt Generation:** One-click PDF generation of official Payment Receipts.

### 4. 🔗 Supply Chain Management
- **Vendor Tracking:** Manage Supplier Confirmation Letters (CL).
- **Cost Analysis:** Track Buying Rates vs Selling Rates.
- **Document Management:** Upload and view vendor PDFs directly from the app.

### 5. 🕌 Regulatory Compliance (Nusuk)
- **Agreement Tracking:** Monitor Nusuk permit numbers and approval statuses.
- **Real-time Updates:** Instant status changes (Waiting, Approved, Rejected).

### 6. 🖨️ Documentation & Printing
- **Confirmation Letters:** Generate professional Booking Confirmations for clients/hotels.
- **Payment Receipts:** Official transaction proofs.
- **Print-Optimized:** Custom CSS media queries for perfect A4 printing.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm (Node Package Manager)
- Google Cloud Service Account Credentials (`google-service-account.json`)

### 1. Backend Setup
```bash
cd vauza-hotel-backend
npm install
```
**Environment Variables (.env):**
```env
PORT=3000
JWT_SECRET=your_secure_secret
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_CLIENT_ID=oauth_client_id
GOOGLE_CLIENT_SECRET=oauth_client_secret
GOOGLE_REFRESH_TOKEN=oauth_refresh_token
```
**Start Server:**
```bash
npm start
```

### 2. Frontend Setup
```bash
cd vauza-hotel-frontend
npm install
```
**Start App:**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## 📂 Project Structure

```bash
vauza-hotel-pos/
├── vauza-hotel-frontend/     # React Application (Vite)
│   ├── src/
│   │   ├── pages/            # Modules (Dashboard, Reservations, etc.)
│   │   ├── components/       # UI Library (StatCard, StatusBadge, etc.)
│   │   ├── services/         # API Layer (Axios)
│   │   ├── layouts/          # Dashboard & Print Layouts
│   │   └── assets/           # Images & Logos
│   └── index.css             # GLOBAL TAILWIND & THEME STYLES
│
└── vauza-hotel-backend/      # Node.js API Server
    ├── src/
    │   ├── routes/           # REST API Controllers
    │   ├── server.js         # App Entry Point & Middleware
    │   └── services/         # Google APIs (Drive, Sheets)
    └── credentials/          # Service Account Keys (Ignored by Git)
```

---

## 🔐 Security & Permissions
- **Authentication:** All routes are protected via JWT Middleware.
- **Role Base:** (Future Roadmap) Admin vs Staff access.
- **Data Safety:** Soft Delete implementation prevents accidental permanent data loss.

---

## 📝 License
Proprietary software developed for **Vauza Tamma Abadi**. Unauthorized distribution is prohibited.
