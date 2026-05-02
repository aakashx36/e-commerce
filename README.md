Vendora | Multi-Vendor E-Commerce Ecosystem
Vendora is a high-performance, full-stack e-commerce platform designed to facilitate seamless transactions between multiple sellers and buyers. Built with the MERN stack, the application focuses on role-based isolation, secure authentication, and a robust administrative architecture.

🌐 Live Application
https://e-commerce-olive-xi.vercel.app/

🚀 Core Features
1. Multi-Vendor Management
Seller Command Center: A dedicated dashboard for vendors to manage product catalogs, inventory levels, and financial tracking.

Buyer Grievance Center: A centralized module for customer support, dispute resolution, and order tracking.

Admin Orchestration: High-level oversight for platform moderation and database restructuring via automated gateways.

2. Advanced Security & Auth
State Management: Utilizes React useContext for global state and role-based data isolation.

JWT Authentication: Implements a specialized localStorage-based session management system.

Authentication tokens are handled via the Authorization header to prevent CSRF while maintaining session persistence across tab reloads.

RBAC (Role-Based Access Control): Strict backend middleware ensures that Sellers, Buyers, and Admins can only access their respective resource endpoints.

3. Technical Architecture
Frontend: React.js with Tailwind CSS for responsive, mobile-first design.

Backend: Node.js & Express.js optimized for production with helmet security and cors restriction.

Database: MongoDB Atlas with optimized schemas for catalog management and cryptographic payment signature verification.

🛠️ Technical Implementation Details
Local Storage Auth Logic
Unlike traditional cookie-based sessions, Vendora utilizes a direct localStorage flow:

Login: Backend generates a JWT and returns it in the response body.

Storage: Frontend captures and persists the token in localStorage.

Verification: A custom Axios interceptor injects the token into the Bearer header for every protected API call.

API Deployment Configuration
The backend is configured for the Render environment using:

Dynamic Port Binding: process.env.PORT || 5000

Environment Variable Protection: All secrets (MongoDB URI, JWT Keys) are managed via the Render Environment Vault.

CORS Whitelisting: Restricted strictly to the Vercel production domain.

📂 Project Structure
Plaintext
├── backend/
│   ├── models/      # Mongoose schemas
│   ├── routes/      # RBAC-protected API endpoints
│   ├── middleware/  # JWT & Auth logic
│   └── server.js    # Express entry point
└── frontend/
    ├── src/
    │   ├── context/ # State management
    │   ├── pages/   # Role-specific dashboards
    │   └── utils/   # API configuration
⚙️ Installation
Clone: git clone <repository-url>

Dependencies: Run npm install in both /backend and /frontend.

Environment Variables: Create a .env in the backend with:

MONGO_URI

JWT_SECRET

PORT

Run: npm run dev (local) or npm start (production).
