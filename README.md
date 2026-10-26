# N.D.R.N. Vidyalaya - Full-Stack Web Platform & Management System

> **N.D.R.N. Vidyalaya**  
> *Daulatyarpur, Madhoganj, Uttar Pradesh*  
> *UP Board • Nursery to Class 5*

This repository contains the full-stack web application and school management system for N.D.R.N. Vidyalaya, built with a modern React 18 frontend and a production-ready Node.js, Express, and MongoDB backend.

---

## 1. System Architecture

```text
NDRN website/
├── backend/                         # Node.js + Express + MongoDB Backend
│   ├── config/                      # Environment and Database Configuration
│   │   ├── db.js                    # Mongoose connection pool & health diagnostics
│   │   └── env.js                   # Validated environment settings
│   ├── controllers/                 # HTTP Request Handlers & Business Flow
│   ├── middleware/                  # Security, Auth, Validation, & Error Handlers
│   │   ├── authMiddleware.js        # JWT verification & role-based access control
│   │   ├── errorMiddleware.js       # Centralized error handler & 404 handler
│   │   ├── securityMiddleware.js    # Helmet, CORS, Rate Limiters, NoSQL Sanitizer
│   │   └── validateMiddleware.js    # express-validator formatted error responder
│   ├── models/                      # 15 Production Mongoose Models & Schemas
│   ├── routes/                      # REST API Endpoints (/api/...)
│   ├── services/                    # Reusable Business & Domain Services
│   ├── tests/                       # Automated API and Mongoose Model Test Suites
│   ├── utils/                       # ApiResponse, ApiError, & Logger utilities
│   ├── validators/                  # Request Validation Rules
│   ├── .env.example                 # Environment template
│   └── package.json                 # Backend dependencies & test scripts
├── src/                             # React 18 Frontend (Vite + Tailwind CSS)
│   ├── components/                  # Design System Components (Cards, Buttons, Layouts)
│   ├── config/                      # School config (Daulatyarpur, Madhoganj, UP)
│   ├── pages/                       # 8 Public Pages, Portals, & Admin Management
│   ├── routes/                      # React Router DOM 6 Client Routes
│   └── services/                    # Local storage mock service & API connector
├── .gitignore                       # Protects .env, node_modules, and secrets
├── package.json                     # Root orchestrator scripts
└── README.md                        # Documentation
```

---

## 2. MongoDB Data Layer (15 Models)

All 15 Mongoose schemas feature strict types, timestamps, validations, references, and appropriate indexing:

| # | Model | Collection | Primary Responsibility & Relationships |
|---|---|---|---|
| 1 | **User** | `users` | Role-based authentication (`admin`, `teacher`, `student`, `parent`, `staff`), bcrypt hashing, `select: false` password. |
| 2 | **Student** | `students` | Admission number (unique indexed), Class reference, Parent reference, User reference, age/blood group. |
| 3 | **Parent** | `parents` | Guardian contact info, emergency contacts, linked student array references. |
| 4 | **Teacher** | `teachers` | Employee ID, wing (`Pre-Primary`, `Primary`, `Activities`), qualifications, assigned class array. |
| 5 | **Class** | `classes` | Grades: `Nursery`, `LKG`, `UKG`, `Class 1` to `Class 5`. Compound unique index on `{ name, section, academicYear }`. |
| 6 | **Attendance** | `attendances` | Daily register per student. Compound unique index on `{ student, date }` and indexed `{ class, date }`. |
| 7 | **Homework** | `homeworks` | Class assignments, subject, submission instructions, due dates, attachments. |
| 8 | **Result** | `results` | Examination report card, subject breakdown, automatic pre-save computation of total, percentage, and letter grade. |
| 9 | **Fee** | `fees` | Tuition, admission, and activity billing. Receipt generation (`REC-YYYY-XXXXX`), payment methods, status transitions. |
| 10 | **Timetable** | `timetables` | Weekly period schedule per class. Compound unique index on `{ class, dayOfWeek }`. |
| 11 | **Notice** | `notices` | Official school circulars and notifications with category tags and audience targeting. |
| 12 | **Event** | `events` | Upcoming and past school events, sports meets, cultural celebrations, venue details. |
| 13 | **Admission** | `admissions` | Online admission enquiries, sequential reference (`ADM-YYYY-XXXX`), workflow status, staff notes. |
| 14 | **Gallery** | `galleries` | Categorized campus photographs (`Campus`, `Classroom`, `Sports & Play`, `Arts & Craft`, `Celebrations`). |
| 15 | **ContactMessage** | `contactmessages` | General public inquiries from Daulatyarpur/Madhoganj campus visitors, read/reply tracking. |

---

## 3. Environment Variables Configuration

Copy `backend/.env.example` to `backend/.env`:

```bash
cd backend
cp .env.example .env
```

### Supported Variables

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | HTTP port for the Express backend server. |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`). |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ndrn_vidyalaya` | MongoDB connection URI (supports local or MongoDB Atlas SRV). |
| `JWT_SECRET` | *(Random 256-bit string)* | Cryptographic secret used to sign and verify JSON Web Tokens. |
| `JWT_EXPIRES_IN` | `7d` | Expiration window for access tokens. |
| `CORS_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of allowed frontend origins. |
| `RATE_LIMIT_MAX` | `300` | Max requests per IP within a 15-minute sliding window. |

> **Security Note:** In `production` mode, the server will refuse to start if `JWT_SECRET` is left as a default value or if `MONGODB_URI` is omitted. Credentials must never be committed to Git.

---

## 4. MongoDB Setup

### Option A: Local MongoDB Community Server
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service:
   - **Windows**: Run `net start MongoDB` from an administrative prompt or start via Services.msc.
   - **Linux / macOS**: `sudo systemctl start mongod` or `brew services start mongodb-community`.
3. Set your connection string in `backend/.env`:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/ndrn_vidyalaya
   ```

### Option B: MongoDB Atlas (Cloud)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and whitelist your server's IP address (or `0.0.0.0/0` with secure credentials).
3. Copy the SRV connection string into `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/ndrn_vidyalaya?retryWrites=true&w=majority
   ```

---

## 5. Running the Application

### Backend Setup & Execution
Navigate to the `backend/` directory:
```bash
cd backend

# Install dependencies
npm install

# Run automated test suite
npm test

# Run backend development server (with auto-reload on file changes)
npm run dev

# Run production server
npm start
```

### Frontend Setup & Execution
From the root directory:
```bash
# Install dependencies
npm install

# Run Vite development server (http://localhost:5173)
npm run dev

# Build production bundle
npm run build
```

### Convenience Root Scripts
From the repository root:
- `npm run dev`: Runs Vite frontend
- `npm run dev:backend`: Runs Node backend in watch mode
- `npm run test:backend`: Runs the backend test suite

---

## 6. REST API Endpoints Overview

All responses adhere to a consistent contract:
- **Success**: `{ success: true, message: string, data: any, meta?: object }`
- **Error**: `{ success: false, message: string, errors?: Array<{ field: string, message: string }> }`

### Core Endpoints

#### 1. System Health & Diagnostics
- `GET /api/health` - Returns server status, uptime, memory, and MongoDB connection status.
- `GET /` - Root endpoint with school metadata and health check link.

#### 2. Authentication & Role-Based Authorization (`/api/auth`)
- `POST /api/auth/login` - Authenticate user credentials (email, phone, or ID) and issue signed JWT.
- `GET /api/auth/me` - Retrieve authenticated user profile with sensitive data sanitized *(Protected)*.
- `POST /api/auth/register` - Controlled account provisioning. Public self-registration is limited to **Student** and **Parent** roles. **Admin** and **Teacher** roles cannot be created publicly and require an authenticated Admin or the institutional `ADMIN_SETUP_KEY`.
- `POST /api/auth/logout` - Revoke and invalidate session tokens on the server.

**User Roles & Portal Redirection:**
1. **ADMIN** → `/admin/dashboard` (Staff management, admissions, directory, finances)
2. **TEACHER** → `/teacher/dashboard` (Class attendance registers, homework assignments, evaluations)
3. **PARENT** → `/portal` (Ward's attendance, report cards, fee receipts)
4. **STUDENT** → `/portal` (Class schedule, homework assignments, report cards)

#### 3. Admissions (`/api/admissions`)
- `POST /api/admissions/enquire` - Public enquiry submission (validated, returns sequential enquiry number).
- `GET /api/admissions` - Paginated and filtered enquiry registry *(Admin/Staff)*.
- `GET /api/admissions/:id` - Full enquiry details with staff notes history.
- `PATCH /api/admissions/:id/status` - Transition status and append administrative notes.

#### 4. Contact & Inquiries (`/api/contact`)
- `POST /api/contact` - Public contact message submission with client validation.
- `GET /api/contact` - Admin inbox with read/unread filtering.
- `PATCH /api/contact/:id/read` - Mark message as read.

#### 5. Academic Notices & Directives (`/api/notices`)
- `GET /api/notices` - Public circulars with category and audience filtering.
- `GET /api/notices/:id` - Single notice detail.
- `POST /api/notices` - Publish new notice *(Admin/Staff)*.
- `PUT /api/notices/:id` - Update notice *(Admin/Staff)*.
- `DELETE /api/notices/:id` - Remove notice *(Admin)*.

#### 6. Events & Calendar (`/api/events`)
- `GET /api/events` - Public event calendar (filter by `type=upcoming` or `past`).
- `POST /api/events` - Schedule new event *(Admin)*.
- `PUT /api/events/:id` - Update event details *(Admin)*.
- `DELETE /api/events/:id` - Remove event *(Admin)*.

#### 7. Campus Gallery (`/api/gallery`)
- `GET /api/gallery` - Public image showcases filtered by category.
- `POST /api/gallery` - Add photo showcase *(Admin)*.
- `DELETE /api/gallery/:id` - Delete photo *(Admin)*.

#### 8. Student & Academic Management
- `GET /api/classes` - List active classes (Nursery to Class 5).
- `GET /api/students` - Enrolled student registry with class/parent lookups.
- `POST /api/attendance` - Bulk record class attendance for a specific date.
- `GET /api/attendance/student/:studentId` - Student attendance ledger and percentage.
- `GET /api/homework` - Active homework assignments per class.
- `POST /api/results` - Publish examination report cards with automatic grading.
- `GET /api/fees/student/:studentId` - Outstanding fee balance and payment history.
- `POST /api/fees/:id/payment` - Record fee payment and issue receipt.
- `GET /api/timetable/class/:classId` - Weekly period timetable for a class.

---

## 7. Security Best Practices Implemented

1. **Password Protection**: Passwords hashed using `bcryptjs` with 10 salt rounds. Model uses `select: false` so password hashes are never leaked in queries.
2. **JWT Authorization**: Stateless Bearer tokens with configurable expiration and role-based guards (`authorize('admin', 'teacher')`).
3. **NoSQL Injection Defense**: Custom recursive input sanitizer cleans all keys containing `$` or `.` from request payloads.
4. **Rate Limiting**: Configured global rate limiting on `/api` (300 req / 15 min) and strict limits on authentication endpoints to prevent brute-force attacks.
5. **Security Headers**: Secured via `helmet` (MIME sniffing prevention, XSS filter, frame options).
6. **CORS Whitelisting**: Strict origin validation matching client origins.
7. **Input Validation**: Server-side validation via `express-validator` on all inputs before reaching service or database layers.

---

## 8. Production Deployment Guide

### A. Frontend Deployment (Vercel, Netlify, or Cloudflare Pages)

1. **Connect Repository**: Link the repository to your host.
2. **Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: Your live production backend URL (e.g., `https://api.ndrnvidyalaya.edu.in/api`).
4. **Single Page Application (SPA) Routing**:
   - For Vercel, a `vercel.json` rewrites rule:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - For Netlify, a `public/_redirects` file:
     ```text
     /*    /index.html   200
     ```

### B. Backend Deployment (Render, Railway, Fly.io, or DigitalOcean)

1. **Root Directory**: `backend`
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Required Environment Variables**:
   - `PORT`: `5000` (or assigned by host via `process.env.PORT`)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Production MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: High-entropy 256-bit string (`openssl rand -base64 32`)
   - `JWT_EXPIRES_IN`: `7d`
   - `ADMIN_SETUP_KEY`: Unique secret key for bootstrap provisioning
   - `CORS_ORIGIN`: Canonical frontend URLs (e.g., `https://ndrnvidyalaya.edu.in,https://www.ndrnvidyalaya.edu.in`)
   - `RATE_LIMIT_MAX`: `300`

---

## 9. Administrator Setup Instructions

To establish the initial school administrator account in production:

### Method 1: Direct CLI Command (Recommended for Server Shell / CI)

From the `backend/` directory:
```bash
node scripts/createAdmin.js --name "School Principal" --email "ueyuwhw@gmail.com" --password "YourStrongPassword123!" --phone "8429231617"
```
Or via root convenience command:
```bash
npm run setup:admin
```

### Method 2: Bootstrapping via Secure API Key

Send a secure `POST` request with your configured `ADMIN_SETUP_KEY`:

```bash
curl -X POST https://api.ndrnvidyalaya.edu.in/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-admin-setup-key: YOUR_CONFIGURED_ADMIN_SETUP_KEY" \
  -d '{
    "name": "School Administrator",
    "email": "ueyuwhw@gmail.com",
    "password": "YourStrongPassword123!",
    "phone": "8429231617",
    "role": "admin"
  }'
```

Once the initial admin account is created, all subsequent faculty, teacher, and staff accounts can be provisioned directly from the **Admin Dashboard** (`/admin/dashboard/teachers`).

---

## 10. Official Branding & Design System

The platform design system is derived directly from the official school insignia:

- **Institutional Navy (Primary)**:
  - Dark Navy: `#0c2344`
  - Slate Navy: `#19427d`
  - Surface Navy: `#07152b`
- **Crest Gold (Secondary / Accent)**:
  - Radiant Gold: `#e5a529`
  - Warm Deep Gold: `#c88713`
  - Subtle Gold Accent: `#fffdf5`
- **Neutral Canvas**:
  - Background: `#f8fafc` (Slate 50)
  - Card Surfaces: `#ffffff`
  - Text Primary: `#0f172a` (Slate 900)
  - Text Muted: `#475569` (Slate 600)
- **Official Assets**:
  - Vector Brand Crest: [`/public/logo.svg`](public/logo.svg)
  - Favicon Crest: [`/public/favicon.svg`](public/favicon.svg)
  - Campus Exterior: [`/public/images/school-campus.jpg`](public/images/school-campus.jpg)
  - Classroom Learning: [`/public/images/classroom-learning.jpg`](public/images/classroom-learning.jpg)
  - Sports & PE: [`/public/images/sports-activities.jpg`](public/images/sports-activities.jpg)
  - Leadership Portrait: [`/public/images/principal-portrait.jpg`](public/images/principal-portrait.jpg)

---

## 11. Known Limitations & Operating Boundaries

1. **Grade Span**: N.D.R.N. Vidyalaya operates as a primary institution covering **Nursery to Class 5**. Secondary or higher-secondary exams (Class 6-12) are intentionally omitted.
2. **Pre-Primary Configurable Intake**: `LKG` and `UKG` classes are supported by the data layer and class models, but remain configurable per academic year based on school admissions policy.
3. **Database Offline Resilience**: If the MongoDB server is momentarily unreachable, public content falls back to high-fidelity static seeds while dynamic API endpoints respond with structured `503 Service Unavailable` error payloads.
4. **WhatsApp Communication**: Direct messaging links are pre-formatted for Indian telecommunication standards (`+91` prefix) with encoded academic enquiry messages.

