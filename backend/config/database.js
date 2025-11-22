const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
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

        console.log('✅ Database tables initialized');
    });
}

module.exports = db;
