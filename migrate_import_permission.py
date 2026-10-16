#one-time database update: the Excel Viewer is gone, Import Items takes its place
#   view_excel_access is removed (from every user too)
#   import_items_access is added, nobody gets it automatically: an admin gives it in Users -> Edit Permissions
#
#run it once from the project folder (laptop now, server on update day):
#   python migrate_import_permission.py
#safe to run twice

import sqlite3
from pathlib import Path

DB_FILE = Path(__file__).resolve().parent / "assets.db"

#without this check, sqlite would quietly create a new empty assets.db
if not DB_FILE.exists():
    raise SystemExit(f"No database found at {DB_FILE} - run this from the project folder.")

db = sqlite3.connect(DB_FILE)


def permission_id(name):
    row = db.execute("SELECT id FROM permissions WHERE name = ?", (name,)).fetchone()
    return row[0] if row else None


#the new permission (the app also creates it when it starts, whichever comes first)
if permission_id("import_items_access") is None:
    db.execute("INSERT INTO permissions (name) VALUES (?)", ("import_items_access",))

old_id = permission_id("view_excel_access")

if old_id is None:
    print("Already done, view_excel_access doesn't exist anymore.")

else:
    users = db.execute("SELECT COUNT(DISTINCT user_id) FROM user_permissions WHERE permission_id = ?", (old_id,)).fetchone()[0]

    db.execute("DELETE FROM user_permissions WHERE permission_id = ?", (old_id,))
    db.execute("DELETE FROM permissions WHERE id = ?", (old_id,))

    print(f"Done: view_excel_access removed ({users} user(s) had it), import_items_access added.")

db.commit()
db.close()
