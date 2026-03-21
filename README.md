# Shopflare

Shopflare is a full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js) and PayPal payment integration. It is designed for real-world online retail use cases such as product catalog management, secure checkout, and order tracking across desktop and mobile devices.

## Project Overview

Shopflare solves core challenges of modern e-commerce delivery by combining a scalable API backend, secure transaction flow, and a responsive client experience.

Key capabilities:
- Customer account creation and authentication
- Product browsing, filtering, and detail views
- Cart and checkout lifecycle management
- Secure PayPal payment processing
- Order creation and order history tracking
- Admin-oriented product and order operations

## Architecture Overview

Shopflare uses a client-server architecture with clear separation of concerns.

- Frontend (React + Redux):
	- Renders the storefront and user/admin interfaces
	- Manages client-side state for auth, products, cart, and orders
	- Communicates with backend APIs via HTTP
- Backend (Node.js + Express):
	- Exposes REST APIs for authentication, products, cart, checkout, and orders
	- Enforces authorization and role-based access control
	- Validates requests and centralizes error handling
- Database (MongoDB):
	- Persists users, products, carts, checkout data, and orders
	- Supports flexible schema evolution for catalog and transaction features
- Payment Gateway (PayPal):
	- Handles secure payment authorization and capture
	- Integrates with checkout flow for production-grade transaction handling

## Features

### User Authentication
- User signup and login flows
- JWT-based authentication and protected routes
- Role-aware access for admin and customer operations

### Product Management
- Product listing and product detail endpoints
- Admin product create/update/delete operations
- Structured product models for catalog scalability

### Cart System
- Add/remove/update cart items
- Cart persistence tied to authenticated users
- Integrated cart drawer and checkout entry points

### Secure Checkout (PayPal Integration)
- Checkout session creation
- PayPal payment processing integration
- Order creation after successful transaction completion

### Order Management
- Customer order history and order details
- Admin order review and status management
- Dedicated order APIs and Redux state slices

### Responsive UI
- Mobile-friendly and desktop-friendly layouts
- Reusable UI components for consistency
- Product discovery and conversion-focused page structure

## Tech Stack

### Frontend
- React
- Redux Toolkit
- React Router
- Vite
- CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- Middleware-based API security and error handling

### Database
- MongoDB
- Mongoose

### Services & Tools
- PayPal (payments)
- ESLint
- npm
- Git/GitHub

## Folder Structure

```text
Shopflare/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── checkoutController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Checkout.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── checkoutRoutes.js
│   │   ├── orderRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   ├── asyncErrorHandler.js
│   │   └── customError.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Rashim-Sunar/shopflare
cd shopflare
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `backend/` using the sample in the next section.

### 4. Run the application

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The frontend will run on Vite's default port, and backend will run on the configured API port.

## Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopflare

JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

CLIENT_URL=http://localhost:5173
```

Notes:
- Use strong, unique secrets in production.
- Switch PayPal mode and credentials appropriately for production deployments.
- Do not commit `.env` files to version control.

## Future Improvements

- Stripe integration alongside PayPal
- Advanced admin dashboard with KPI metrics
- Product reviews and ratings
- Inventory and stock alert system
- Coupon engine and promotional pricing
- Email notifications for order lifecycle events
- Observability stack (logging, tracing, alerting)
- CI/CD pipeline with automated test gates

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes with clear messages
4. Push the branch
5. Open a Pull Request

Please ensure code quality, lint checks, and basic testing before submitting.

## 👨‍💻 Author

**Rashim Sunar**<br/>
MERN Stack Developer