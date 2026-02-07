const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        db.run('PRAGMA foreign_keys = ON');
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Sets table
        db.run(`
      CREATE TABLE IF NOT EXISTS sets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT,
        grade TEXT,
        difficulty TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Documents table
        db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        set_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        page_count INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
      )
    `);

        // Chunks table
        db.run(`
      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        set_id TEXT NOT NULL,
        content TEXT NOT NULL,
        chunk_index INTEGER,
        page_number INTEGER,
        start_char INTEGER,
        end_char INTEGER,
        embedding TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
      )
    `);

        // Connections table (Set relationships)
        db.run(`
      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        source_set_id TEXT NOT NULL,
        target_set_id TEXT NOT NULL,
        connection_type TEXT,
        strength REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_set_id) REFERENCES sets(id) ON DELETE CASCADE,
        FOREIGN KEY (target_set_id) REFERENCES sets(id) ON DELETE CASCADE
      )
    `);

        // Study plans table
        db.run(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id TEXT PRIMARY KEY,
        set_id TEXT NOT NULL,
        plan_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
      )
    `);

        // Headlines table
        db.run(`
      CREATE TABLE IF NOT EXISTS headlines (
        id TEXT PRIMARY KEY,
        set_id TEXT,
        title TEXT NOT NULL,
        content TEXT,
        source TEXT,
        relevance_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE SET NULL
      )
    `);

        // Study sessions table - track when user studies each set
        db.run(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id TEXT PRIMARY KEY,
        set_id TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        activities TEXT,
        notes TEXT,
        session_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
      )
    `);

        // Quiz results table - track quiz/assessment performance
        db.run(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id TEXT PRIMARY KEY,
        set_id TEXT NOT NULL,
        topic TEXT,
        score REAL NOT NULL,
        total_questions INTEGER,
        correct_answers INTEGER,
        time_taken_minutes INTEGER,
        weak_areas TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
      )
    `);

        // User interactions table - track queries and document interactions
        db.run(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id TEXT PRIMARY KEY,
        set_id TEXT,
        interaction_type TEXT NOT NULL,
        query TEXT,
        result_quality REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE SET NULL
      )
    `);

        // Users table - authentication
        db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        email_verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // OTP table for signup and password reset
        db.run(`
      CREATE TABLE IF NOT EXISTS email_otps (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        otp_hash TEXT NOT NULL,
        purpose TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Learning Twin profiles per set
        db.run(`
      CREATE TABLE IF NOT EXISTS learning_profiles (
        id TEXT PRIMARY KEY,
        set_id TEXT NOT NULL UNIQUE,
        profile_json TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
      )
    `);

        // Exam mode sessions
        db.run(`
      CREATE TABLE IF NOT EXISTS exam_sessions (
        id TEXT PRIMARY KEY,
        set_id TEXT NOT NULL,
        questions_json TEXT NOT NULL,
        answer_key_json TEXT NOT NULL,
        answers_json TEXT,
        score REAL,
        total_questions INTEGER NOT NULL,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        submitted_at DATETIME,
        FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE
      )
    `);

        console.log('Database tables initialized');
    });
}

module.exports = db;

