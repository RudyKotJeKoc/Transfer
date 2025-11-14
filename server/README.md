# Transfer Backend Server

Backend API for Transfer Management System built with Node.js, Express, and SQLite.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize database with default users
npm run init-db

# Start server
npm start
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run init-db` - Initialize database with default users

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "Roy",
  "password": "roy123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "Roy",
    "email": "roy@transfer.local",
    "role": "admin"
  }
}
```

#### Verify Token
```http
POST /api/auth/verify
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Token is valid",
  "user": {...}
}
```

### Machine Endpoints

All machine endpoints require authentication via Bearer token.

#### Get All Machines
```http
GET /api/machines?status=In productie&destination=CZ&search=23
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 15,
  "data": [...]
}
```

#### Get Machine by ID
```http
GET /api/machines/:id
Authorization: Bearer <token>
```

#### Create Machine
```http
POST /api/machines
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "Spuitgietmachine",
  "number": "23",
  "status": "In productie",
  "destination": "CZ",
  "line": "Lijn 1",
  "responsible": "Roy",
  "notes": "PPAP vereist"
}
```

#### Update Machine
```http
PUT /api/machines/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Gereed voor transport",
  "notes": "PPAP compleet"
}
```

#### Delete Machine
```http
DELETE /api/machines/:id
Authorization: Bearer <token>
```

#### Get Machine History
```http
GET /api/machines/:id/history
Authorization: Bearer <token>
```

#### Get Statistics
```http
GET /api/machines/statistics
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "total": 52,
    "byDestination": [...],
    "byStatus": [...]
  }
}
```

## Default Users

| Username | Password | Role |
|----------|----------|------|
| Roy | roy123 | admin |
| Jiri | jiri123 | admin |
| Hans | hans123 | technician |

**Change these passwords in production!**

## Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=30m
DB_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:8080
```

## Database Schema

### users
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- password (TEXT, bcrypt hashed)
- email (TEXT)
- role (TEXT)
- created_at, updated_at (DATETIME)

### machines
- id (INTEGER PRIMARY KEY)
- type, number, status, destination, line, responsible (TEXT)
- notes, weight, dimensions, power, voltage, oil (TEXT/REAL)
- requirements, hazmat (TEXT)
- dismantling_date, transport_date, installation_date, ppap_date (DATE)
- transport_company, planning_notes, ce_certificate, manual_link (TEXT)
- created_at, updated_at (DATETIME)
- created_by (INTEGER, FK to users)

### machine_history
- id (INTEGER PRIMARY KEY)
- machine_id (INTEGER, FK to machines)
- user_id (INTEGER, FK to users)
- action (TEXT: CREATE, UPDATE, DELETE)
- changes (TEXT, JSON)
- timestamp (DATETIME)

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 30-minute expiration
- CORS protection
- SQL injection prevention via parameterized queries
- Passwords never returned in API responses

## Development

The server uses SQLite3 as the database. The database file (`database.sqlite`) is created automatically on first run.

To reset the database:
```bash
rm database.sqlite
npm run init-db
```

## Troubleshooting

### "EADDRINUSE: address already in use"
Port 3000 is already in use. Change PORT in `.env` or stop the other process.

### "Cannot find module"
Run `npm install` to install dependencies.

### Database locked
Close all connections to the database file. Restart the server.
