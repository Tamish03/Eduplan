# EduPlan

EduPlan is an AI-powered study planning platform with:
- `frontend` (React + Vite in repo root)
- `backend` (Node.js + Express + SQLite + Gemini-based RAG)
- `EduPlan-Ai` (separate Next.js prototype, optional)

## Primary Stack (Recommended)
Use this by default for a stable local run.

### 1. Install dependencies
```bash
npm install
cd backend && npm install && cd ..
```

### 2. Configure environment
Create `.env` in repo root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=
GEMINI_GENERATION_MODELS=gemini-2.0-flash,gemini-1.5-flash,gemini-1.5-flash-8b
GEMINI_EMBEDDING_MODELS=gemini-embedding-001,text-embedding-004,embedding-001
PORT=5000
VITE_API_BASE_URL=http://localhost:5000/api
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=EduPlan <your_gmail_address@gmail.com>
```

You can also copy from `.env.example`.

### 3. Run backend
```bash
cd backend
npm start
```
Backend: `http://localhost:5000`

### 4. Run frontend
Open a second terminal:
```bash
npm run dev
```
Frontend: `http://localhost:5173`

## Current Working Architecture

```text
Eduplan/
  backend/
    config/
      database.js
    routes/
      sets.js
      documents.js
      rag.js
      search.js
      progress.js
    services/
      documentProcessor.js
      ragEngine.js
      knowledgeGraph.js
      planGenerator.js
      progressAnalytics.js
    utils/
      embeddings.js
      geminiClient.js
      promptTemplates.js
      chunker.js
    uploads/
    server.js
  src/
    components/
    contexts/
    services/api.js
    App.jsx
  EduPlan-Ai/   # Optional Next.js prototype
  .env.example
```

## API Route Map

Base URL: `http://localhost:5000/api`

- `GET /health`
- `POST /auth/send-signup-otp`
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/send-reset-otp`
- `POST /auth/reset-password`
- `GET /advanced/learning-twin/:setId`
- `POST /advanced/learning-twin/:setId/recompute`
- `POST /advanced/safe-query`
- `GET /advanced/breakpoint/:setId`
- `POST /advanced/exam/generate/:setId`
- `GET /advanced/exam/session/:sessionId`
- `POST /advanced/exam/submit/:sessionId`
- `GET /sets`
- `GET /sets/:id`
- `POST /sets`
- `PUT /sets/:id`
- `DELETE /sets/:id`
- `POST /documents/upload/:setId`
- `GET /documents/set/:setId`
- `DELETE /documents/:id`
- `POST /rag/query`
- `POST /rag/generate-plan/:setId`
- `GET /rag/connections/:setId`
- `GET /rag/headlines`
- `POST /rag/headlines/:setId`
- `POST /rag/gap-analysis/:setId`
- `POST /search`
- `GET /search/related/:setId`
- `GET /progress/overview`
- `GET /progress/gap-analysis/:setId`
- `POST /progress/session`
- `POST /progress/quiz`
- `POST /progress/interaction`

## What Was Fixed
- Unified frontend API config via `VITE_API_BASE_URL` (`src/services/api.js`).
- Removed hardcoded production URL fetch in app (`src/App.jsx`).
- Fixed RAG document ingestion flow to consistently use Gemini embeddings + SQLite chunks.
- Tightened upload support to currently supported formats (`PDF`, `TXT`) and aligned UI/backend validation.
- Fixed study plan join bug in backend (`backend/services/planGenerator.js`).
- Enabled SQLite foreign keys for safer cascading cleanup (`backend/config/database.js`).
- Improved document delete path to remove chunks + file cleanup (`backend/routes/documents.js`).
- Added route compatibility files in Next prototype:
  - `EduPlan-Ai/src/app/api/chat/route.ts`
  - `EduPlan-Ai/src/app/api/connect-nodes/route.ts`
- Added root `.env` ignore and `.env.example`.

## Optional: Next.js Prototype
`EduPlan-Ai/` is kept as a separate app and not required for the main EduPlan run.

```bash
cd EduPlan-Ai
npm install
npm run dev
```

## Notes
- RAG answers require valid `GEMINI_API_KEY`.
- If API key is missing/invalid, RAG and AI recommendations will fail gracefully.
- Existing uploaded data is stored in `backend/database.sqlite` and `backend/uploads/`.
