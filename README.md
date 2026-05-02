# Shopflare

Shopflare is a production-oriented, full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It combines a robust catalog, admin tools, secure checkout, and an integrated AI Shopping Assistant to provide a modern retail experience for customers and store operators.

## Project Overview

Shopflare solves core challenges of modern e-commerce delivery by combining a scalable API backend, secure transaction flow, and a responsive client experience.

Key capabilities:
- Customer account creation and authentication
- Product browsing, filtering, and detail views
- Cart and checkout lifecycle management
- Secure PayPal payment processing
- Order creation and order history tracking
- Admin product and order management
- AI-driven product discovery and conversational shopping

## Architecture Overview
## AI & Search

Shopflare includes a purpose-built AI agent and hybrid search stack that enhance product discovery and enable a conversational shopping experience:

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
- Conversational AI Agent: integrated assistant available as a floating chat widget and a dedicated AI page. Users can ask product availability or discovery questions in natural language.
- Embeddings & Vector Store: product embeddings are generated and stored for semantic search. The repository contains ingestion scripts and a worker for creating and updating embeddings.
- Hybrid Search: combines vector similarity (semantic) and traditional attribute/keyword filters for more relevant search results.
- Vector DB Client: utilities and clients (e.g., Qdrant) are included for vector storage and nearest-neighbor queries.
- Background Worker & Queue: background processes handle embedding ingestion, change-stream watching, and asynchronous tasks to keep the index in sync with product data.

This AI stack allows features like "Show women top wear under 5000" or conversational follow-ups and is extensible to other LLM providers via the backend AI integration.

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
### AI Shopping Assistant

- Floating assistant widget and dedicated AI chat page with conversational support.
- Optimistic chat UI: user messages display instantly and assistant shows a "thinking" placeholder while generating replies.
- Backend grounding: assistant queries the product catalog and returns contextual, product-focused answers.
- Admin-friendly ingestion: scripts to scrape, normalize, and ingest product data and embeddings (`scripts/seedProducts.ts`, `scripts/ingestProductEmbeddings.ts`).

### Developer Tools & Utilities

- Scrapers: utilities for scraping product data from sources to bootstrap the catalog.
- Product normalization utilities to standardize varied product schemas.
- Realtime watchers to publish catalog updates to the vector index and search services.

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

### Services & Tools
- PayPal (payments)
- ESLint
- npm
- Git/GitHub

Additional services used by the AI/search stack may include a vector database (Qdrant), an embeddings provider, and background workers.

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
├── worker/
│   ├── config.ts
│   ├── consumer.ts
│   ├── embeddings.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── data/
│   └── products.json
├── docker-compose.yaml
└── README.md
```
- `backend/src/ai/` — embeddings, LLM prompts, and AI orchestration code.
- `frontend/src/pages/AiChatPage.tsx` — dedicated AI chat page.
- `frontend/src/components/Common/FloatingAiAssistant.tsx` — floating assistant widget used across the storefront.
- `frontend/src/redux/slices/aiChatSlice.ts` — Redux slice that handles optimistic chat UI and assistant responses.
- `worker/` — worker processes for embedding generation and asynchronous indexing.
- `scripts/` — ingestion and scraping helpers for populating `data/products.json`.

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

cd ../worker
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

Frontend (in a separate terminal):
```bash
cd frontend
npm run dev
```

Worker (optional, for AI embeddings—in another terminal):
```bash
cd worker
npm run dev
```

The frontend will run on Vite's default port, backend on the configured API port, and the worker processes embeddings in the background.

### 5. AI Features Setup (Optional)

To enable the full AI Shopping Assistant experience:

- Ensure you have an embeddings/LLM provider API key in `backend/.env` (e.g., OpenRouter or OpenAI-compatible key).
- Run the worker process (see step 4) to ingest embeddings and keep the vector store synchronized with product data.
- Seed your product catalog using `scripts/seedProducts.ts` or import from `data/products.json`.
- Use `scripts/ingestProductEmbeddings.ts` to generate and index product embeddings.

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

OPENROUTER_API_KEY=your_openrouter_api_key
```

Notes:
- Use strong, unique secrets in production.
- Switch PayPal mode and credentials appropriately for production deployments.
- Do not commit `.env` files to version control.
- For the AI agent to work, ensure `OPENROUTER_API_KEY` or equivalent LLM provider key is set.
- Configure vector store credentials in the worker if using a remote Qdrant instance.

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