# Shopflare

Shopflare is a MERN e-commerce app with product search, checkout, admin tools, and a live AI shopping assistant.

## Core App

- User signup, login, and protected routes
- Product browsing, filtering, and product detail pages
- Cart management and order history
- PayPal checkout flow
- Admin product and order management
- Responsive React UI with Redux state

## Tech Stack

### Frontend

- React
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

### AI And Search

- LangGraph
- OpenRouter / OpenAI-compatible LLMs
- Qdrant
- RabbitMQ

### Integrations And Tools

- PayPal
- Axios
- ESLint
- Docker Compose

## AI Features 🤖

- Multi-agent AI system with supervisor routing between product discovery and customer-rights tasks
- Public AI chat endpoint: `POST /api/ai/chat`
- Dedicated AI chat page for product discovery
- Floating AI assistant widget across the storefront
- Quick prompt suggestions for faster product search
- Optimistic chat UI with typing placeholder
- Structured AI responses with product cards
- Product card actions for view product and add to cart
- Product availability checks from natural language
- Hybrid product search with semantic and filter-based matching
- Catalog-aware answers grounded in real product data
- LLM routing for product discovery and customer-rights questions
- Product embeddings for semantic search
- Qdrant-backed vector search for products
- Background worker for embedding generation and vector upserts
- Ingestion scripts for seeding products and embeddings

## Customer Rights AI 📄

- Admin upload for customer-rights PDF documents
- Policy document status tracking: queued, processing, completed, failed
- Async ingestion queue for policy documents
- Policy chunk storage in vector search
- Policy-context retrieval for grounded answers
- Internal callback endpoint for ingestion progress updates

## AI Folder Structure

```text
Shopflare/
├── backend/
│   └── src/
│       ├── ai/
│       │   ├── graph.ts                # Multi-agent routing, tool execution, and response assembly
│       │   ├── prompt.ts               # System prompts for product discovery and customer-rights flows
│       │   ├── llm.ts                  # LLM client calls and model execution
│       │   ├── embeddings.ts           # Text-to-vector embedding generation
│       │   └── index.ts                # AI module exports
│       ├── controllers/
│       │   └── aiController.ts         # Structured AI response handler
│       ├── routes/
│       │   └── aiRoutes.ts             # Public AI chat route
│       ├── services/
│       │   ├── hybridSearchService.ts   # Hybrid semantic search across vectors and filters
│       │   └── policySearchService.ts   # Policy retrieval for customer-rights answers
│       └── tools/
│           └── productTools.ts         # Product availability and catalog search tools
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AI/
│       │   │   └── AiProductCard.tsx    # Product card rendering for assistant replies
│       │   └── Common/
│       │       └── FloatingAiAssistant.tsx # Floating assistant widget
│       ├── pages/
│       │   └── AiChatPage.tsx           # Dedicated AI chat page
│       └── redux/
│           └── slices/
│               └── aiChatSlice.ts       # AI chat state and optimistic updates
├── worker/
│   ├── consumer.ts                      # Background ingestion consumer for AI jobs
│   ├── embeddings.ts                   # Worker-side embedding generation
│   └── qdrantClient.ts                 # Vector upsert helpers for product and policy data
└── scripts/
    ├── seedProducts.ts                 # Seed catalog data for AI search
    └── ingestProductEmbeddings.ts      # Generate and index product embeddings
```

## AI Setup

- Set `OPENROUTER_API_KEY` or another compatible LLM key in `backend/.env`
- Set the MongoDB, JWT, PayPal, and client URL values in `backend/.env`
- Run the backend, frontend, and worker if you want embeddings and vector search active
- Run `npm run seed` and `npm run ingest:products` inside `backend/` when seeding the AI index

## Clone And Setup

```bash
git clone https://github.com/Rashim-Sunar/shopflare.git
cd shopflare
```

## Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../worker
npm install
```

## Environment Configuration

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopflare
SECRET_STR=replace_with_a_strong_secret
EXPIRING_DAY=7d

OPENROUTER_API_KEY=your_openrouter_api_key
OPENAI_API_KEY=optional_openai_api_key

INTERNAL_API_TOKEN=shopflare-internal-token
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_NAME=product_updates
RABBITMQ_DLQ_NAME=product_updates_dlq
POLICY_RABBITMQ_QUEUE_NAME=policy_ingestion
POLICY_RABBITMQ_DLQ_NAME=policy_ingestion_dlq

QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=products
POLICY_QDRANT_COLLECTION_NAME=customer_rights

EMBEDDING_PROVIDER=openrouter
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_VECTOR_SIZE=1536
ENABLE_PRODUCT_CHANGE_STREAM=false
```

### Frontend (`frontend/.env`)

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### Worker (`worker/.env`)

```env
BACKEND_URL=http://localhost:5000
INTERNAL_API_TOKEN=shopflare-internal-token

RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_NAME=product_updates
RABBITMQ_DLQ_NAME=product_updates_dlq
POLICY_RABBITMQ_QUEUE_NAME=policy_ingestion
POLICY_RABBITMQ_DLQ_NAME=policy_ingestion_dlq

QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=products
POLICY_QDRANT_COLLECTION_NAME=customer_rights

EMBEDDING_PROVIDER=openrouter
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_VECTOR_SIZE=1536
EMBEDDING_MAX_RETRIES=3

OPENROUTER_API_KEY=your_openrouter_api_key
OPENAI_API_KEY=optional_openai_api_key
```

## Run

Start each service in a separate terminal:

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

Worker:

```bash
cd worker
npm run dev
```

## Author

Rashim Sunar
