# Vauza Hotel POS

A comprehensive Hotel Point of Sale and Management System designed for simplified hotel operations, reservation tracking, payment management, and supply chain coordination.

## 🚀 Tech Stack

### Frontend
- **Framework:** [React](https://react.dev/) (Vite)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Components:** Custom reusable components (`Button`, `TableControls`, `StatusBadge`, `Tooltip`)
- **State Management:** React Hooks (`useState`, `useEffect`, Custom Hooks like `useTable`)
- **HTTP Client:** Axios

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** Google Sheets API (Acts as the primary database)
- **File Storage:** Google Drive API (For storing Receipts and Confirmation Letters)
- **Authentication:** JWT (JSON Web Tokens)
- **Environment:** Dotenv

---

## 📂 Project Structure

```bash
vauza-hotel-pos/
├── vauza-hotel-frontend/     # React Application
│   ├── src/
│   │   ├── pages/            # Core Modules (Dashboard, Reservations, Payments, Supply...)
│   │   ├── components/       # Shared UI Components
│   │   ├── services/         # API Integration
│   │   └── hooks/            # Custom Logic (useTable)
│   └── package.json
│
└── vauza-hotel-backend/      # Node.js API Server
    ├── src/
    │   ├── routes/           # API Endpoints (supply.js, payments.js, etc.)
    │   └── server.js         # Entry Point
    ├── server/
    │   └── services/         # Integrations (googleDrive.js)
    ├── .env                  # Environment Variables (Secrets)
    └── package.json
```

---

## ✨ Key Features

### 1. Dashboard
- Real-time overview of hotel metrics.
- **Payment Reminders**: Auto-alerts for payments due within 4 days or 15 days before check-in.
- **Stats**: Total Nusuk Agreements and Active Supply CLs.

### 2. Reservations
- Manage guest bookings with details like Room Types (Double, Triple, Quad).
- Auto-calculation of total amounts based on rates.
- Generate **Confirmation Letters (CL)** automatically.

### 3. Payments
- Track payments linked to reservations.
- Multilingual **Payment Receipts** (English/Indonesian).
- Upload proof of payment (PDF/Image) directly to Google Drive.
- Status tracking (Deposit, Full Payment).

### 4. Supply Chain (Supplier CL)
- Manage Supplier Confirmation Letters.
- Dedicated **Supplier Database** (Google Sheet `supplier`).
- Track Vendor, Hotel, Stay Nights (Auto-calculated), and Deal Rates.
- Upload Supplier CLs to Google Drive.

### 5. Nusuk Agreement
- Manage Nusuk contracts and agreements.
- Generate and track Agreement Numbers.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (Node Package Manager)
- A Google Cloud Service Account (JSON key) with access to Sheets and Drive APIs.

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd vauza-hotel-backend
npm install
```

**Environment Variables (`.env`)**:
Create a `.env` file in `vauza-hotel-backend/` with the following keys:
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
GOOGLE_SHEET_ID=your_google_sheet_id
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_oauth_refresh_token
```
*Note: Ensure `credentials/google-service-account.json` is present for direct Sheet access.*

**Run the Server**:
```bash
npm start
```

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd vauza-hotel-frontend
npm install
```

**Run the Application**:
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

---

## 📡 API Documentation (Backend)

The backend provides several key endpoints managed by Express Routers:

| Module | Route | Methods | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/auth` | `POST` | User Login & Token Generation |
| **Reservations** | `/reservations` | `GET, POST, PUT, DELETE` | Manage Booking Data |
| **Payments** | `/payments` | `GET, POST, PATCH` | Handle Payments & Uploads |
| **Supply** | `/supply` | `GET, POST, PUT, DELETE` | Supplier CL Management |
| **Clients** | `/clients` | `GET` | List Clients |
| **Hotels** | `/hotels` | `GET` | List Hotels |

### Google Drive Integration
The system uses `googleapis` to manage file uploads.
- **Token Refresh**: Uses `GOOGLE_REFRESH_TOKEN` to maintain long-term access without manual re-login.
- **Service**: `server/services/googleDrive.js` handles the OAuth2 flow and file upload logic.

---

## 📊 Database Schema (Google Sheets)

The project uses Google Sheets as a relational database substitute. Key Data Models:

**Supplier Sheet (`supplier!A:R`)**:
- **A**: Vendor
- **B**: No RSV
- **C**: ID Hotel
- **D**: Check In
- **E**: Check Out
- **F**: Stay Nights
- **P**: Total Amount
- **Q**: Link URL (File)
- **R**: Status (active/delete)

**Payments Sheet**:
- Tracks Client ID, Amount, Payment Date, Proof URL, and Status.

---

## 📝 License
Proprietary software developed for Vauza Hotel POS.
