# AyurCare 🌿

AyurCare is a state-of-the-art telemedicine & wellness platform bridging traditional Ayurvedic wisdom with modern clinical practice.

---

## ✨ Features

- **Live Consultation Rooms**: Virtual, secure consultations with experienced doctors.
- **Real-Time Doctor-Patient Cart Sync**: Seamless sync for prescription and product recommendations.
- **Automated Gmail Booking Notifications**: Instant email confirmations and updates.
- **PrakritiAI Report Analysis**: AI-powered analysis of health profiles and diagnostic reports.

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### ⚙️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory (using `.env.example` if available) and configure your database, authentication keys, and API tokens.

3. **Initialize the Database:**
   Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma db push
   ```
   *(Optional)* Seed the database with initial data:
   ```bash
   node prisma/seed.js
   ```

### 💻 Running the Application

To start the development server, run:

```bash
npm run dev
# or
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Prisma ORM with SQLite (dev.db)
- **Styling**: Vanilla CSS / PostCSS
- **Custom Server**: custom Express server (`server.js`) for specialized API handling and sockets
