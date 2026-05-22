# FundMate

FundMate is a full-stack web application that connects entrepreneurs, investors, mentors, and admins in one platform. Entrepreneurs can create startup profiles, investors can browse startups and sign NDAs, and mentors can support founders through real-time chat and mentorship.

---

## Features

- User authentication with role-based access: Entrepreneur, Investor, Mentor, Admin
- Real-time chat powered by Socket.IO
- NDA signing workflow for investors to view confidential startup details
- Startup profile creation and editing for entrepreneurs
- Mentor requests, approved mentee connections, and one-on-one messaging
- Secure JWT-based authorization and PostgreSQL data storage via Sequelize
- Responsive React UI with Vite and Tailwind CSS

---

## Project Structure

```
FUNDMATE/
  backend/      # Node.js/Express API server with Socket.IO and PostgreSQL
  frontend/     # React + Vite client application
```

---

## Getting Started

### Prerequisites
- Node.js v18 or newer
- npm
- PostgreSQL database

### Backend Setup

1. Open a terminal and go to the backend folder:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `backend/` with the following values:
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
5. The API and Socket.IO server will be available at `http://localhost:5000`.

### Frontend Setup

1. Open a second terminal and go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. The app should open at `http://localhost:5173`.

---

## Usage

- Sign up or log in with an existing account.
- Entrepreneurs can create and manage startup profiles.
- Investors can browse startups, sign NDAs, and view protected startup details.
- Mentors can connect with entrepreneurs and participate in mentorship chat.
- Admins can manage platform users and review startup profiles.

---

## Available Scripts

### Backend
- `npm run dev` - start backend with nodemon
- `npm start` - run backend using Node

### Frontend
- `npm run dev` - start the Vite development server
- `npm run build` - build the production frontend bundle
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint

---

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Axios, React Router, Socket.IO Client
- **Backend:** Node.js, Express, Sequelize, PostgreSQL, Socket.IO, JWT, bcrypt

---

## Notes

- The backend automatically syncs database models at startup.
- Investors must sign an NDA before viewing confidential startup details.
- The chat feature uses socket events for real-time messaging and typing indicators.

---


