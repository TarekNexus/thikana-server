# 🏢 Thikana - Building Management System (Backend)

Thikana is the backend server for a full-stack Building Management System that handles apartment listings, user/member agreements, announcements, payments, coupons, and role-based dashboard features for admin, member, and user.

---

## 🌐 Live API Server


```
https://thikana-server.vercel.app
```

---

## 🧰 Technologies Used

- Node.js  
- Express.js  
- MongoDB (native driver)  
- Firebase Admin SDK (for JWT-based auth)  
- Stripe (for secure payment)  
- dotenv (for environment variables)  
- cors (for cross-origin access)  

---

## 📦 Installation Instructions

1. **Clone the repository:**
```bash
git clone https://github.com/Programming-Hero-Web-Course4/b11a12-server-side-TarekNexus
cd thikana-server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**

Add the following environment variable names (without values) to a `.env` file in the root directory:

```env


DB_USER=
DB_PASS=

PAYMENT_GATEWAY_KEY=

FB_SERVICE_KEY=
```

> ⚠️ Do not include actual values in the public repository.

4. **Start the server:**
```bash
npm start
```

---

## 🔐 Protected Routes & Security

- JWT is verified using Firebase Admin SDK  
- Role-based middleware (`user`, `member`, `admin`)  
- Sensitive keys are stored using `.env`  
- CORS properly configured for frontend access  

---

## 🔌 Main API Routes Overview

### 🏘 Apartments
- `GET /apartments` — with pagination and rent range filter  
- `POST /apartments` — manually add apartments to DB  

### 📝 Agreements
- `POST /agreements`  
- `GET /agreements`  
- `PUT /agreements/:email` — accept  
- `PUT /agreements/reject/:email` — reject  

### 👤 Users
- `POST /users`  
- `GET /users/role/:email`  
- `PUT /users/make-admin/:email`  
- `PUT /users/make-user/:email`  

### 📢 Announcements
- `POST /announcements`  
- `GET /announcements`  

### 🎫 Coupons
- `GET /coupons`  
- `POST /coupons`  
- `PUT /coupons/:id`  
- `DELETE /coupons/:id`  

### 💳 Payments
- `POST /create-payment-intent` — Stripe integration  
- `POST /payments` — save payment  
- `GET /payments/:email` — payment history  

---

## 📦 Dependencies

```bash
npm install express cors dotenv mongodb firebase-admin stripe jsonwebtoken
```

---

## 🛡 Deployment Checklist

- MongoDB Atlas live DB connected  
- Firebase Admin SDK configured  
- All `.env` values securely added in production  
- CORS set correctly (allow frontend domain)  
- Firebase domain whitelisted (e.g., Netlify/Vercel)  
- No 404 / 504 / CORS errors in live API  

---

## 👨‍💻 Developer Info

**Md. Tarek**  
MERN Stack Developer  
Bangladesh 🇧🇩

---

## 🔗 Project Links

| Item                      | Link                      |
|---------------------------|-------------------------------------------------------|
| 🌍 Frontend Live Site     | https://thikana-client.netlify.app/                  |
| ⚙️ Backend Live API       | https://thikana-server.vercel.app/                   |
| 🧑‍💻 Client GitHub Repo    | https://github.com/Programming-Hero-Web-Course4/b11a12-client-side-TarekNexus        |
| 🧑‍💻 Server GitHub Repo    | https://github.com/Programming-Hero-Web-Course4/b11a12-server-side-TarekNexus         |

---
