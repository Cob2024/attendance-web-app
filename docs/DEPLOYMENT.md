# Deployment Guide — SmartAttend

This document outlines the step-by-step process for deploying **SmartAttend** to production cloud platforms.

---

## 1. Architecture Overview for Production

```
+-----------------------------------------------------------+
|                    Frontend (Vercel)                      |
|  - React 18 + Vite + Tailwind CSS                         |
|  - Progressive Web App (PWA) + Service Worker             |
|  - Subdomain: https://smartattend.ttu.edu.gh (or vercel)  |
+-----------------------------+-----------------------------+
                              | HTTPS + WSS (Socket.io)
                              v
+-----------------------------------------------------------+
|                   Backend API (Render)                    |
|  - Node.js + Express + TypeScript + Socket.io             |
|  - GPS Haversine verification engine                      |
|  - JWT Authentication & RBAC                              |
+-----------------------------+-----------------------------+
                              |
                              v
+-----------------------------------------------------------+
|                   Database (PostgreSQL)                   |
|  - Hosted on Render / Neon / Supabase                     |
|  - Prisma ORM Schema & Migrations                         |
+-----------------------------------------------------------+
```

---

## 2. Deploying Backend API to Render

1. Create a free account at [render.com](https://render.com).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository: `Cob2024/attendance-web-app`.
4. Configure the Web Service settings:
   - **Name**: `smartattend-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter
5. Add the following **Environment Variables**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(Generate a secure 64-character random string)*
   - `CLIENT_ORIGIN`: `https://your-frontend-app.vercel.app` *(or `*` during initial testing)*
   - `DATABASE_URL`: *(Your PostgreSQL or SQLite connection string)*
6. Click **Create Web Service**. Once deployed, Render will provide a live HTTPS URL (e.g. `https://smartattend-api.onrender.com`).

---

## 3. Deploying Frontend App to Vercel

1. Create an account at [vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import the GitHub repository: `Cob2024/attendance-web-app`.
4. Configure the Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add the **Environment Variable**:
   - `VITE_API_URL`: `https://smartattend-api.onrender.com/api`
6. Click **Deploy**. Vercel will deploy with automatic SSL/HTTPS.

---

## 4. Mobile GPS Geolocation Note (HTTPS Requirement)

> [!IMPORTANT]
> The HTML5 Geolocation API (`navigator.geolocation`) is **strictly disabled by mobile browsers (Safari, Chrome, Firefox)** over unencrypted `http://` connections for user privacy. Deploying frontend and backend to Vercel and Render automatically provisions free **SSL/TLS certificates (`https://`)**, ensuring GPS verification works seamlessly on all student and lecturer devices on campus.
