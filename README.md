# 🎟️ Event Ticketing System API

A RESTful Node.js API for managing users, events, and ticket bookings — complete with role-based access, QR code generation, and booking confirmation emails. Built with Express and MongoDB.

---

## 📁 Project Structure

```
.
├── middleware/           # JWT authentication
│   └── auth.js
├── models/               # Mongoose schemas
│   ├── Booking.js
│   ├── Event.js
│   └── User.js
├── private_qrs/          # Generated QR code image files
├── public/               # Static HTML pages
│   ├── 404.html
│   └── index.html
├── routes/               # API endpoints
│   ├── admin.js
│   ├── auth.js
│   ├── bookings.js
│   └── events.js
├── utils/                # Utility functions
│   ├── generateQRCode.js
│   └── sendEmail.js
├── .env.example          # Example environment variables
├── package.json
├── server.js             # Entry point
└── README.md
```

---

## 🔧 Features

- JWT-based authentication
- Role-based authorization (`user`, `admin`)
- Full CRUD operations for events
- Booking system with seat availability validation
- QR code generation for booked tickets (stored in `private_qrs`)
- Email confirmation on booking (via Nodemailer)
- Admin dashboard route with aggregated booking info
- Filtering events by category, date, and venue
- 404 handling with HTML/JSON based on Accept header

---

## 🛠 Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT + Bcrypt
- Nodemailer (Gmail)
- QR Code image generation (`qrcode`)
- Render (for deployment)

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/event-ticketing-system.git
cd event-ticketing-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file (based on `.env.example`) with:

```env
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
EMAIL_USER=your_gmail_account
EMAIL_PASS=your_gmail_app_password
```

### 4. Run the server

```bash
node server.js
```

Or with nodemon:

```bash
npm run dev
```

---

## 🧪 API Endpoints

### 🔐 Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### 🎫 Events

- `GET /api/events`
  - Optional query params: `?category=`, `?date=YYYY-MM-DD`, `?venue=`
- `GET /api/events/:id`
- `POST /api/events` _(admin only)_
- `PUT /api/events/:id` _(admin only)_
- `DELETE /api/events/:id` _(admin only if no bookings)_

### 📦 Bookings

- `GET /api/bookings` _(user only)_
- `GET /api/bookings/:id` _(user only)_
- `POST /api/bookings` _(user only)_
- `GET /api/bookings/qr/:id?token=...` _(public with valid token)_
- `GET /api/bookings/validate/:qr` _(public validation)_
- `GET /api/bookings/admin/dashboard` _(admin only)_

---

## 📤 Deployment (Render)

1. Push to GitHub
2. Create new Web Service in [Render](https://render.com)
3. Set:
   - **Start command**: `node server.js`
   - **Build command**: _(leave blank)_
4. Add environment variables under "Environment"
5. Visit `https://your-subdomain.onrender.com/` to view

---

## 📂 Example Request (Postman)

**Register User**
```json
POST /api/auth/register
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secure123"
}
```

**Create Event (Admin Only)**
```json
POST /api/events
Headers: Authorization: Bearer <token>
{
  "title": "Tech Meetup 2025",
  "category": "Technology",
  "venue": "Innovation Hall",
  "date": "2025-09-15",
  "time": "18:00",
  "seatCapacity": 150,
  "price": 20
}
```

---

## ✅ Checklist

- [x] Auth & role-based access
- [x] Events CRUD
- [x] Bookings with seat validation
- [x] QR code generation
- [x] Email confirmation
- [x] Admin dashboard
- [x] Render deployment
- [x] 404 page & API fallback

---

## 📄 License

MIT — Feel free to use and adapt.

---

## 📫 Contact

Author: Kyle Lavigne  
GitHub: [@KyleLavigne](https://github.com/KyleLavigne)