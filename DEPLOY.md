# Deployment Guide - Hall Booking App

## 1. Frontend (React Prototype)
We recommend **Vercel** or **Netlify** for hosting the React frontend.

### Steps for Vercel:
1.  Push the `prototype` folder to a GitHub repository.
2.  Log in to Vercel and "Add New Project".
3.  Import your repository.
4.  **Framework Preset**: Vite
5.  **Build Command**: `npm run build`
6.  **Output Directory**: `dist`
7.  Click **Deploy**.

## 2. Backend (Node.js API)
We recommend **Render** or **Heroku**.

### Steps for Render:
1.  Push the `backend` folder to GitHub.
2.  Create a "Web Service" in Render.
3.  **Build Command**: `npm install`
4.  **Start Command**: `node server.js`
5.  Add Environment Variables:
    *   `JWT_SECRET`: (Your-Secure-Key)
    *   `DATABASE_URL`: (Your-Postgres-Connection-String)

## 3. Database (PostgreSQL)
We recommend **Supabase** or **Neon**.
1.  Create a project.
2.  Copy the `Connection String`.
3.  Run the contents of `backend/schema.sql` in the SQL Editor to create tables.

## 4. Domain & SSL
*   Vercel/Render provide free SSL (`https`) automatically.
*   For custom domains (e.g., `india-halls.com`), add A records in your DNS provider (GoDaddy/BigRock) pointing to Vercel IP.
