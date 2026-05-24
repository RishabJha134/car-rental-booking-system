# Car Rental Agency System

A full-stack Car Rental Agency System built for the assignment using:
- Backend: Node.js, Express, MySQL, JWT, bcrypt
- Frontend: React (Vite), Tailwind CSS, Axios

The app supports customer and agency flows with role-based access control.

## Features

- Authentication
  - Customer registration and login
  - Agency registration and login
  - JWT-based protected routes
- Customer
  - Browse available cars
  - Book cars by date range
  - View own bookings
- Agency
  - Add car
  - Edit car
  - View agency bookings
- Cars
  - Includes seating capacity support
  - Availability handling

## Project Structure

```
Internshala_Assignment_Car_Rental/
  Backend/
  Frontend/
```

## Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm
- MySQL database (local or cloud)

## Environment Variables

Create `Backend/.env` (or copy from `Backend/.env.example`) and set:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
MYSQL_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl-mode=REQUIRED
```

Frontend (optional): create `Frontend/.env` to override API URL.

```env
VITE_API_URL=http://localhost:5000/api
```

If `VITE_API_URL` is not provided, frontend defaults to `http://localhost:5000/api`.

## Database Setup

Important: backend requires MySQL and will not start if `MYSQL_URL` is missing/unreachable.

Run the SQL from `Backend/database/schema.sql` in your MySQL database to create tables:
- `users`
- `cars`
- `bookings`

You can run schema using any MySQL client (Workbench, Aiven SQL console, CLI), for example:

```sql
SOURCE /absolute/path/to/Backend/database/schema.sql;
```

## Install and Run Locally

Run backend and frontend in separate terminals.

### 1) Backend

```bash
cd Backend
npm install
npm run dev
```

or

```bash
cd Backend
npm start
```

Backend base URL: `http://localhost:5000`
Health check: `GET http://localhost:5000/api/health`

### 2) Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend URL (default Vite): `http://localhost:5173`

## API Overview

Base path: `/api`

### Auth
- `POST /auth/register-customer`
- `POST /auth/register-agency`
- `POST /auth/login`

### Cars
- `GET /cars` (public)
- `GET /cars/:id` (public)
- `GET /cars/my-cars` (agency, token required)
- `POST /cars` (agency, token required)
- `PUT /cars/:id` (agency, token required)

### Bookings
- `POST /bookings` (customer, token required)
- `GET /bookings` (authenticated user)

Use header for protected routes:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Postman

Postman assets are available in:
- `Backend/postman/Car-Rental-Agency-System.postman_collection.json`
- `Backend/postman/Car-Rental-Agency-System.postman_environment.json`

## CORS

For assignment/demo simplicity, backend CORS is configured to allow all origins.

## Deployment Guide (Quick)

### Backend (Render/Railway/other Node host)
- Root directory: `Backend`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables:
  - `PORT`
  - `NODE_ENV=production`
  - `JWT_SECRET`
  - `MYSQL_URL`
- Ensure schema from `Backend/database/schema.sql` is applied to production DB.

### Frontend (Vercel/Netlify)
- Root directory: `Frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_URL=https://<your-backend-domain>/api`

## Common Issues

1. `Table '...users' doesn't exist`
- Cause: schema not applied.
- Fix: run SQL from `Backend/database/schema.sql`.

2. Network error in browser
- Make sure backend is running.
- Verify frontend points to correct API URL (`VITE_API_URL`).
- In DevTools Network tab, ensure throttling is not set to Offline.

3. Backend exits on startup
- Check `MYSQL_URL` in `Backend/.env`.
- Confirm MySQL host is reachable from your machine/server.

## .gitignore Notes

`.gitignore` files are set in both `Backend` and `Frontend` to avoid committing:
- `node_modules`
- `.env` files
- build artifacts
- logs
- editor/system files

## License

This project was created for assignment/demo use.