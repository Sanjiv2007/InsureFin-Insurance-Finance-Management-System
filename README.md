InsureFin — Insurance and Finance Management System

A full-stack web application for managing insurance policies, premium payments, claims, users, and financial transactions through a centralized platform.

InsureFin provides separate role-based interfaces for Clients, Staff, and Administrators, allowing each user type to perform operations according to their responsibilities.

---

1. Project Purpose

InsureFin is designed to simplify and centralize insurance and finance-related operations.

The system allows clients to:

- Register and log in
- Browse available insurance plans
- Apply for insurance policies
- View subscribed policies
- Track premium payments
- File and track insurance claims
- View financial transactions
- Manage profile information

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
Database| MongoDB
Authentication| JWT
Password Security| bcrypt
Version Control| Git, GitHub
Deployment| GitHub Pages

The intended architecture follows the MERN-style approach:

MongoDB + Express.js + React.js + Node.js

MongoDB provides the database layer, Express and Node.js provide the application/server layer, and React provides the presentation layer.

---

3. Main Modules

Client Module

Clients can:

- Create an account
- Log in
- Browse insurance plans
- Apply for policies
- View active policies
- Track premium payments
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
2| Authentication| Login for Client, Staff and Admin
3| Role-Based Access| Different permissions for each role
4| Insurance Browsing| View available insurance plans
5| Policy Management| Apply for and manage policies
6| Premium Payments| Record and track premium payments
7| Claims| File and track insurance claims
8| Transactions| View financial transaction history
9| Staff Review| Review assigned policies and claims
10| Admin Management| Manage users, policies and claims
11| Dashboards| Role-specific dashboards
12| Reports| Administrative reporting
13| Search & Filtering| Search and filter records
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

┌──────────────────────────────┐
│            Users             │
│ Client | Staff | Admin       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      React + Vite Frontend   │
│        User Interface        │
└──────────────┬───────────────┘
               │
               │ Axios / REST API
               ▼
┌──────────────────────────────┐
│     Node.js + Express API    │
│ Authentication & Business    │
│ Logic / Authorization        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           MongoDB            │
│ Users | Policies | Claims    │
│ Payments | Transactions      │
└──────────────────────────────┘

---

7. Authentication & Security

InsureFin includes several basic security mechanisms.

JWT Authentication

JSON Web Tokens are used to maintain authenticated sessions and identify logged-in users when communicating with protected APIs.

Password Hashing

Passwords are protected using bcrypt hashing rather than storing passwords as plain text.

Role-Based Authorization

Access is separated into:

- "CLIENT"
- "STAFF"
- "ADMIN"

Each role has access to its appropriate modules and dashboard.

Input Validation

Important registration and login fields are validated before requests are processed.

Environment Variables

Sensitive configuration such as database connection information and application secrets should be stored using environment variables rather than directly in source code.

CORS

Cross-Origin Resource Sharing is configured so that the frontend can communicate with the backend API.

Database Security

MongoDB supports authentication, authorization and other security mechanisms for protecting database deployments.

---

8. MongoDB Database Design

The database layer is designed around the major entities of the insurance system.

Expected MongoDB collections include:

users
policies
claims
payments
transactions

MongoDB stores data as flexible documents inside collections.

This document-oriented structure is suitable for applications where the data model can evolve as additional insurance features are introduced.

---

9. Main Data Flow

User
  ↓
React Frontend
  ↓
Axios Request
  ↓
Express REST API
  ↓
Authentication / Authorization
  ↓
Business Logic
  ↓
MongoDB
  ↓
API Response
  ↓
React Interface

The system follows this flow for major operations such as:

- Login
- Registration
- Policy application
- Premium payment
- Claim submission
- Transaction tracking

---

10. Technical Concepts Used

Frontend

- React components
- React Router
- State management
- Form handling
- API integration using Axios
- Responsive UI

Backend

- Node.js
- Express.js
- REST APIs
- Middleware
- Authentication
- Role-based authorization
- Error handling

Database

- MongoDB
- Collections
- Documents
- CRUD operations
- Database queries

Security

- JWT
- bcrypt
- Input validation
- Environment variables
- CORS
- Role-based access control

---

11. Project Structure

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
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   └── server.js
│
├── .gitignore
├── package.json
└── README.md

---

12. Running the Application

Prerequisites

Install:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git

Clone Repository

git clone https://github.com/Sanjiv2007/InsureFin-Insurance-Finance-Management-System.git

cd InsureFin-Insurance-Finance-Management-System

Install Dependencies

npm install

Install frontend dependencies:

cd client
npm install
cd ..

---

13. MongoDB Configuration

For the MongoDB implementation, configure the MongoDB connection using an environment variable.

Example:

MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
PORT=5000
JWT_SECRET=your_secret_key

The MongoDB connection string should be kept private and should not be committed to GitHub.

MongoDB's official Node.js documentation recommends using a connection URI and keeping connection credentials secure.

---

14. Running the Backend

From the project root:

npm run server

Backend:

http://localhost:5000

API base URL:

http://localhost:5000/api

---

15. Running the Frontend

Open another terminal:

npm run client

Frontend:

http://localhost:5173

Open the application in a browser:

http://localhost:5173

---

16. Demo Credentials

For academic demonstration:

Role| Email| Password
Admin| admin@gmail.com| 123456
Staff| staff@gmail.com| 123456
Client| rahul@gmail.com| 123456

The Login page also provides Demo Credentials Quick-Fill buttons.

«These credentials are for academic demonstration purposes only.»

---

17. Deployment

The React frontend has been deployed using GitHub Pages.

https://sanjiv2007.github.io/InsureFin-Insurance-Finance-Management-System/

The GitHub Pages deployment hosts the frontend.

The complete full-stack application requires the backend API and MongoDB database to be available separately.

---

18. Current Review-Stage Database Plan

The project is being transitioned from the initial database implementation to MongoDB as the target database for the final version.

The review presentation and project architecture use MongoDB as the intended database layer.

The database migration will be completed after the review without changing the main frontend workflow or application modules.

---

19. Limitations

The current project is primarily an academic implementation.

Current limitations include:

- Backend is not hosted publicly with the GitHub Pages frontend
- Payment processing is an academic workflow rather than a production payment gateway
- Production-level monitoring is not implemented
- Advanced authentication such as 2FA is not currently included
- MongoDB migration is part of the next implementation stage

---

20. Future Enhancements

Possible improvements include:

- Complete MongoDB integration
- Cloud deployment of the backend
- MongoDB Atlas deployment
- Real payment gateway integration
- Email and SMS notifications
- Claim document uploads
- Advanced analytics
- Two-factor authentication
- Improved audit logging
- Production-level monitoring
- Mobile application support

---

21. Project Outcome

InsureFin demonstrates the development of a full-stack insurance and finance management platform.

The system combines:

React
   ↓
REST APIs
   ↓
Node.js + Express
   ↓
MongoDB

with authentication and role-based access control.

The application provides a structured workflow for:

- Insurance policies
- Premium payments
- Claims
- Users
- Financial transactions

---

22. Conclusion

InsureFin provides a centralized approach to insurance and finance management.

The project demonstrates important full-stack development concepts including:

- Frontend development
- REST API development
- Database management
- Authentication
- Authorization
- Password security
- Role-based workflows
- API communication

The system can be further developed into a production-ready insurance management platform through cloud deployment, real payment processing, advanced security, notifications and analytics.
