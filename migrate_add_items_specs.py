#one-time database update: adds the group catalogue fields to every item
#   code, specification, material, size, color, supplier_description
#
#run it once from the project folder (laptop now, server after the count):
#   python migrate_add_item_specs.py
#safe to run twice: columns that already exist are skipped

import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).resolve().parent / "assets.db"

NEW_COLUMNS = ["code", "specification", "material", "size", "color", "supplier_description"]

#without this check, sqlite would quietly create a new empty assets.db
if not DB_FILE.exists():
    raise SystemExit(f"No database found at {DB_FILE} - run this from the project folder.")

db = sqlite3.connect(DB_FILE)

existing = {row[1] for row in db.execute("PRAGMA table_info(items)")}

for column in NEW_COLUMNS:
    if column in existing:
        print(f"items.{column} already exists, skipped")
    else:
        db.execute(f"ALTER TABLE items ADD COLUMN {column} VARCHAR")
        print(f"items.{column} added")

#a code can belong to one item only (items without a code are fine, as many as needed)
db.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_items_code ON items (code)")

db.commit()
db.close()

print("Done.")