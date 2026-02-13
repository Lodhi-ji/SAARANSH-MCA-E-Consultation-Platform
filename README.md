# Saraansh / MCA E-Consultation Platform

**Saraansh** is a digital consultation and public feedback collection platform designed for the Ministry of Corporate Affairs (MCA), Government of India. It facilitates smoother policy-making by aggregating and analyzing public sentiment on draft bills and policies.

## 📂 Project Structure

The project is divided into two main panels:

### 1. Admin Panel
Designed for ministry officials to view feedback, analyze sentiment, and manage bills.
- **Backend**: `Admin Panel/Backend-2` (Node.js, Express, PostgreSQL) - Runs on Port `5000`
- **Frontend**: `Admin Panel/Frontend-2` (Vite, React, TypeScript, Tailwind CSS, Shadcn/UI)

### 2. User Panel
Designed for the general public and stakeholders to view draft bills and submit comments.
- **Backend**: `User Panel/Backend-1` (Node.js, Express, PostgreSQL) - Runs on Port `5046`
- **Frontend**: `User Panel/Frontend-1` (Vite, React, TypeScript, Tailwind CSS, Supabase)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- Git

### 🔧 Installation & Setup

#### 1. Clone the Repository
```bash
git clone <repository_url>
cd Saraansh
```

#### 2. Admin Panel Setup

**Backend:**
```bash
cd "Admin Panel/Backend-2"
npm install
# Create a .env file based on .env.sample (if available) or configure:
# PORT=5000
# DATABASE_URL=postgresql://user:password@localhost:5432/your_db
npm run dev
```

**Frontend:**
```bash
cd "Admin Panel/Frontend-2"
npm install
npm run dev
```

#### 3. User Panel Setup

**Backend:**
```bash
cd "User Panel/Backend-1"
npm install
# Configure .env:
# PORT=5046
# DATABASE_URL=...
npm run dev
```

**Frontend:**
```bash
cd "User Panel/Frontend-1"
npm install
npm run dev
```

---

## 🖥️ Usage

Once all servers are running:

- **Admin Dashboard**: Access via the URL provided by the Admin Frontend terminal (usually `http://localhost:5173`).
- **User Portal**: Access via the URL provided by the User Frontend terminal.
- **API Endpoints**:
  - Admin API: `http://localhost:5000`
  - User API: `http://localhost:5046`

## 🛠️ Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn/UI, Recharts, Lucide React.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (via `pg` pool).
- **Authentication/Integrations**: Supabase (Frontend), Twilio & Nodemailer (User Backend).
