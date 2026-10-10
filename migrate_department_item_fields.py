#one-time database update: each department can choose which catalogue fields its items use
#   adds departments.item_fields (empty = never set = all fields)
#
#run it once from the project folder (laptop now, server after the count):
#   python migrate_department_item_fields.py
#safe to run twice


import sqlite3
from pathlib import Path


DB_FILE = Path(__file__).resolve().parent / "assets.db"

#without this check, sqlite would quietly create a new assets.db
if not DB_FILE.exists():
    raise SystemExit(f"No database found at {DB_FILE} - run this from the project folder.")


db = sqlite3.connect(DB_FILE)

existing = {row[1] for row in db.execute("PRAGMA table_info(departments)")}


if "item_fields" in existing:
    print("departments.item_fields already exists, nothing to do.")
else:
    db.execute("ALTER TABLE departments ADD COLUMN item_fields VARCHAR")
    db.commit()
    print("Done: departments.item_fields added (every department starts with all fields).")

db.close()