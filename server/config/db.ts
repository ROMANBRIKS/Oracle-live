import Database from "better-sqlite3";

const db = new Database("oracle.db");

try {
  db.exec(`ALTER TABLE users ADD COLUMN email TEXT;`);
} catch (e) {}

try {
  db.exec(`UPDATE users SET role = 'admin' WHERE email = 'irionguard@gmail.com';`);
} catch (e) {}

try {
  db.exec(`UPDATE users SET role = 'admin' WHERE username = 'Developer';`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN btc_wallet TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN eth_wallet TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN usdt_wallet TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN location_iso TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN device_info TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN whale_score INTEGER DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN viral_points INTEGER DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN fiat_usd REAL DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN fiat_ghs REAL DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN crypto_btc REAL DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN crypto_eth REAL DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN crypto_usdt REAL DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN crypto_sol REAL DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN crypto_bnb REAL DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN crypto_trx REAL DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE users ADD COLUMN earnings_balance REAL DEFAULT 0;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'success';`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE transactions ADD COLUMN provider TEXT DEFAULT 'mock';`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'USD';`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE transactions ADD COLUMN wallet_address TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE transactions ADD COLUMN network TEXT;`);
} catch (e) {}

try {
  db.exec(`ALTER TABLE transactions ADD COLUMN tx_hash TEXT;`);
} catch (e) {}
 
// Initialize tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    coins INTEGER DEFAULT 1000,
    total_spent INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'user',
    btc_wallet TEXT,
    eth_wallet TEXT,
    usdt_wallet TEXT,
    location_iso TEXT,
    device_info TEXT,
    whale_score INTEGER DEFAULT 0,
    viral_points INTEGER DEFAULT 0,
    fiat_usd REAL DEFAULT 0,
    fiat_ghs REAL DEFAULT 0,
    crypto_btc REAL DEFAULT 0,
    crypto_eth REAL DEFAULT 0,
    crypto_usdt REAL DEFAULT 0,
    crypto_sol REAL DEFAULT 0,
    crypto_bnb REAL DEFAULT 0,
    crypto_trx REAL DEFAULT 0,
    earnings_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS streams (
    id TEXT PRIMARY KEY,
    host_id TEXT,
    title TEXT,
    viewer_count INTEGER DEFAULT 0,
    is_live BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(host_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS kyc_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    full_name TEXT,
    country TEXT,
    id_type TEXT,
    id_front TEXT,
    id_back TEXT,
    selfie TEXT,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    amount INTEGER,
    type TEXT,
    status TEXT DEFAULT 'success',
    provider TEXT DEFAULT 'mock',
    currency TEXT DEFAULT 'USD',
    wallet_address TEXT,
    network TEXT,
    tx_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    category TEXT,
    stream_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS agencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    owner_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS agency_members (
    agency_id INTEGER,
    user_id TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(agency_id, user_id),
    FOREIGN KEY(agency_id) REFERENCES agencies(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bans (
    user_id TEXT PRIMARY KEY,
    reason TEXT,
    admin_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mutes (
    user_id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id TEXT,
    target_user_id TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    streamer_id TEXT,
    stream_id TEXT,
    viewers INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    gifts INTEGER DEFAULT 0,
    earnings INTEGER DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(streamer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    amount REAL,
    currency TEXT,
    method TEXT,
    wallet_address TEXT,
    bank_name TEXT,
    account_number TEXT,
    account_name TEXT,
    provider TEXT,
    number TEXT,
    status TEXT DEFAULT 'pending',
    admin_note TEXT,
    tx_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    title TEXT,
    message TEXT,
    type TEXT DEFAULT 'system',
    read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    currency TEXT,
    amount REAL,
    wallet_address TEXT,
    tx_hash TEXT,
    network TEXT,
    status TEXT DEFAULT 'pending',
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_streams_is_live ON streams(is_live);
  CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity(user_id);
  CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
  CREATE INDEX IF NOT EXISTS idx_analytics_streamer ON analytics(streamer_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
`);

export default db;
