#one-time database update: users get a first name, last name and position
#   the app shows "First Last" instead of the username wherever it shows a person
#   empty names are fine: then the username is shown, like before
#
#run it once from the project folder (laptop now, server on update day):
#   python migrate_user_names.py
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

for column in ["first_name", "last_name", "position"]:
    if column not in columns:
        db.execute(f"ALTER TABLE users ADD COLUMN {column} VARCHAR")
        added.append(column)

db.commit()
db.close()

if added:
    print("Done: added " + ", ".join(added) + " to users.")
else:
    print("Already done, users has first_name, last_name and position.")