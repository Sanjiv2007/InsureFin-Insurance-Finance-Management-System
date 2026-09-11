InsureFin — Insurance and Finance Management System

A full-stack web application for managing insurance policies, premium payments, claims, users, and financial transactions through a centralized platform.

InsureFin provides separate role-based interfaces for Clients, Staff, and Administrators, allowing each user type to perform the operations relevant to their responsibilities.

---

1. Project Purpose

InsureFin is designed to simplify and centralize insurance and finance-related operations.

The system allows clients to:

- Register and log in securely
- Browse available insurance plans
- Apply for insurance policies
- View subscribed policies
- Track premium payments
- File and track insurance claims
- View financial transaction history

Staff members can review assigned policies and claims, while administrators can manage users, policies, claims, payments, and reports.

The project demonstrates the integration of a modern frontend, REST API backend, database management, authentication, and role-based access control.

---

2. Technologies Used

Layer| Technology
Frontend| React.js, Vite
Styling| CSS
UI Icons| Lucide React
Routing| React Router
API Communication| Axios
Backend| Node.js, Express.js
Database| MySQL
Authentication| JWT
Password Security| bcrypt
Version Control| Git, GitHub
Frontend Deployment| GitHub Pages

---

3. Main Modules

Client Module

Clients can:

- Create an account
- Log in
- Browse insurance plans
- Apply for policies
- View active policies
- Make premium payments
- File insurance claims
- Track claim status
- View transactions
- Manage profile information

Staff Module

Staff members can:

- View assigned policies
- Review policy applications
- View assigned claims
- Review claims
- Track claim status
- Monitor premium payment information

Admin Module

Administrators can:

- Manage users
- Manage clients and staff
- Manage insurance policies
- Review policy applications
- Manage claims
- Monitor premium payments
- View financial information
- Generate management reports

---

4. Key Features

#| Feature| Description
1| User Registration| New clients can create an account
2| Authentication| Secure login for Client, Staff and Admin roles
3| Role-Based Access| Different dashboards and permissions for each role
4| Insurance Browsing| View available insurance categories and plans
5| Policy Management| Apply for and manage insurance policies
6| Premium Payments| Record and track premium payments
7| Claims| File and track insurance claims
8| Transactions| View financial transaction history
9| Staff Review| Staff can review assigned policies and claims
10| Admin Management| Admin can manage users, policies and claims
11| Dashboards| Role-specific dashboards with key statistics
12| Reports| Administrative reports and policy information
13| Search & Filtering| Search and filter users and policy records
14| Profile Management| Manage user profile information

---

5. Role-Based Workflow

Client

Register / Login
       ↓
Client Dashboard
       ↓
Browse Insurance
       ↓
Apply for Policy
       ↓
Policy Management
       ↓
Premium Payment
       ↓
File Claim
       ↓
Track Claim & Transactions

Staff

Staff Login
     ↓
Staff Dashboard
     ↓
Assigned Policies
     ↓
Review Applications
     ↓
Assigned Claims
     ↓
Review / Update Claims

Admin

Admin Login
     ↓
Admin Dashboard
     ↓
Users / Policies / Claims
     ↓
Payments & Transactions
     ↓
Reports & Management

---

6. System Architecture

InsureFin follows a client-server full-stack architecture.

┌─────────────────────────────┐
│          Users              │
│ Client | Staff | Admin      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     React + Vite Frontend   │
│       User Interface        │
└──────────────┬──────────────┘
               │ Axios / REST API
               ▼
┌─────────────────────────────┐
│    Node.js + Express API    │
│ Authentication & Business   │
│ Logic / Authorization       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          MySQL              │
│ Users | Policies | Claims   │
│ Payments | Transactions     │
└─────────────────────────────┘

---

7. Authentication & Security

The application includes basic authentication and authorization mechanisms.

Authentication

- Login using email and password
- JWT-based authentication
- Authenticated user session management

Password Security

- Passwords are hashed using bcrypt
- Plain-text passwords are not intended to be stored in the database

Role-Based Authorization

The system separates access based on:

- "CLIENT"
- "STAFF"
- "ADMIN"

Users are redirected to their respective dashboards after successful authentication.

Validation

The application validates important registration and login fields before processing requests.

---

8. Database

The application uses MySQL for persistent data management.

The main data areas include:

- Users
- Clients
- Policies
- Claims
- Payments
- Transactions

These entities support the complete insurance workflow from registration and policy application to payments and claims.

---

9. Project Structure

InsureFin-Insurance-Finance-Management-System/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── client/
│   │   │   ├── staff/
│   │   │   └── admin/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── database.sql
│   ├── seed.js
│   └── server.js
│
├── .gitignore
├── package.json
└── README.md

---

10. Project Setup

Prerequisites

Install the following:

- Node.js
- npm
- MySQL
- Git

---

Clone the Repository

git clone https://github.com/Sanjiv2007/InsureFin-Insurance-Finance-Management-System.git

Navigate to the project:

cd InsureFin-Insurance-Finance-Management-System

---

11. Install Dependencies

Install the root dependencies:

npm install

Install frontend dependencies:

cd client
npm install

Return to the project root:

cd ..

---

12. Database Setup

Make sure MySQL is installed and running.

Create the database:

CREATE DATABASE insurance_finance;

Configure the database connection using environment variables.

Example:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=insurance_finance
DB_PORT=3306

The backend uses these values to connect to MySQL.

---

13. Running the Application

Start the Backend

From the project root:

npm run server

The backend runs on:

http://localhost:5000

API base URL:

http://localhost:5000/api

Start the Frontend

Open another terminal:

npm run client

The frontend runs on:

http://localhost:5173

Open the application in a browser:

http://localhost:5173

---

14. Demo Login

For local demonstration, the application provides demo credentials.

Role| Email| Password
Admin| admin@gmail.com| 123456
Staff| staff@gmail.com| 123456
Client| rahul@gmail.com| 123456

The Login page also provides Demo Credentials Quick-Fill buttons for convenient testing.

«These credentials are intended for academic demonstration purposes.»

---

15. Frontend Deployment

The frontend has been deployed using GitHub Pages.

Live frontend:

https://sanjiv2007.github.io/InsureFin-Insurance-Finance-Management-System/

The GitHub Pages deployment hosts the frontend only.

The complete full-stack application requires the Node.js backend and database to be available separately.

---

16. Important Project Limitation

The current GitHub Pages deployment is frontend-only.

The backend API runs locally during development:

Frontend → http://localhost:5173
Backend  → http://localhost:5000
Database → MySQL

Therefore, the deployed GitHub Pages frontend should not be considered a complete public production deployment of the backend and database.

For full functionality during development and demonstration, run the frontend and backend locally.

---

17. Future Enhancements

Possible future improvements include:

- Cloud deployment of the backend
- Cloud-hosted database
- Real payment gateway integration
- Email and SMS notifications
- Document upload for claims
- Advanced analytics and dashboards
- Two-factor authentication
- Improved audit logging
- Production-level security and monitoring
- Mobile application support

---

18. Project Outcome

InsureFin demonstrates how a full-stack application can be used to manage insurance and financial operations through a centralized platform.

The project integrates:

React
   ↓
REST APIs
   ↓
Node.js + Express
   ↓
MySQL

with authentication and role-based access for Clients, Staff and Administrators.

The application provides a structured workflow for insurance policies, premium payments, claims and financial transactions in a single system.

---

19. Conclusion

InsureFin provides a centralized and user-friendly approach to insurance and finance management.

By combining a React frontend, Node.js/Express backend, MySQL database, authentication and role-based access control, the system demonstrates the major concepts involved in full-stack web application development.

The project can be further extended into a production-ready insurance management platform by adding cloud deployment, real payment processing, advanced security and additional automation.
