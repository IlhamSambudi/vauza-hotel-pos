# Vauza Hotel POS - End-to-End Business Process

This document outlines the complete operational workflow of the Vauza Hotel POS system, from initial login to final documentation, detailing the interactions between the User (Staff) and the System.

## End-to-End Workflow Diagram

```mermaid
flowchart TD
    %% Styling
    classDef startend fill:#f9f,stroke:#333,stroke-width:2px;
    classDef action fill:#fff,stroke:#333,stroke-width:1px;
    classDef system fill:#e6f3ff,stroke:#333,stroke-width:1px,shape:rect;
    classDef decision fill:#ff9,stroke:#333,stroke-width:1px,shape:rhombus;
    classDef document fill:#e6fffa,stroke:#333,stroke-width:1px,shape:document;

    subgraph Pool ["Vauza Hotel POS Operations"]
        direction TB

        %% Login Phase
        subgraph P1 ["1. Authentication"]
            Start((Start)):::startend --> Login[User Login]:::action
            Login -.-> Auth[System Authenticates]:::system
            Auth -->|Success| Dash[Dashboard Access]:::action
        end

        %% Master Data Phase
        subgraph P2 ["2. Master Data"]
            Dash --> Choice1{Action?}:::decision
            Choice1 -->|Add Partner| AddClient[Add Client]:::action
            Choice1 -->|Add Property| AddHotel[Add Hotel]:::action
            AddClient -.-> SaveClient[Save to Clients DB]:::system
            AddHotel -.-> SaveHotel[Save to Hotels DB]:::system
            SaveClient & SaveHotel --> RSV_Start
        end

        %% Reservation Phase
        subgraph P3 ["3. Reservation"]
            RSV_Start(Ready for RSV):::startend --> InputRSV[Create Reservation\n(Client, Hotel, Rooms, Note)]:::action
            InputRSV -.-> CalcRSV[System Calculates Totals]:::system
            CalcRSV --> SaveRSV[Save to Reservations DB]:::system
        end

        %% Supply Phase
        subgraph P4 ["4. Supply Management"]
            SaveRSV --> AddSupply[Add Supplier / Supply CL]:::action
            AddSupply -.-> SaveSupply[Save Supply Data]:::system
        end

        %% Payment Phase
        subgraph P5 ["5. Payment"]
            SaveSupply --> MakePay[Make Payment\n(Amount, Currency)]:::action
            MakePay -.-> ProcPay[Update Payment Status]:::system
            ProcPay --> SavePay[Save Payment Record]:::system
        end

        %% Modification Phase
        subgraph P6 ["6. Modification"]
            SavePay --> EditRSV[Edit Reservation\n(Dates, Note, Status)]:::action
            EditRSV -.-> Recalc[Recalculate Totals]:::system
            Recalc --> UpdateRSV[Update Reservation DB]:::system
        end

        %% Documentation Phase
        subgraph P7 ["7. Documentation"]
            UpdateRSV --> DocChoice{Print?}:::decision
            DocChoice -->|Reservation| PrintCL[Print Confirmation Letter]:::action
            DocChoice -->|Payment| PrintRcpt[Print Payment Receipt]:::action
            PrintCL -.-> ViewCL[Generate CL View]:::document
            PrintRcpt -.-> ViewRcpt[Generate Receipt View]:::document
        end

        %% Nusuk Phase
        subgraph P8 ["8. Nusuk Management"]
            ViewCL & ViewRcpt --> UpdateNusuk[Update Nusuk Agreement\n(Nusuk No, Status)]:::action
            UpdateNusuk -.-> SaveNusuk[Update Nusuk DB]:::system
            SaveNusuk --> End((Process Complete)):::startend
        end
    end
```

## Detailed Process Steps

### 1. User Login
- User enters credentials.
- System validates and grants access to the Dashboard.

### 2. Master Data Management
- **Add Client**: Create new client profiles for agencies/partners.
- **Add Hotel**: Register partner hotels (e.g., Makkah/Madinah hotels).

### 3. Create Reservation
- Select Client and Hotel.
- Input Room configuration (Double, Triple, Quad) and Rates.
- Add system **Note** if required.
- System automatically calculates **Stay Nights** and **Total Amount**.

### 4. Supply Management
- Create a **Supply Confirmation Letter (CL)** linked to the Reservation.
- Record Vendor details and cost prices.

### 5. Payment Processing
- Record payments received against a reservation.
- Supports partial or full payments.
- System updates **Payment Status** (e.g., Unpaid -> Partial -> Full).

### 6. Edit Reservation
- Modify details such as Dates (Check-in/Check-out), Status (Amend, Upgraded), or Notes.
- System dynamically recalculates totals based on new dates/rooms.

### 7. Print Documentation
- **Confirmation Letter**: Official document for the client detailing the booking.
- **Payment Receipt**: Proof of payment for the transaction.

### 8. Update Nusuk
- Post-booking compliance step.
- Input **Nusuk Number** and update approval status (Waiting, Approved, Rejected).
