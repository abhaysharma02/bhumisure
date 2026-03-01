const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

const connectDB = async () => {
  try {
    dbInstance = await open({
      filename: path.join(__dirname, '../../database.sqlite'),
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await dbInstance.run('PRAGMA foreign_keys = ON');

    console.log('✅ SQLite Connected successfully');
  } catch (error) {
    console.error('❌ SQLite connection failed', error.message);
  }
};

// Mock the pg pool interface so we don't have to rewrite all our route queries
const pool = {
  query: async (text, params = []) => {
    if (!dbInstance) throw new Error("Database not connected");

    let sqliteText = text;

    // Convert PostgreSQL $1, $2 to SQLite ?
    sqliteText = sqliteText.replace(/\$\d+/g, '?');
    // Convert ILIKE to LIKE for SQLite
    sqliteText = sqliteText.replace(/ILIKE/g, 'LIKE');

    try {
      // Determine if query returns rows
      const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT');
      const isPragma = sqliteText.trim().toUpperCase().startsWith('PRAGMA');

      if (isSelect || isPragma) {
        const rows = await dbInstance.all(sqliteText, params);
        return { rows };
      } else {
        const result = await dbInstance.run(sqliteText, params);
        return { rows: [], rowCount: result.changes, lastID: result.lastID };
      }
    } catch (e) {
      console.error("SQL Error:", e.message, "\nQuery:", sqliteText, params);
      throw e;
    }
  },
  connect: async () => {
    return {
      query: pool.query,
      release: () => { } // no-op
    };
  }
};

module.exports = { pool, connectDB };
