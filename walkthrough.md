# Walkthrough: Gemini Integration into RAG System

## Changes Made
- **Gemini Client**: Created `backend/utils/geminiClient.js` using `gemini-2.0-flash` model.
- **RAG Engine**: Updated `backend/services/ragEngine.js` to use Gemini for all LLM tasks (answering, headlines, gap analysis).
- **Embeddings**: Rewrote `backend/utils/embeddings.js` to use Gemini `text-embedding-004` instead of OpenAI. This removes the dependency on `OPENAI_API_KEY`.
- **Vector Store**: Fixed `backend/services/vectorStore.js` to use a valid default URL (`http://localhost:8000`) and handle connection failures gracefully.
- **Dependencies**: Installed `chromadb` and `axios`.

## Verification
- Verified `GEMINI_API_KEY` works with `gemini-2.0-flash`.
- Verified `text-embedding-004` generates embeddings successfully.
- Verified `ragEngine` runs successfully, falling back to keyword search if ChromaDB is not running.

## How to Run
1. Ensure `GEMINI_API_KEY` is set in `.env`.
2. (Optional) Run a ChromaDB server on `localhost:8000` for semantic search.
3. Start the backend: `node backend/server.js`.
4. Upload documents via the UI.

## Next Steps
- Run the migration script (if you have existing data) to generate embeddings for old documents.
- Start ChromaDB to enable semantic search.

---
*Generated on 2025-11-22*
