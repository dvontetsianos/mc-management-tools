#one-time database update: "reports_access" becomes one permission per report
#   everyone who had reports_access gets spend_report_access (the only report until now)
#   losses_report_access is given by an admin in Users -> Edit Permissions
#   then reports_access is removed
#
#run it once from the project folder (laptop now, server on update day):
#   python migrate_report_permissions.py
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


old_id = permission_id("reports_access")

if old_id is None:
    print("Already done, reports_access doesn't exist anymore.")

else:
    #the new permissions (the app also creates them when it starts, whichever comes first)
    for name in ["spend_report_access", "losses_report_access"]:
        if permission_id(name) is None:
            db.execute("INSERT INTO permissions (name) VALUES (?)", (name,))

    spend_id = permission_id("spend_report_access")

    users = [
        row[0]
        for row in db.execute("SELECT DISTINCT user_id FROM user_permissions WHERE permission_id = ?", (old_id,))
    ]

    for user_id in users:
        already = db.execute(
            "SELECT 1 FROM user_permissions WHERE user_id = ? AND permission_id = ?", (user_id, spend_id)
        ).fetchone()

        if not already:
            db.execute("INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)", (user_id, spend_id))

    db.execute("DELETE FROM user_permissions WHERE permission_id = ?", (old_id,))
    db.execute("DELETE FROM permissions WHERE id = ?", (old_id,))
    db.commit()

    print(f"Done: {len(users)} user(s) moved from reports_access to spend_report_access.")

db.close()
