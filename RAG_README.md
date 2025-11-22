# AI EduPlanner - RAG System Setup

## Overview
The AI EduPlanner now includes a full RAG (Retrieval-Augmented Generation) Content Intelligence Engine with backend server and database.

## Architecture
- **Frontend**: React + Vite (Port 5173/5174)
- **Backend**: Express.js (Port 5000)
- **Database**: SQLite
- **Document Processing**: PDF parsing, text chunking, simulated embeddings
- **RAG Engine**: TF-IDF based retrieval, study plan generation, knowledge graph

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Backend Server
```bash
npm run server
```

The backend will start on `http://localhost:5000`

### 3. Start the Frontend (in a new terminal)
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` or `http://localhost:5174`

### 4. Run Both Concurrently (Alternative)
```bash
npm run dev:all
```

## Features

### Document Management
- Upload PDF, TXT, DOC, DOCX files to Sets
- Automatic text extraction and chunking
- Metadata tagging (subject, grade, difficulty)

### RAG Operations
- **Content Finder**: Search across all uploaded documents with citations
- **AI Planner**: Generate structured study plans from document content
- **Knowledge Map**: Auto-generate connections between related Sets
- **Headlines**: Extract key concepts from documents
- **Gap Analysis**: Identify missing topics and weak areas

### API Endpoints

#### Sets
- `GET /api/sets` - List all sets
- `POST /api/sets` - Create new set
- `GET /api/sets/:id` - Get set details
- `PUT /api/sets/:id` - Update set
- `DELETE /api/sets/:id` - Delete set

#### Documents
- `POST /api/documents/upload/:setId` - Upload document
- `GET /api/documents/set/:setId` - Get documents for set
- `DELETE /api/documents/:id` - Delete document

#### RAG
- `POST /api/rag/query` - Query documents
- `POST /api/rag/generate-plan/:setId` - Generate study plan
- `GET /api/rag/connections/:setId` - Get set connections
- `POST /api/rag/headlines/:setId` - Generate headlines
- `POST /api/rag/gap-analysis/:setId` - Analyze knowledge gaps

#### Search
- `POST /api/search` - Search across all documents
- `GET /api/search/related/:setId` - Get related sets

## Usage

### 1. Create a Set
```javascript
const setData = {
  name: "Calculus Fundamentals",
  subject: "Mathematics",
  grade: "12",
  difficulty: "medium",
  description: "Core calculus concepts"
};
```

### 2. Upload Documents
Use the DocumentUpload component or API:
```javascript
await uploadDocument(setId, pdfFile);
```

### 3. Query Documents
```javascript
const results = await queryDocuments("integration by parts", setId);
```

### 4. Generate Study Plan
```javascript
const plan = await generateStudyPlan(setId, 7, 2); // 7 days, 2 hours/day
```

## Database Schema

### Tables
- `sets` - Set metadata
- `documents` - Uploaded documents
- `chunks` - Document chunks with embeddings
- `connections` - Set relationships
- `study_plans` - Generated study plans
- `headlines` - Extracted headlines

## Current Limitations (Simulated RAG)

- **Embeddings**: Using TF-IDF instead of neural embeddings
- **Generation**: Template-based instead of LLM
- **Retrieval**: Keyword + TF-IDF instead of semantic search

## Future Enhancements

To upgrade to real RAG:
1. Replace simulated embeddings with OpenAI/Cohere embeddings
2. Add vector database (Pinecone, Weaviate, ChromaDB)
3. Integrate LLM for generation (GPT-4, Claude, Llama)
4. Add semantic search capabilities
5. Implement advanced chunking strategies

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Ensure all dependencies are installed
- Check `backend/database.sqlite` permissions

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Ensure API_BASE_URL in `src/services/api.js` is correct

### Document upload fails
- Check file size (max 10MB)
- Verify file type (PDF, TXT, DOC, DOCX)
- Check `backend/uploads/` directory permissions

## Development

### File Structure
```
AIEduPlanner/
├── backend/
│   ├── server.js
│   ├── config/database.js
│   ├── routes/
│   ├── services/
│   └── utils/
├── src/
│   ├── contexts/RAGContext.jsx
│   ├── services/api.js
│   └── components/
└── package.json
```

### Adding New Features
1. Add route in `backend/routes/`
2. Add service logic in `backend/services/`
3. Update API client in `src/services/api.js`
4. Add method to RAGContext
5. Use in components via `useRAG()` hook

## License
MIT
