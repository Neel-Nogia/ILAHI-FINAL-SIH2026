# 🌟 ILAHI — Gujarat & Rajasthan Local Guide Network
### Smart India Hackathon (SIH) 2026

[![Live on Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://ilahi-app.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Neel-Nogia/ILAHI-FINAL-SIH2026)
[![Supabase Backend](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-3ECF8E?style=for-the-badge&logo=supabase)](https://oaxausoyvwxlhswnfhvq.supabase.co)
[![React 19](https://img.shields.io/badge/React%2019-Vite%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

---

## 🚀 Live Links
- **Production URL (Vercel):** [https://ilahi-app.vercel.app](https://ilahi-app.vercel.app)
- **GitHub Repository:** [https://github.com/Neel-Nogia/ILAHI-FINAL-SIH2026](https://github.com/Neel-Nogia/ILAHI-FINAL-SIH2026)
- **Supabase Cloud Project:** `https://oaxausoyvwxlhswnfhvq.supabase.co`

---

## 📌 Executive Summary
**ILAHI** is a hyper-local, two-sided tourism marketplace designed for SIH 2026 to celebrate cultural heritage and empower local storytellers, artisans, and community guides across **Gujarat** and **Rajasthan**.

Conventional travel platforms prioritize commercial agency tours and generic itineraries. **ILAHI** connects travelers directly with vetted local custodians who possess generational wisdom, hidden gem insights, and authentic storytelling abilities.

---

## 🎯 Key Innovations & Capabilities

### 1. 🧮 Explainable 7-Parameter Matching Algorithm
Tourists receive tailored guide recommendations based on a deterministic, weighted scoring engine:
- **Destination & State Alignment (25%)**: Exact match for heritage regions (Kutch, Shekhawati, Udaipur, Gir, etc.).
- **Language Compatibility (15%)**: Multilingual overlap (Gujarati, Rajasthani/Marwari, Hindi, English, French, German).
- **Travel Style Affinity (15%)**: Heritage, Culinary/Street Food, Photography, Artisan Crafts, Nature/Wildlife, Spiritual.
- **Budget Fit (15%)**: Compares tourist daily budget against the guide's flexible fee range (`fee_min` to `fee_max`).
- **Rating Trust (10%)**: Historical customer reviews and score confidence.
- **Profile Completion & Verification (10%)**: Rigorous onboarding checklist.
- **Calendar Availability (10%)**: Realtime slot lookup.

Every recommendation shows an **explainable score breakdown** explaining why a guide is their ideal match.

### 2. 🛡️ Two-Tier Safety Protocol (Selective SOS)
Built with solo travelers, female explorers, and rural visitors in mind:
- **Tier 1 — Discreet Local Alert**: Silently transmits GPS coordinates and tour telemetry to the registered local guide network and regional help desk.
- **Tier 2 — Full Emergency Broadcast**: Instant one-tap dialing to Tourist Police (`112` / `1363`), emergency contacts, and active trip alert logging.

### 3. ⏱️ Realtime Guide Portal & "Pending Admin Review" State
- Guides have a dedicated portal to view instant incoming booking requests via Supabase Realtime Channels.
- Unverified or recently updated guide profiles dynamically reflect a **"Pending Admin Review"** state with badge indicators, preventing unvetted listings from booking until certified by regional tourism coordinators.

### 4. 🎨 Pastel Rajasthan & Gujarat Heritage Aesthetic
- Crafted using pastel contrasting palettes reflecting sandstone desert hues, terracotta pottery, and royal peacock tones.
- Full responsive experience optimized for mobile phones and desktops with zero horizontal overflow.

---

## 🏗️ System Architecture & Tech Stack

```mermaid
graph TD
    Client["Client (React 19 + TypeScript + Vite + Tailwind v4)"]
    Vercel["Vercel Edge Deployment (https://ilahi-app.vercel.app)"]
    SupaAuth["Supabase Auth (JWT, Role Separation: Tourist vs Guide)"]
    SupaDB["PostgreSQL Database (RLS, Custom Views, Secure Contact Gate)"]
    SupaRT["Supabase Realtime (WebSockets - Incoming Bookings)"]
    SupaStorage["Supabase Storage (Guide Profiles, Badges, Certs)"]

    Vercel --> Client
    Client --> SupaAuth
    Client --> SupaDB
    Client --> SupaRT
    Client --> SupaStorage
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend / BaaS**: Supabase (PostgreSQL, Row Level Security, Realtime Replication, Auth, Storage).
- **Deployment**: Vercel SPA deployment with automated rewrite rules (`vercel.json`).

---

## 🗄️ Database Schema & RLS Security

The database schema is defined in [`supabase/schema.sql`](supabase/schema.sql) and includes:
1. **`guides`**: Guide credentials, multilingual capabilities, fee range (`fee_min`, `fee_max`), verified status, areas of expertise.
2. **`tourists`**: Traveler preferences, language proficiencies, emergency contacts.
3. **`destinations` & `hidden_gems`**: Curated cultural nodes across Gujarat and Rajasthan.
4. **`bookings`**: Escrow simulation, trip dates, computed amount, status (`pending`, `confirmed`, `completed`, `cancelled`, `held`, `released`).
5. **`guide_availability`**: Date-based calendar slots.
6. **`reviews`**: 1-5 star ratings and verified tourist feedback.
7. **Strict Row Level Security (RLS)**: Enforces that guides only update their own records and contact numbers remain masked until booking confirmation.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Neel-Nogia/ILAHI-FINAL-SIH2026.git
cd ILAHI-FINAL-SIH2026

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` or `http://localhost:3001` in your browser.

### Environment Configuration
Create a `.env` file based on `.env.example`:
```env
VITE_SUPABASE_URL=https://oaxausoyvwxlhswnfhvq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heGF1c295dnd4bGhzd25maHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MTM0OTYsImV4cCI6MjEwNTk4OTQ5Nn0.NbBtSBGWkcXNffmWtddses6BDLLSRMxRdO5ZSvt6aCU
```

---

## 👥 Authors & Team
- **Project Lead**: Neel Nogia ([@Neel-Nogia](https://github.com/Neel-Nogia))
- **Initiative**: Smart India Hackathon (SIH) 2026
- **Live Deployment**: [https://ilahi-app.vercel.app](https://ilahi-app.vercel.app)
