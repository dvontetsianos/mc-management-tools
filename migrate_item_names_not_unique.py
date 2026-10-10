#one-time database update: item names no longer have to be unique
#   removes the rule unique_item_name_per_department (names can repeat, codes still can't)
#
#run it once from the project folder (laptop now, server after the count):
#   python migrate_item_names_not_unique.py
#safe to run twice

import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).resolve().parent / "assets.db"

#without this check, sqlite would quietly create a new empty assets.db
if not DB_FILE.exists():
    raise SystemExit(f"No database found at {DB_FILE} - run this from the project folder.")

db = sqlite3.connect(DB_FILE)

row = db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'unique_item_name_per_department'"
).fetchone()

if row is None:
    print("Already done, item names are not unique.")
else:
    db.execute("DROP INDEX unique_item_name_per_department")
    db.commit()
    print("Done: item names no longer have to be unique.")

db.close()