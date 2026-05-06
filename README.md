# ResumeAI — Resume Analyzer & Builder

A full-stack web application that analyzes resumes against job descriptions and helps build ATS-optimized resumes.

**Tech Stack:** Next.js · Express.js · Node.js · MongoDB

---

## 📁 Folder Structure

```
resume_analyzir/
├── backend/          # Express.js REST API
│   ├── server.js
│   ├── config/       # MongoDB connection
│   ├── models/       # User, Analysis, Resume (Mongoose)
│   ├── routes/       # auth, analyze, builder
│   ├── middleware/   # JWT auth
│   ├── utils/        # extractor, scorer, skills, suggestions
│   └── sample_resume.txt
│
└── frontend/         # Next.js 14 App Router
    ├── app/
    │   ├── page.js           # Home
    │   ├── analyzer/         # Upload & analyze
    │   ├── results/          # Results dashboard
    │   ├── builder/          # Resume Builder
    │   └── auth/             # Login / Register
    ├── components/
    │   └── Navbar.js
    └── styles/globals.css
```

---

## ⚡ Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment config
copy .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume_analyzir
JWT_SECRET=your_secret_key_here
```

Start the server:
```bash
npm run dev
# → http://localhost:5000
# → Test: http://localhost:5000/api/health
```

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:3000
```

---

## 🚀 Features

| Feature | Description |
|---|---|
| **Resume Upload** | PDF, DOCX, TXT (up to 10MB) |
| **ATS Scoring** | 0–100 score: keywords (40pts), skills (30pts), structure (20pts), length (10pts) |
| **Keyword Match** | NLP-based keyword matching with JD |
| **Skill Detection** | 200+ skills across 10 categories |
| **Missing Skills** | Highlights JD skills absent from resume |
| **Suggestions** | Actionable improvement tips with severity levels |
| **Resume Builder** | 6-section guided form → ATS-friendly PDF resume |
| **Dark/Light Mode** | Toggle between themes |
| **User Auth** | JWT-based register/login |

---

## 🧪 Testing

Use the sample resume at `backend/sample_resume.txt` to test the analyzer.

Sample Job Description to paste:
```
We are looking for a Full Stack Developer with experience in React, Node.js, 
MongoDB, AWS, and Docker. The ideal candidate should have 2+ years of experience 
building scalable REST APIs, working with CI/CD pipelines, and deploying to 
cloud platforms. Strong knowledge of TypeScript, GraphQL, and Redis is a plus.
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/analyze` | Analyze resume (multipart form) |
| GET | `/api/analyze/:id` | Get analysis by ID |
| POST | `/api/builder/save` | Save built resume |
| GET | `/api/builder/:id` | Get saved resume |
| GET | `/api/health` | Health check |
