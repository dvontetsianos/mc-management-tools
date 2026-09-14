import sqlite3

DB_PATH = r"C:\Users\d.vontetsianos\Desktop\MC Management Tools\assets.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("PRAGMA table_info(items)")
columns = [row[1] for row in cur.fetchall()]

if "department_id" in columns:
    print("department_id column already exists, skipping add.")
else:
    cur.execute("ALTER TABLE items ADD COLUMN department_id INTEGER REFERENCES departments(id)")
    print("Added department_id column to items.")

cur.execute("SELECT id FROM departments WHERE name = 'F&B'")
fb_id = cur.fetchone()[0]

cur.execute("UPDATE items SET department_id = ? WHERE department_id IS NULL", (fb_id,))
print(f"Backfilled {cur.rowcount} existing items to F&B (department_id={fb_id}).")

# clean up the old, never-used "module" tag now that department_id replaces it
cur.execute("PRAGMA table_info(items)")
columns = [row[1] for row in cur.fetchall()]

if "module" in columns:
    if sqlite3.sqlite_version_info >= (3, 35, 0):
        cur.execute("ALTER TABLE items DROP COLUMN module")
        print("Dropped the old unused module column.")
    else:
        print("Skipped dropping the module column (SQLite version too old to support it) - harmless to leave it, just unused.")
else:
    print("module column already gone, skipping.")

conn.commit()
conn.close()