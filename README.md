# EduPlan.ai 🧠✨

**An AI-Powered Learning Platform with 3D Knowledge Graphs, RAG Technology, and Intelligent Study Planning**

EduPlan.ai is a modern, full-stack educational platform that leverages artificial intelligence to revolutionize how students learn. Upload documents, visualize knowledge connections in 3D, discover curated learning resources, and track your progress with AI-powered analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)

---

## 🌟 Key Features

### 🎨 Modern UI/UX
- **Stunning Landing Page**: Crypto-inspired design with animated gradients and floating particles
- **Hydrangea Color Palette**: Beautiful pink-purple theme (#FF8DA1, #FFC2BA, #FF9CE9, #AD56C4)
- **Glassmorphism Design**: Modern translucent cards with backdrop blur effects
- **Mobile Responsive**: Adaptive navigation with bottom menu bar for mobile devices
- **Guest Demo Mode**: Try the platform instantly without signing up

### 🧠 3D Knowledge Graph
- **Interactive Visualization**: Explore your study materials as an interconnected 3D graph
- **Topic Relationships**: See connections between different subjects and concepts
- **Visual Navigation**: Click and explore your learning path intuitively

### ⚡ AI Studio (RAG)
- **Document Upload**: Support for PDF, TXT, and DOC files
- **Intelligent Q&A**: Ask questions about your uploaded documents
- **RAG Technology**: Retrieval-Augmented Generation powered by Google Gemini
- **Context-Aware Answers**: Get accurate responses based on your study materials

### 🔍 Content Discovery
- **AI-Curated Resources**: Find educational materials from Khan Academy, Coursera, YouTube, and more
- **Smart Recommendations**: Personalized content suggestions based on your learning path
- **Multi-Platform Search**: Access resources from multiple educational platforms

### 📊 Progress Analytics
- **Learning Dashboard**: Track your study progress in real-time
- **Gap Analysis**: AI identifies knowledge gaps and suggests improvements
- **Personalized Insights**: Data-driven recommendations for better learning outcomes

### 🔐 Secure Authentication
- **OTP Verification**: Email-based signup with one-time passwords via Gmail SMTP
- **Strong Password Policy**: Enforced password requirements for account security
- **Guest Access**: Try the demo without creating an account

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key
- Gmail account for SMTP (optional, for OTP verification)

### 1. Clone the Repository
```bash
git clone https://github.com/Tamish03/Eduplan.git
cd Eduplan
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_GENERATION_MODELS=gemini-2.0-flash,gemini-1.5-flash,gemini-1.5-flash-8b
GEMINI_EMBEDDING_MODELS=gemini-embedding-001,text-embedding-004,embedding-001

# Backend Configuration
PORT=5000
VITE_API_BASE_URL=http://localhost:5000/api

# SMTP Configuration (Optional - for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=EduPlan <your_gmail@gmail.com>
```

**Note**: You can copy from `.env.example` and fill in your values.

### 4. Start the Backend Server
```bash
cd backend
npm start
```
Backend will run at: `http://localhost:5000`

### 5. Start the Frontend Development Server
Open a new terminal:
```bash
npm run dev
```
Frontend will run at: `http://localhost:5173`

### 6. Access the Application
Open your browser and navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
Eduplan/
├── backend/                    # Node.js + Express backend
│   ├── config/
│   │   └── database.js        # SQLite database configuration
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── sets.js            # Study set management
│   │   ├── documents.js       # Document upload/management
│   │   ├── rag.js             # RAG query processing
│   │   ├── search.js          # Content discovery
│   │   └── progress.js        # Analytics and progress tracking
│   ├── services/
│   │   ├── documentProcessor.js    # Document parsing
│   │   ├── ragEngine.js            # RAG implementation
│   │   ├── knowledgeGraph.js       # 3D graph generator
│   │   ├── planGenerator.js        # Study plan creation
│   │   └── progressAnalytics.js    # Progress analysis
│   ├── utils/
│   │   ├── embeddings.js           # Vector embeddings
│   │   ├── geminiClient.js         # Gemini API client
│   │   ├── promptTemplates.js      # AI prompts
│   │   └── chunker.js              # Document chunking
│   ├── uploads/                    # Uploaded documents storage
│   ├── database.sqlite             # SQLite database
│   └── server.js                   # Express server entry point
│
├── src/                       # React frontend
│   ├── components/
│   │   ├── LandingPage.jsx         # Modern landing page
│   │   ├── GraphView.jsx           # 3D knowledge graph
│   │   ├── ContentFinder.jsx       # Content discovery
│   │   ├── ProgressView.jsx        # Analytics dashboard
│   │   ├── RAGTestUI.jsx           # AI Studio interface
│   │   ├── WelcomeModal.jsx        # Welcome tour modal
│   │   ├── Tour.jsx                # Interactive tour
│   │   └── auth/
│   │       ├── Login.jsx           # Login page
│   │       └── Signup.jsx          # Signup with OTP
│   ├── services/
│   │   └── api.js                  # API client
│   ├── index.css                   # Global styles + animations
│   └── App.jsx                     # Main application component
│
├── .env.example               # Environment variables template
├── package.json               # Frontend dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── README.md                 # This file
```

---

## 🎯 Feature Workflow

### 1. **Sign Up / Guest Demo**
- Create an account with OTP verification
- Or try instantly as a guest user

### 2. **Create Study Sets**
- Upload documents (PDF, TXT, DOC)
- AI processes and analyzes content
- Documents are chunked and embedded

### 3. **Visualize Knowledge**
- View study sets in interactive 3D graph
- Explore topic connections
- Navigate through your learning path

### 4. **Discover Resources**
- Search for educational content
- Get AI-curated recommendations
- Access materials from multiple platforms

### 5. **Ask Questions**
- Use AI Studio to query your documents
- Get intelligent answers with context
- RAG technology ensures accuracy

### 6. **Track Progress**
- Monitor learning analytics
- Identify knowledge gaps
- Receive personalized recommendations

### 7. **Achieve Goals**
- Complete learning objectives
- Celebrate milestones
- Continue improving with AI insights

---

## 🛠️ Technologies Used

### Frontend
- **React 18.2.0**: Modern UI library
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **React Force Graph**: 3D graph visualization
- **Axios**: HTTP client

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **SQLite3**: Lightweight database
- **Google Gemini AI**: Language model and embeddings
- **Multer**: File upload handling
- **Nodemailer**: Email sending for OTP
- **bcryptjs**: Password hashing
- **pdf-parse**: PDF document parsing

### AI/ML
- **RAG (Retrieval-Augmented Generation)**: For intelligent Q&A
- **Vector Embeddings**: Document similarity and search
- **Gemini 2.0 Flash**: Fast AI responses
- **ChromaDB**: Vector storage (optional)

---

## 🔌 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send-signup-otp` | Send OTP for new signups |
| POST | `/signup` | Create new account with OTP verification |
| POST | `/login` | Login with email/password |
| POST | `/send-reset-otp` | Send OTP for password reset |
| POST | `/reset-password` | Reset password with OTP |

### Study Sets (`/api/sets`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create new study set |
| GET | `/` | Get all user's study sets |
| GET | `/:id` | Get specific study set |
| PUT | `/:id` | Update study set details |
| DELETE | `/:id` | Delete study set |

### Documents (`/api/documents`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/:setId` | Upload document to study set |
| GET | `/set/:setId` | Get all documents in a set |
| DELETE | `/:id` | Delete a document |

### RAG AI Studio (`/api/rag`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/query` | Ask questions about documents |
| POST | `/generate-plan/:setId` | Generate AI study plan |
| GET | `/connections/:setId` | Get knowledge graph connections |
| GET | `/headlines` | Get recent RAG activity |
| POST | `/headlines/:setId` | Get set-specific headlines |
| POST | `/gap-analysis/:setId` | Analyze knowledge gaps |

### Content Discovery (`/api/search`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Search educational resources |
| GET | `/related/:setId` | Get related content for study set |

### Progress & Analytics (`/api/progress`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/overview` | Get overall progress data |
| GET | `/gap-analysis/:setId` | Get knowledge gap analysis |
| POST | `/session` | Log study session |
| POST | `/quiz` | Record quiz performance |
| POST | `/interaction` | Track user interactions |

### Advanced Features (`/api/advanced`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/learning-twin/:setId` | Get AI learning twin |
| POST | `/learning-twin/:setId/recompute` | Recompute learning twin |
| POST | `/safe-query` | Ask questions with safety filters |
| GET | `/breakpoint/:setId` | Get study breakpoints |
| POST | `/exam/generate/:setId` | Generate practice exam |
| GET | `/exam/session/:sessionId` | Get exam session |
| POST | `/exam/submit/:sessionId` | Submit exam answers |

### System Health (`/api`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check API health status |

---

## 🐛 Recent Fixes & Improvements

### Backend Enhancements
- ✅ Unified frontend API configuration via `VITE_API_BASE_URL`
- ✅ Fixed RAG document ingestion with Gemini embeddings + SQLite chunks
- ✅ Enabled SQLite foreign keys for safer cascading cleanup
- ✅ Improved document deletion with automatic chunk cleanup
- ✅ Fixed study plan join bug in backend services
- ✅ Tightened upload validation (PDF, TXT, DOC support)

### Frontend Enhancements
- ✅ Modern landing page with crypto-inspired design
- ✅ Complete UI redesign with Hydrangea color palette
- ✅ Fixed tour overlay getting stuck after completion
- ✅ Guest demo mode for instant access
- ✅ Mobile-responsive bottom navigation
- ✅ Glassmorphism design with backdrop blur effects
- ✅ Enhanced navigation labels (Learning Path, Discover, Analytics, AI Studio)
- ✅ Functional footer with smooth scroll navigation

---

## 🎨 Design System

### Hydrangea Color Palette
EduPlan.ai uses a beautiful, cohesive color scheme inspired by hydrangea flowers:

- **Pink**: `#FF8DA1` - Primary accent, buttons, highlights
- **Peach**: `#FFC2BA` - Secondary accent, hover states
- **Magenta**: `#FF9CE9` - Tertiary accent, gradients
- **Purple**: `#AD56C4` - Primary background, headers

### Custom Animations
- **Float**: Smooth vertical floating motion for particles and orbs
- **Gradient**: Animated gradient backgrounds
- **Fade-in**: Gentle entrance animations for content

---

## 🧪 How RAG Technology Works

EduPlan.ai uses **Retrieval-Augmented Generation (RAG)** to provide intelligent answers about your study materials:

1. **Document Upload**: You upload PDFs, TXT, or DOC files
2. **Text Extraction**: Backend extracts text using pdf-parse and other parsers
3. **Chunking**: Documents are split into meaningful segments (chunks)
4. **Embedding**: Each chunk is converted to vector embeddings using Gemini
5. **Storage**: Chunks and embeddings are stored in SQLite database
6. **Query**: When you ask a question, it's also converted to an embedding
7. **Retrieval**: Most relevant chunks are retrieved using similarity search
8. **Generation**: Gemini generates an answer using retrieved context
9. **Response**: You get an accurate, context-aware answer

---

## 📊 Database Schema

### Users
- `id`, `email`, `name`, `password_hash`, `created_at`

### Study Sets
- `id`, `user_id`, `name`, `description`, `color`, `created_at`

### Documents
- `id`, `set_id`, `filename`, `file_path`, `file_size`, `mime_type`, `upload_date`

### Document Chunks
- `id`, `document_id`, `content`, `embedding`, `chunk_index`, `metadata`

### Progress Tracking
- Study sessions, quiz results, interaction logs

---

## 🔍 Troubleshooting

### Backend won't start
**Error**: `EADDRINUSE: port 5000 already in use`
- **Solution**: Kill the process on port 5000 or change `PORT` in `.env`
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### Frontend API calls failing
**Error**: Network errors or CORS issues
- **Solution**: Ensure `VITE_API_BASE_URL=http://localhost:5000/api` in `.env`
- Check that backend is running on the correct port

### RAG not working
**Error**: "Failed to generate response" or empty answers
- **Solution**: Verify `GEMINI_API_KEY` in `.env` is valid
- Check backend logs for API errors
- Ensure documents are properly uploaded and processed

### OTP emails not sending
**Error**: Signup OTP never arrives
- **Solution**: Check SMTP configuration in `.env`
- Use Gmail App Password (not regular password)
- Alternative: Use Guest Demo mode instead

### Documents not uploading
**Error**: Upload fails or gets stuck
- **Solution**: Check file format (PDF, TXT, DOC only)
- Verify backend `uploads/` directory exists and is writable
- Check file size limits (default: 10MB)

---

## 🚀 Deployment

### Backend Deployment (Node.js)
1. Choose a platform (Render, Railway, Heroku, AWS)
2. Set environment variables in platform settings
3. Ensure SQLite file persists (use volume/storage)
4. Deploy backend first, note the URL

### Frontend Deployment (Vite/React)
1. Update `VITE_API_BASE_URL` to backend URL
2. Build production bundle: `npm run build`
3. Deploy `dist/` folder to Vercel, Netlify, or Cloudflare Pages
4. Configure redirects for SPA routing

### Environment Variables for Production
```env
# Backend
GEMINI_API_KEY=your_production_key
PORT=5000
NODE_ENV=production

# Frontend (build-time)
VITE_API_BASE_URL=https://your-backend.com/api
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style (ESLint/Prettier)
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI**: For powering RAG and embeddings
- **React Force Graph**: For 3D knowledge visualization
- **Tailwind CSS**: For rapid UI development
- **Lucide Icons**: For beautiful iconography
- **The Open Source Community**: For inspiration and tools.

---

## 📧 Contact & Support

- **GitHub**: [Tamish03/Eduplan](https://github.com/Tamish03/Eduplan)
- **Issues**: Report bugs or request features via GitHub Issues
- **Demo**: Try the guest demo at the landing page

---

## 🗺️ Roadmap

### Planned Features
- [ ] Mobile apps (React Native)
- [ ] Collaborative study groups
- [ ] Spaced repetition flashcards
- [ ] Video content integration
- [ ] Offline mode
- [ ] Dark/Light theme toggle
- [ ] Export progress reports
- [ ] AI-powered study schedules
- [ ] Voice input for queries
- [ ] Multi-language support

---

**Made with 💜 by the EduPlan.ai Team**

*Transforming education through AI, one document at a time.*