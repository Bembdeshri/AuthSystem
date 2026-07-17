# Secure JWT Authentication System & Session Management

A modern, highly secure full-stack authentication system built using Node.js (TypeScript/Express) on the backend and React (TypeScript/Tailwind CSS) on the frontend. The system relies on database-backed session state persistence, lightweight HTTP-only JSON Web Tokens (JWT) cookies, and real-time login audit tracking.
and real email sending capabilitese

---

## 🚀 Key Features & Security Enhancements

### 🔒 Core Cryptography & Architecture
* **Advanced Token Rotation:** Uses isolated JWT Access Tokens paired with rotating Refresh Tokens to maintain persistent, highly secure user sessions.
* **HTTP-Only Cookies:** Auth tokens are dispatched inside `httpOnly`, `secure` (production-enforced), and `sameSite: "lax"` cookie parameters to completely eliminate Cross-Site Scripting (XSS) and token theft risks.
* **Database-Driven Profiles:** Profile requests fetch live data modifications (`first_name`, `last_name`, `username`) straight from PostgreSQL matching your client schema.
* **Audit Trail Logging:** Automatically intercepts and logs authentication metrics (`SUCCESS` vs `FAILED`), tracking targeted accounts, client IP addresses, and incoming User-Agents to pinpoint brute-force patterns.

### 🛡️ Enterprise-Grade Security Implementations
* **Cryptographic Hashing:** Passwords are fully salted and safely hashed using **bcrypt** before hitting database columns—plain text passwords are never stored.
* **SQL Injection Protection:** Database interaction queries utilize strict parameterization structures (via Prisma / parameterized pools), ensuring payload data cannot bypass execution parameters.
* **Cross-Site Scripting (XSS) Guard:** Hardened output encoders and headers filter unexpected layout tags to prevent unauthorized code injection.
* **Cross-Site Request Forgery (CSRF) Mitigation:** Secure routing limits and cookie policies prevent unauthorized requests from external origins.
* **Rate Limiting Protection:** Traffic rate limiters throttle bulk requests targeting standard authentication pipelines (`/login`, `/signup`) to reduce automated brute-force attacks.
* **Secure HTTP Headers:** Applies industry-standard security headers (such as Helmet policies) to prevent clickjacking and protocol downgrades.
* **Session Expiration Control:** Implements automated absolute time-to-live restrictions across both cookie parameters and active session database rows.
* **Role-Based Authorization:** Fine-grained access control layer separating restricted resources between standard `User` and privileged `Admin` privileges.

### 📝 Client Input Validation & Workflows
* **Strict Email Integrity:** Input parsers mandate standardized validation requiring structural format integrity (must include explicitly valid `@` matching and standard top-level routing domain names).
* **Strong Password Complexity Policy:** Registration and reset modules strictly enforce hardened character boundaries:
  * Minimum of **8 characters** in total length.
  * Must contain at least one **lowercase letter**.
  * Must contain at least one **uppercase letter**.
  * Must contain at least one **special character/symbol** (e.g., `@`, `#`, `$`, `!`, `%`, `*`, `?`, `&`).
* **Email Verification & Outbound Recovery:** Restricts dashboard permissions until validation codes are verified, and uses expiring cryptographically random secure hashes for email-driven password reset protocols.

---

## 🛠️ System Architecture

```text
server/src/
├── config/
│   └── database.ts          # PostgreSQL pool initialization (using 'pg')
├── middlewares/
│   └── authMiddleware.ts    # Custom 'AuthRequest' evaluation layer
├── routes/
│   ├── authRoutes.ts        # Handlers for login history hooks, logout, registration
│   └── userRoutes.ts        # Context route fetching DB rows by matching token IDs

⚙️ Environment Configurations
Create a .env file inside your server/ directory. (Note: This file is securely managed locally via your .gitignore and must never be pushed to your GitHub repository).

Code snippet
# Server Port Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_secure_password
DB_NAME=AuthSystem

# Token Security Keys
JWT_SECRET=your_super_complex_jwt_secret_key_string
🛠️ Installation & Setup
1. Database Initialization
Execute the following schema statements inside your PostgreSQL environment:

SQL
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_history (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    login_status VARCHAR(50) NOT NULL, -- 'SUCCESS' or 'FAILED'
    ip_address VARCHAR(100) NOT NULL,
    user_agent VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
2. Backend Installation
Bash
cd server
npm install
npm run dev
3. Frontend Installation
Bash
cd client
npm install
npm run dev

## 📸 App Preview

## 📸 App Preview

## 📸 App Preview

### Login Screen
![Login UI](./images/image1.png](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image1.png))
![security](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image2.png))
![security](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image3.png))
![security](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image4.png)
![security](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image5.png)
![security](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image6.png)
![security](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image7.png)

## Email Verification
![security](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image8.png)

## Forgot Password
![forget ui](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image9.png)
![security](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image10.png)

### Dashboard Screen
![Dashboard Screen](https://github.com/Bembdeshri/AuthSystem/blob/0797effb5c365a6a2448223e81fb1907e38acbd6/Images/image11.png)
