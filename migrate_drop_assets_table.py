import sqlite3

DB_PATH = "assets.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='assets'")
exists = cur.fetchone() is not None

if exists:
    cur.execute("SELECT COUNT(*) FROM assets")
    row_count = cur.fetchone()[0]
    print(f"Found 'assets' table with {row_count} rows. Dropping it...")
    cur.execute("DROP TABLE assets")
    conn.commit()
    print("Done. 'assets' table has been dropped.")
else:
    print("'assets' table not found (already dropped, nothing to do).")

conn.close()
