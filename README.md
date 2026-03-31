# FundMate

FundMate is a full-stack web application that connects entrepreneurs, investors, mentors, and admins on a single platform. Entrepreneurs can showcase their startups, investors can discover and fund new ventures, and mentors can guide startups to success. The project is divided into two main parts: a React + Vite frontend and a Node.js/Express + PostgreSQL backend.

---

## Features

- User authentication (signup/login) with roles: Entrepreneur, Investor, Mentor, Admin
- Role-based dashboards for each user type
- Secure JWT-based authentication
- PostgreSQL database with Sequelize ORM
- Modern UI with React, Tailwind CSS, and Vite
- RESTful API for user management

---

## Project Structure

```
FUNDMATE/
  backend/      # Node.js/Express API server
  frontend/     # React + Vite client app
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your database credentials:
   ```env
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   ADMIN_SECRET=your_admin_secret
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` by default.

---

## Usage
- Register as an entrepreneur, investor, mentor, or admin (admin requires a secret key).
- Log in to access your role-specific dashboard.
- Entrepreneurs can showcase startups, investors can browse and invest, mentors can offer guidance, and admins can manage users/startups.

---

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express, Sequelize, PostgreSQL, JWT, bcrypt

---


