# School Extra-Curricular Activities Management System - Backend

## Overview
This is the backend for the School Extra-Curricular Activities Management System. It uses Node.js, Express, and MongoDB.

## Features
- **Authentication**: JWT-based auth for Admin. Includes Forgot/Reset Password flow via OTP (simulated).
- **Event Management**: CRUD operations for events.
- **Application Management**: Handle student applications for events.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` file (see `.env.example` or use the one created).
3. Run server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login`: Login admin. Body: `{ email, password }`
- `POST /api/auth/forgot`: Request OTP. Body: `{ email }`
- `POST /api/auth/verify-otp`: Verify OTP. Body: `{ email, otp }`
- `POST /api/auth/reset-password`: Reset Password. Body: `{ email, newPassword, otp }`

### Events
- `GET /api/events`: Get all events.
- `POST /api/events`: Create event (Admin protected).
- `PUT /api/events/:id`: Update event (Admin protected).
- `DELETE /api/events/:id`: Delete event (Admin protected).

### Applications
- `POST /api/applications`: Submit application.
- `GET /api/applications`: Get all applications (Admin protected).
- `PUT /api/applications/:id`: Update application (Admin protected).
- `DELETE /api/applications/:id`: Delete application (Admin protected).

## Security
- Passwords are hashed using `bcryptjs`.
- JWT tokens are used for protected routes protection middleware.
- Input validation should be handled in controllers (basic validation included).

## Data Logic
- **Users**: Admin accounts.
- **Events**: Activities students can apply for.
- **Applications**: Links a Student to an Event/Activity.
