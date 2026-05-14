import Database from "better-sqlite3";
import fs from "fs";

let dbInstance: any;

try {
  dbInstance = new Database("oracle.db");
  // Quick check to see if database file is corrupt
  dbInstance.exec("PRAGMA integrity_check(1);");
} catch (error: any) {
  console.error("Database connection failed or corrupt. Initiating automated self-healing...", error);
  try {
    if (fs.existsSync("oracle.db")) {
      const backupName = `oracle.db.corrupt.${Date.now()}`;
      console.warn(`Renaming malformed database to ${backupName}`);
      fs.renameSync("oracle.db", backupName);
    }
  } catch (fsErr) {
    console.error("File system recovery error:", fsErr);
  }
  dbInstance = new Database("oracle.db");
}

const db = dbInstance;

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
    name TEXT,
    avatar TEXT,
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

  CREATE TABLE IF NOT EXISTS stream_analytics (
    id TEXT PRIMARY KEY,
    streamer_id TEXT,
    room_id TEXT,
    total_viewers INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    total_gifts INTEGER DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    watch_time INTEGER DEFAULT 0,
    new_followers INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    stream_duration INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

  CREATE TABLE IF NOT EXISTS fiat_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    amount REAL,
    currency TEXT,
    account_number TEXT,
    bank_code TEXT,
    transfer_code TEXT,
    status TEXT DEFAULT 'pending',
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

  CREATE TABLE IF NOT EXISTS staff_admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'support_admin',
    permissions TEXT, -- JSON array of strings
    manage_users BOOLEAN DEFAULT 0,
    manage_payments BOOLEAN DEFAULT 0,
    manage_streams BOOLEAN DEFAULT 0,
    manage_moderation BOOLEAN DEFAULT 0,
    manage_treasury BOOLEAN DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id TEXT,
    action TEXT,
    target_id TEXT,
    target_type TEXT,
    metadata TEXT, -- JSON
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(admin_id) REFERENCES users(id) -- or staff_admins(id)
  );

  CREATE TABLE IF NOT EXISTS hls_streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT UNIQUE,
    streamer_id TEXT,
    hls_url TEXT,
    status TEXT DEFAULT 'offline',
    viewers INTEGER DEFAULT 0,
    quality_levels TEXT, -- JSON string of qualities
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(streamer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS stream_recordings (
    id TEXT PRIMARY KEY,
    streamer_id TEXT,
    room_id TEXT,
    title TEXT,
    thumbnail TEXT,
    recording_url TEXT,
    duration INTEGER,
    viewers INTEGER DEFAULT 0,
    status TEXT DEFAULT 'processing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(streamer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS gifts (
    id TEXT PRIMARY KEY,
    name TEXT,
    icon TEXT,
    animation TEXT,
    price INTEGER,
    rarity TEXT DEFAULT 'common',
    category TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gift_transactions (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    receiver_id TEXT,
    room_id TEXT,
    gift_id TEXT,
    quantity INTEGER DEFAULT 1,
    total_coins INTEGER,
    combo_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id),
    FOREIGN KEY(gift_id) REFERENCES gifts(id)
  );

  CREATE TABLE IF NOT EXISTS leaderboards (
    user_id TEXT,
    type TEXT, -- 'streamer', 'gifter', 'agency'
    region TEXT DEFAULT 'global',
    daily_points INTEGER DEFAULT 0,
    weekly_points INTEGER DEFAULT 0,
    monthly_points INTEGER DEFAULT 0,
    global_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges TEXT DEFAULT '[]', -- JSON string
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, type),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS agencies (
    id TEXT PRIMARY KEY,
    name TEXT,
    logo TEXT,
    owner_id TEXT,
    description TEXT,
    region TEXT DEFAULT 'global',
    commission_rate REAL DEFAULT 10.0,
    total_revenue REAL DEFAULT 0.0,
    total_creators INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS agency_members (
    agency_id TEXT,
    creator_id TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revenue_generated REAL DEFAULT 0.0,
    agency_commission_earned REAL DEFAULT 0.0,
    contract_status TEXT DEFAULT 'active',
    PRIMARY KEY(agency_id, creator_id),
    FOREIGN KEY(agency_id) REFERENCES agencies(id),
    FOREIGN KEY(creator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS live_moderation (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    target_user_id TEXT,
    moderator_id TEXT,
    action TEXT, -- 'mute', 'kick', 'ban', 'shadow_ban', 'warning'
    reason TEXT,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(target_user_id) REFERENCES users(id),
    FOREIGN KEY(moderator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS pk_battles (
    id TEXT PRIMARY KEY,
    room_id TEXT,
    host_a TEXT,
    host_b TEXT,
    score_a INTEGER DEFAULT 0,
    score_b INTEGER DEFAULT 0,
    winner TEXT,
    status TEXT DEFAULT 'waiting', 
    duration INTEGER DEFAULT 300,
    started_at DATETIME,
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(host_a) REFERENCES users(id),
    FOREIGN KEY(host_b) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS multi_guest_rooms (
    room_id TEXT PRIMARY KEY,
    host_id TEXT,
    title TEXT,
    type TEXT DEFAULT 'video',
    max_guests INTEGER DEFAULT 9,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(host_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS guest_seats (
    room_id TEXT,
    seat_number INTEGER,
    user_id TEXT,
    mic_muted BOOLEAN DEFAULT 0,
    camera_off BOOLEAN DEFAULT 0,
    locked BOOLEAN DEFAULT 0,
    PRIMARY KEY(room_id, seat_number),
    FOREIGN KEY(room_id) REFERENCES multi_guest_rooms(room_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS creator_wallets (
    user_id TEXT PRIMARY KEY,
    coins INTEGER DEFAULT 0,
    diamonds INTEGER DEFAULT 0,
    total_earnings_usd REAL DEFAULT 0,
    pending_usd REAL DEFAULT 0,
    available_usd REAL DEFAULT 0,
    total_withdrawn_usd REAL DEFAULT 0,
    crypto_usdt REAL DEFAULT 0,
    crypto_btc REAL DEFAULT 0,
    crypto_eth REAL DEFAULT 0,
    crypto_trx REAL DEFAULT 0,
    crypto_bnb REAL DEFAULT 0,
    crypto_sol REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS stream_clips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    streamer_id TEXT,
    room_id TEXT,
    title TEXT,
    thumbnail TEXT,
    clip_url TEXT,
    duration INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(streamer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS recommendation_scores (
    room_id TEXT PRIMARY KEY,
    streamer_id TEXT,
    live_viewers INTEGER DEFAULT 0,
    watch_time INTEGER DEFAULT 0,
    engagement_rate INTEGER DEFAULT 0,
    gift_score INTEGER DEFAULT 0,
    share_score INTEGER DEFAULT 0,
    follow_score INTEGER DEFAULT 0,
    report_score INTEGER DEFAULT 0,
    trending_score INTEGER DEFAULT 0,
    final_score REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(streamer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS treasury (
    currency TEXT PRIMARY KEY,
    hot_wallet_balance REAL DEFAULT 0,
    cold_wallet_balance REAL DEFAULT 0,
    pending_withdrawals REAL DEFAULT 0,
    low_liquidity BOOLEAN DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS moderation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    room_id TEXT,
    type TEXT CHECK(type IN ('warning', 'mute', 'ban', 'message_delete')),
    reason TEXT,
    message TEXT,
    severity TEXT CHECK(severity IN ('low', 'medium', 'high')) DEFAULT 'low',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS crypto_wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    chain TEXT,
    address TEXT,
    encrypted_private_key TEXT,
    balance REAL DEFAULT 0,
    wallet_type TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user ON crypto_wallets(user_id);
  CREATE INDEX IF NOT EXISTS idx_streams_is_live ON streams(is_live);
  CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity(user_id);
  CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
  CREATE INDEX IF NOT EXISTS idx_analytics_streamer ON analytics(streamer_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_creator_wallets_user ON creator_wallets(user_id);
  CREATE INDEX IF NOT EXISTS idx_recommendation_scores_final ON recommendation_scores(final_score);
`);

// MIGRATIONS - MUST RUN BEFORE SEEDING
const migrations = [
  "ALTER TABLE users ADD COLUMN email TEXT;",
  "UPDATE users SET role = 'admin' WHERE email = 'irionguard@gmail.com';",
  "UPDATE users SET role = 'admin' WHERE username = 'Developer';",
  "ALTER TABLE users ADD COLUMN btc_wallet TEXT;",
  "ALTER TABLE users ADD COLUMN eth_wallet TEXT;",
  "ALTER TABLE users ADD COLUMN usdt_wallet TEXT;",
  "ALTER TABLE users ADD COLUMN location_iso TEXT;",
  "ALTER TABLE users ADD COLUMN device_info TEXT;",
  "ALTER TABLE users ADD COLUMN whale_score INTEGER DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN viral_points INTEGER DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN fiat_usd REAL DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN fiat_ghs REAL DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN crypto_btc REAL DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN crypto_eth REAL DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN crypto_usdt REAL DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN crypto_sol REAL DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN crypto_bnb REAL DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN crypto_trx REAL DEFAULT 0;",
  "ALTER TABLE users ADD COLUMN earnings_balance REAL DEFAULT 0;",
  "ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'success';",
  "ALTER TABLE transactions ADD COLUMN provider TEXT DEFAULT 'mock';",
  "ALTER TABLE transactions ADD COLUMN currency TEXT DEFAULT 'USD';",
  "ALTER TABLE transactions ADD COLUMN wallet_address TEXT;",
  "ALTER TABLE transactions ADD COLUMN network TEXT;",
  "ALTER TABLE transactions ADD COLUMN tx_hash TEXT;",
  "ALTER TABLE withdrawals ADD COLUMN crypto_type TEXT;",
  "ALTER TABLE withdrawals ADD COLUMN amount_crypto REAL;",
  "ALTER TABLE users ADD COLUMN name TEXT;",
  "ALTER TABLE users ADD COLUMN avatar TEXT;",
  "ALTER TABLE leaderboards ADD COLUMN region TEXT DEFAULT 'global';",
  "ALTER TABLE leaderboards ADD COLUMN badges TEXT DEFAULT '[]';",
  "ALTER TABLE agencies ADD COLUMN logo TEXT;",
  "ALTER TABLE agencies ADD COLUMN owner_id TEXT;",
  "ALTER TABLE agencies ADD COLUMN description TEXT;",
  "ALTER TABLE agencies ADD COLUMN region TEXT DEFAULT 'global';",
  "ALTER TABLE agencies ADD COLUMN commission_rate REAL DEFAULT 10.0;",
  "ALTER TABLE agencies ADD COLUMN total_revenue REAL DEFAULT 0.0;",
  "ALTER TABLE agencies ADD COLUMN total_creators INTEGER DEFAULT 0;",
  "ALTER TABLE agencies ADD COLUMN verified INTEGER DEFAULT 0;",
  "ALTER TABLE agency_members ADD COLUMN creator_id TEXT;",
  "ALTER TABLE agency_members ADD COLUMN revenue_generated REAL DEFAULT 0.0;",
  "ALTER TABLE agency_members ADD COLUMN agency_commission_earned REAL DEFAULT 0.0;",
  "ALTER TABLE agency_members ADD COLUMN contract_status TEXT DEFAULT 'active';",
  "ALTER TABLE transactions ADD COLUMN method TEXT;",
  "ALTER TABLE transactions ADD COLUMN provider_reference TEXT;",
  "ALTER TABLE transactions ADD COLUMN retry_count INTEGER DEFAULT 0;",
  "ALTER TABLE blockchain_transactions ADD COLUMN confirmations INTEGER DEFAULT 0;",
  "ALTER TABLE stream_analytics ADD COLUMN average_watch_time REAL DEFAULT 0.0;",
  "ALTER TABLE stream_analytics ADD COLUMN engagement_score REAL DEFAULT 0.0;",
  "ALTER TABLE stream_analytics ADD COLUMN gift_score REAL DEFAULT 0.0;",
  "ALTER TABLE stream_analytics ADD COLUMN retention_rate REAL DEFAULT 0.0;",
  "ALTER TABLE stream_analytics ADD COLUMN ai_viral_score REAL DEFAULT 0.0;",
  "CREATE TABLE IF NOT EXISTS ai_moderation_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, type TEXT, reason TEXT, severity TEXT, action TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);"
];

migrations.forEach(m => {
  try { db.exec(m); } catch (e) {
    // Silently skip if column already exists
  }
});

// SEED SAMPLE DATA IF EMPTY
const seedUsers = () => {
  const count = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  if (count && count.count === 0) {
    console.log("Seeding sample users...");
    const sampleUsers = [
      { id: 'user_1', username: 'LegendStreamer', name: 'Legend Streamer', avatar: 'https://i.pravatar.cc/150?u=1' },
      { id: 'user_2', username: 'WhaleKing', name: 'Whale King', avatar: 'https://i.pravatar.cc/150?u=2' },
      { id: 'user_3', username: 'GiftMaster', name: 'Gift Master', avatar: 'https://i.pravatar.cc/150?u=3' },
      { id: 'user_4', username: 'StarLive', name: 'Star Live', avatar: 'https://i.pravatar.cc/150?u=4' },
      { id: 'user_5', username: 'OracleDev', name: 'Oracle Developer', avatar: 'https://i.pravatar.cc/150?u=5' }
    ];
    
    sampleUsers.forEach(u => {
      db.prepare("INSERT INTO users (id, username, name, avatar, role) VALUES (?, ?, ?, ?, ?)")
        .run(u.id, u.username, u.name, u.avatar, 'user');
    });
  }
};
try { seedUsers(); } catch (e) { console.error("seedUsers failed:", e); }

const seedLeaderboard = () => {
  const count = db.prepare("SELECT COUNT(*) as count FROM leaderboards").get() as any;
  if (count && count.count === 0) {
    console.log("Seeding sample leaderboard data...");
    const users = db.prepare("SELECT id FROM users LIMIT 5").all() as any[];
    if (users.length > 0) {
       users.forEach((user, i) => {
          db.prepare("INSERT INTO leaderboards (user_id, type, daily_points, weekly_points, monthly_points, global_points, level) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .run(user.id, 'streamer', (5-i)*1000, (5-i)*5000, (5-i)*20000, (5-i)*50000, 5-i);
          db.prepare("INSERT INTO leaderboards (user_id, type, daily_points, weekly_points, monthly_points, global_points, level) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .run(user.id, 'gifter', (5-i)*2000, (5-i)*10000, (5-i)*40000, (5-i)*100000, 5-i);
       });
    }
  }
};
try { seedLeaderboard(); } catch (e) { console.error("seedLeaderboard failed:", e); }

const seedMultiGuest = () => {
  const count = db.prepare("SELECT COUNT(*) as count FROM multi_guest_rooms").get() as any;
  if (count && count.count === 0) {
    console.log("Seeding sample multi-guest room...");
    const roomId = "sample-room";
    db.prepare("INSERT INTO multi_guest_rooms (room_id, host_id, title) VALUES (?, ?, ?)")
      .run(roomId, "user_1", "Oracle Tech Talk & Vibes");
    
    for (let i = 1; i <= 6; i++) {
      db.prepare("INSERT INTO guest_seats (room_id, seat_number) VALUES (?, ?)")
        .run(roomId, i);
    }
  }
};
try { seedMultiGuest(); } catch (e) { console.error("seedMultiGuest failed:", e); }

const seedAgencies = () => {
  const count = db.prepare("SELECT COUNT(*) as count FROM agencies").get() as any;
  if (count && count.count === 0) {
    console.log("Seeding sample agency...");
    const agencyId = 101;
    db.prepare(`
      INSERT INTO agencies (id, name, logo, owner_id, description, region, commission_rate, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(agencyId, "Oracle Elite Talent", "https://i.pravatar.cc/150?u=agency", "user_5", "Top tier streamer agency for Oracle Live gaming & lifestyle creators.", "Global", 12.5, 1);

    // Add some members
    db.prepare("INSERT INTO agency_members (agency_id, creator_id, revenue_generated, agency_commission_earned) VALUES (?, ?, ?, ?)")
      .run(agencyId, "user_1", 50000, 6250);
    db.prepare("INSERT INTO agency_members (agency_id, creator_id, revenue_generated, agency_commission_earned) VALUES (?, ?, ?, ?)")
      .run(agencyId, "user_4", 25000, 3125);
    
    db.prepare("UPDATE agencies SET total_creators = 2, total_revenue = 9375 WHERE id = ?").run(agencyId);
  }
};
try { seedAgencies(); } catch (e) { console.error("seedAgencies failed:", e); }

const seedRecommendations = () => {
  const count = db.prepare("SELECT COUNT(*) as count FROM recommendation_scores").get() as any;
  if (count && count.count === 0) {
    console.log("Seeding sample recommendations...");
    const samples = [
        { rid: 'room_1', sid: 'user_1', viewers: 1200, score: 850, trend: 1 },
        { rid: 'room_2', sid: 'user_2', viewers: 800, score: 720, trend: 0 },
        { rid: 'room_3', sid: 'user_4', viewers: 2400, score: 950, trend: 1 }
    ];
    samples.forEach(s => {
       db.prepare(`
         INSERT INTO recommendation_scores (room_id, streamer_id, live_viewers, final_score, trending_score)
         VALUES (?, ?, ?, ?, ?)
       `).run(s.rid, s.sid, s.viewers, s.score, s.trend);
    });
  }
};
try { seedRecommendations(); } catch (e) { console.error("seedRecommendations failed:", e); }

const seedTreasury = () => {
  const count = db.prepare("SELECT COUNT(*) as count FROM treasury").get() as any;
  if (count && count.count === 0) {
    console.log("Seeding sample treasury...");
    db.prepare("INSERT INTO treasury (currency, hot_wallet_balance, cold_wallet_balance, pending_withdrawals, low_liquidity) VALUES (?, ?, ?, ?, ?)")
      .run("USDT", 120000, 2500000, 18000, 0);
    db.prepare("INSERT INTO treasury (currency, hot_wallet_balance, cold_wallet_balance, pending_withdrawals, low_liquidity) VALUES (?, ?, ?, ?, ?)")
      .run("BTC", 85000, 1200000, 5000, 0);
    db.prepare("INSERT INTO treasury (currency, hot_wallet_balance, cold_wallet_balance, pending_withdrawals, low_liquidity) VALUES (?, ?, ?, ?, ?)")
      .run("GHS", 20000, 400000, 35000, 1);
  }
};
try { seedTreasury(); } catch (e) { console.error("seedTreasury failed:", e); }

export default db;
