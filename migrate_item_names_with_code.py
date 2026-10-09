#one-time database update: items with a code may share a name
#   before: a name could be used only once per department
#   after:  the same for items without a code, but items with a code may repeat a name
#           (the code is what tells them apart, e.g. HK-BAT-6 and HK-BAT-7 are both "Λουτροπετσέτα")
#
#run it once from the project folder (laptop now, server after the count):
#   python migrate_item_names_with_code.py
#safe to run twice

import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).resolve().parent / "assets.db"
INDEX_NAME = "unique_item_name_per_department"

#without this check, sqlite would quietly create a new empty assets.db
if not DB_FILE.exists():
    raise SystemExit(f"No database found at {DB_FILE} - run this from the project folder.")

db = sqlite3.connect(DB_FILE)

row = db.execute(
    "SELECT sql FROM sqlite_master WHERE type = 'index' AND name = ?", (INDEX_NAME,)
).fetchone()

if row is None:
    db.close()
    raise SystemExit(f"The rule {INDEX_NAME} wasn't found, so nothing was changed. Send this message to Claude.")

if "WHERE" in row[0].upper():
    print("Already updated, nothing to do.")
else:
    #both steps in one save: if anything goes wrong, the old rule stays
    db.execute("BEGIN")
    db.execute(f"DROP INDEX {INDEX_NAME}")
    db.execute(f"CREATE UNIQUE INDEX {INDEX_NAME} ON items (department_id, name) WHERE code IS NULL")
    db.commit()
    print("Done: items with a code can now share a name.")

db.close()