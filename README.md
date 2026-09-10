# InsureFin - Insurance & Finance Management System

**Academic Full-Stack Pair Programming Project**  
*A vibrant, modern, clean, and robust web application for insurance policy administration, premium collections, KYC verification, and claim adjudication.*

> **Brand**: **InsureFin**  
> **Tagline**: *Simple. Secure. Smarter Insurance Management.*

---

## 1. Abstract
> "To develop a web-based Insurance and Finance Management System that enables efficient management of insurance policies, premium payments, customer records, and claim processing through a secure, vibrant, and user-friendly platform."

---

## 2. Technology Stack

### Frontend:
- **React.js** (v19 with Vite) – Clean component-based Single Page Application
- **React Router** (v7) – Protected client-side routing with role-based access control
- **Axios** – Central API client with automatic JWT bearer token interceptors
- **Vibrant InsureFin Design System** – Light modern background (`#f8fafc`), crisp elevated cards, royal blue and violet accents, country flag selectors, responsive drawer navigation
- **Lucide React** – Clean iconography

### Backend:
- **Node.js & Express.js** – RESTful API architecture
- **JWT (jsonwebtoken)** – Stateless session token generation and verification
- **bcryptjs** – Industry-standard password hashing (salt rounds: 10)
- **CORS & Dotenv** – Environment configuration and cross-origin sharing

### Database:
- **MySQL** – Relational database with foreign key constraints
- **mysql2/promise** – Connection pool with automatic table initialization and zero-config fallback store

---

## 3. Key Enhancements & Features

1. **New Vibrant Visual Design**:
   - Clean light palette with modern elevation shadows and cards.
   - Dynamic role badges and clear status indicators (Active, Pending, Under Review, Settled, Rejected).
2. **Country & Automatic Calling Code Selector**:
   - Country dropdown with flag emojis (India 🇮🇳, United States 🇺🇸, Canada 🇨🇦, United Kingdom 🇬🇧, Australia 🇦🇺, UAE 🇦🇪, Singapore 🇸🇬, Germany 🇩🇪, France 🇫🇷, Japan 🇯🇵).
   - Automatically synchronizes dial code (`+91`, `+1`, `+44`, `+971`, etc.) so the user does not have to type it manually.
3. **Split-Screen Modern Login**:
   - Hero banner with feature highlights (✓ Manage Policies, ✓ Pay Premiums, ✓ Track Claims).
   - Role switcher (`Client`, `Staff`, `Admin`) and 1-click demo viva credentials helper.
4. **Interactive Profile Dossier**:
   - Hero banner with avatar, KYC badge, contact info, and an interactive "Edit Profile" modal.
5. **Three Distinct Portals**:
   - **Admin Portal (`/admin/*`)**: Executive Dashboard, User Management (CRUD), Client Records & KYC verification, Staff Management, Policy Management, Payment Oversight, Claims Processing, Finance Ledger, and Printable Reports.
   - **Staff Portal (`/staff/*`)**: Underwriting Dashboard, Policy Reviews, Customer Dossiers, Payment Records, and Claims Processing & Settlement.
   - **Client Portal (`/client/*`)**: Policyholder Dashboard, Profile & KYC view, Browse Insurance Catalog, Enrolled Policies, Premium Payment with simulated gateway & instant tax receipts, File a Claim, Claims Tracker with remarks, and Personal Transactions Ledger.

---

## 4. Demo Testing Credentials

| Role | Email | Password | Quick-Fill Button on Login |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@gmail.com` | `123456` | Click **"Admin"** |
| **STAFF** | `staff@gmail.com` | `123456` | Click **"Staff"** |
| **CLIENT** | `rahul@gmail.com` | `123456` | Click **"Client"** |

*(You can also register brand-new accounts with any country on `/register`).*

---

## 5. How to Run the Project

1. **Start both Backend and Frontend**:
   ```powershell
   npm.cmd run dev
   ```
2. **Access the Application**:
   - **Frontend UI**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000/api`
3. **Run Automated Test Suite**:
   ```powershell
   npm.cmd test
   ```
