#one-time database update: broken reports no longer lower Assigned straight away
#   stock_adjustments gets a "settled_at" column: when a closed count took the adjustment into Assigned
#   everything that exists already is marked settled, because the old way already lowered Assigned
#
#run it once from the project folder (laptop now, server on update day):
#   python migrate_broken_settled.py
#safe to run twice

import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).resolve().parent / "assets.db"

#without this check, sqlite would quietly create a new empty assets.db
if not DB_FILE.exists():
    raise SystemExit(f"No database found at {DB_FILE} - run this from the project folder.")

db = sqlite3.connect(DB_FILE)

columns = [row[1] for row in db.execute("PRAGMA table_info(stock_adjustments)")]

if "settled_at" in columns:
    print("Already done, stock_adjustments has settled_at.")

else:
    db.execute("ALTER TABLE stock_adjustments ADD COLUMN settled_at DATETIME")
    marked = db.execute("UPDATE stock_adjustments SET settled_at = created_at").rowcount
    db.commit()

    print(f"Done: settled_at added, {marked} existing adjustment(s) marked as settled.")

db.close()