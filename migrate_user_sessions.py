#one-time database update: "who's online" and "sign out" in System Monitor
#   users get: last_login_at, last_seen_at, last_seen_ip (who's online)
#              tokens_valid_after (logins from before this moment stop working)
#   empty for everyone at first: nobody is signed out by this script
#
#run it once from the project folder (laptop now, server on update day):
#   python migrate_user_sessions.py
#safe to run twice

import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).resolve().parent / "assets.db"

#without this check, sqlite would quietly create a new empty assets.db
if not DB_FILE.exists():
    raise SystemExit(f"No database found at {DB_FILE} - run this from the project folder.")

db = sqlite3.connect(DB_FILE)

columns = [row[1] for row in db.execute("PRAGMA table_info(users)")]
added = []

for column, kind in [("last_login_at", "DATETIME"), ("last_seen_at", "DATETIME"), ("last_seen_ip", "VARCHAR"), ("tokens_valid_after", "DATETIME")]:
    if column not in columns:
        db.execute(f"ALTER TABLE users ADD COLUMN {column} {kind}")
        added.append(column)

db.commit()
db.close()

if added:
    print("Done: added " + ", ".join(added) + " to users.")
else:
    print("Already done, users has the who's online and sign out columns.")