# Vauza Hotel POS - Complete System Documentation

**Version:** 2.0 (Slate Design System)
**Last Updated:** 2026-01-16
**Status:** Operational

This document provides a comprehensive guide to all features, pages, functions, and processes currently available in the Vauza Hotel POS system.

---

## 1. Authentication
**Page:** `Login.jsx`

*   **Process:**
    *   User enters Username and Password.
    *   System authenticates against the backend.
    *   On success: Redirects to Dashboard.
    *   On failure: Displays error message with "Shake" animation.
*   **Design:**
    *   Glassmorphism card effect with `slate-50` background.
    *   Animated gradient logo.
    *   Secure password toggle visibility.

---

## 2. Dashboard
**Page:** `Dashboard.jsx`

*   **Features:**
    *   **Welcome Card:** Personalized greeting with "Currency Mode" toggle (IDR/SAR).
    *   **Smart Alerts:**
        *   **Overdue Payments:** Highlights reservations past deadline (Red).
        *   **Due Soon:** Highlights deadline within 4 days (Amber).
        *   Auto-calculates days remaining and amount due.
    *   **Statistics Stats:**
        *   Total Clients, Partner Hotels, Active Reservations.
        *   Nusuk Agreements, Supply Confirmation Letters.
        *   **Revenue:** Toggles between IDR and SAR based on selection.
    *   **Recent Activity Tables:**
        *   Shows last 5 entries for Clients, Hotels, Reservations, and Payments.
        *   Visual "Show Deleted" toggle to view soft-deleted records.

---

## 3. Master Data Management

### Clients
**Page:** `Clients.jsx`
*   **Features:**
    *   **View:** List all clients with modern badges.
    *   **Create:** "New Client" modal (Name, Phone, Email, Status).
    *   **Edit:** Modify client details inline.
    *   **Soft Delete:** Mark clients as deleted (recoverable via "Show Deleted").
    *   **Search/Filter:** Real-time filtered search.

### Hotels
**Page:** `Hotels.jsx`
*   **Features:**
    *   **View:** List all partner hotels with city badges.
    *   **Create:** Input Name, City (Makkah/Madinah), Contact Info.
    *   **Edit/Delete:** Update details or soft delete.

---

## 4. Reservations Management
**Page:** `Reservations.jsx`

### Core Workflow
1.  **Create Reservation:**
    *   Menu: `Reservations` > **+ New Reservation**
    *   **Inputs:**
        *   **Meta:** Reservation No, Client, Hotel, Meal Type.
        *   **Dates:** Check-in / Check-out (Auto-calculates Stay Nights).
        *   **Rooms:** Quantity x Rate (Double, Triple, Quad, Extra).
        *   **Calculations:** System auto-sums `Total Amount`.
        *   **Note:** Add internal notes for staff.
    *   **Submit:** Saves to Google Sheet database.

2.  **Edit Reservation:**
    *   Click **Edit (Pencil)** icon.
    *   **Modify Dates:** Changing dates triggers auto-recalculation of Stay Nights and Totals (if rates apply per night).
    *   **Modify Status:**
        *   **Amend:** Mark reservation as undergoing changes (Purple badge).
        *   **Upgraded:** Mark as upgraded service (Blue badge).
    *   **Modify Note:** Update special instructions.

3.  **Status Workflow:**
    *   `Tentative` -> `Definite` -> `Full Payment`.
    *   **Visuals:** Color-coded pill badges for instant status recognition.

---

## 5. Supply Management
**Page:** `Supply.jsx`

*   **Purpose:** Track supplier costs and upload Confirmation Letters (CL) from vendors.
*   **Features:**
    *   **Create Supply CL:**
        *   Link to Vendor and Reservation No.
        *   **Cost Input:** Room Quantities x Buying Rates.
        *   **Auto-Calc:** Total Cost Amount (SAR).
        *   **Upload:** Attach PDF/Image of the official CL file.
    *   **Visuals:**
        *   Clean "Pill" form inputs.
        *   Table view with "View File" execution.

---

## 6. Payment Processing
**Page:** `Payments.jsx`

*   **Workflow:**
    1.  **Record Payment:**
        *   Click **+ New Payment**.
        *   Select Client and Reservation.
        *   Input **Amount** (IDR or SAR).
        *   **Proof:** Upload payment proof (Image/PDF).
        *   **Status Tag:** New, Verified, etc.
    2.  **Tracking:**
        *   Table shows Date, Amount, Currency, and Status.
        *   System updates the "Paid Amount" on the main Reservation record.
    3.  **Receipt Generation:**
        *   Click **Print Receipt** (Printer Icon) on a payment row.
        *   Opens `PaymentReceipt.jsx`.

---

## 7. Operational Compliance (Nusuk)
**Page:** `NusukAgreement.jsx`

*   **Purpose:** Manage Ministry of Hajj & Umrah (Nusuk) compliance status for each reservation.
*   **Features:**
    *   **Auto-Sync:** Pulls all active reservations.
    *   **Input:**
        *   **Nusuk No:** Manual entry of the permit number.
        *   **Status:** Dropdown (Blank, Waiting Approval, Approved, Rejected).
    *   **Real-time Save:** Updates propagate instantly to the database.
    *   **Visuals:** Color-coded status dropdowns.

---

## 8. Documentation & Printing

### Confirmation Letter
**Page:** `ConfirmationLetter.jsx`
*   **Trigger:** Click "Print CL" on Reservation table.
*   **Content:**
    *   Official Company Header & Logo.
    *   Guest Details, Hotel, Check-in/Out.
    *   Room Configuration Table.
    *   Terms & Conditions (legal text).
    *   Manager Signature.
*   **Format:** Optimized for A4 PDF printing.

### Payment Receipt
**Page:** `PaymentReceipt.jsx`
*   **Trigger:** Click "Print Receipt" on Payment table.
*   **Content:**
    *   Official Receipt Header.
    *   Amount Paid (IDR & SAR).
    *   Bank Account Details.
    *   Payment Status.
    *   Signature.

---

## 9. Technical Specifications

### Tech Stack
*   **Frontend:** React (Vite), Tailwind CSS (Slate Theme), Lucide Icons.
*   **Backend:** Node.js (Express).
*   **Database:** Google Sheets (via Google API Service Account).

### Global Functions
*   **Soft Delete:** Records are flagged as `tag_status = 'delete'` rather than physically removed, allowing recovery view (`Show Deleted` toggle).
*   **Auto-Calculation:** Frontend hooks automatically compute `(Rooms * Rates) * Nights` to minimize human error.
*   **Responsive Design:** "Slate" design system ensures readability on Desktop and Tablet.

### Design System (2025 Refreh)
*   **Palette:** `Slate-50` (Backgrounds), `Slate-200` (Borders), `Primary` (Brand Color).
*   **Typography:** `Montserrat` (Google Fonts).
*   **Components:** Rounded-XL cards, Pill-shaped inputs, Glassmorphism headers.
*   **Feedback:** Toast notifications for success/error actions.
