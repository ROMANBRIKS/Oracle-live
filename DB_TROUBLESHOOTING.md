# Database Troubleshooting & Repair Guide

This document outlines the proven steps to diagnose and fix "App Not Starting" issues caused by SQLite database schemas or seeding mismatches in this project.

## Symptoms
- Preview says "Please wait while your application starts..." indefinitely.
- Server logs show `SqliteError: table X has no column named Y`.
- Server logs show `SqliteError: datatype mismatch`.

## Troubleshooting Procedure

### 1. Run Diagnostics
Execute the diagnostic script to see raw SQLite errors from the initialization sequence:
```bash
npx tsx check_db.ts
```

### 2. Verify Schema
Inspect the table structure of the failing table:
```bash
npx tsx -e "import db from './server/config/db'; console.log(db.prepare('PRAGMA table_info(TRAPPING_TABLE)').all())"
```

### 3. Apply Migrations (Fixing "Missing Column")
If a column is missing, add it to the `migrations` array in `/server/config/db.ts`. 
**Crucial:** Migrations must run **BEFORE** any seeding functions are called.

```typescript
const migrations = [
  "ALTER TABLE table_name ADD COLUMN column_name TYPE;",
];

migrations.forEach(m => {
  try { db.exec(m); } catch (e) { /* Skip if exists */ }
});
```

### 4. Fix Data Mismatches
If you see `datatype mismatch`:
- **Primary Keys:** Ensure ID types match (e.g., if ID is `INTEGER`, do not pass a `string`).
- **Input Order:** Verify parameters in `.run(...)` or `.get(...)` match the placeholder order in the SQL string.

### 5. Add Safety Guards to Seeding
To prevent the entire app from crashing during initialization if sample data fails, wrap seed calls in try-catch blocks in `/server/config/db.ts`:

```typescript
try { seedUsers(); } catch (e) { console.error("seedUsers failed:", e); }
try { seedAgencies(); } catch (e) { console.error("seedAgencies failed:", e); }
```

## Why this happens
As the project evolves, new features (like Agencies or Crypto Wallets) require `ALTER TABLE` commands. If the local development database file (`oracle.db`) already exists, SQLite doesn't automatically update its structure unless we explicitly run migrations. This can lead to code expecting columns that aren't there yet.

## Execution & Verification Logs

This section logs each time the troubleshooting system and schema integrity checks are run and confirmed operational.

### [2026-05-14 12:20:00] - Verification: SUCCESS
- **Action**: Ran database schema diagnostics and healing checks via `npx tsx check_db.ts`.
- **Status**: Successful (Exit Code 0).
- **Result**:
  - `users` table structure is validated, matching all current schema columns.
  - `leaderboards` table verified healthy.
  - `stream_analytics` table verified healthy.
  - `ai_moderation_logs` table verified healthy.
- **Dependency & Build Integrity**: Fixed external dependency import issue in `server/ai/chatModerationAI.ts` for module `bad-words`.
- **Service Status**: App checked, compiled, and dev server restarted successfully. Live preview fully functional.

