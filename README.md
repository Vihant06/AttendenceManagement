# Attendance Management System (Simple University Project)

This is a beginner-friendly full-stack Attendance Management System.

## Tech Stack
- Frontend: React.js, React Router, Context API
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)

## Folder Structure
- `frontend/` React app
- `backend/` Express API + MongoDB models

## Setup Instructions

### 1) Backend setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2) Seed demo users
In another terminal:
```bash
cd backend
node seed.js
```

Demo logins:
- Teacher: `teacher@example.com` / `123456`
- Student: `student1@example.com` / `123456`

### 3) Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

## Required API Endpoints
- `POST /login`
- `GET /students`
- `POST /attendance`
- `GET /attendance`

## Notes
- Authentication is intentionally simple for learning purpose.
- Passwords are plain text in this demo (not for production).
