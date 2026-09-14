import sqlite3

DB_PATH = r"C:\Users\d.vontetsianos\Desktop\MC Management Tools\assets.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("PRAGMA table_info(categories)")
columns = [row[1] for row in cur.fetchall()]

if "department_id" in columns:
    print("department_id column already exists, skipping add/rename.")
elif "departments_id" in columns:
    cur.execute("ALTER TABLE categories RENAME COLUMN departments_id TO department_id")
    print("Renamed departments_id to department_id.")
else:
    cur.execute("ALTER TABLE categories ADD COLUMN department_id INTEGER REFERENCES departments(id)")
    print("Added department_id column to categories.")

cur.execute("SELECT id FROM departments WHERE name = 'F&B'")
fb_id = cur.fetchone()[0]

cur.execute("UPDATE categories SET department_id = ? WHERE department_id IS NULL", (fb_id,))
print(f"Backfilled {cur.rowcount} existing categories to F&B (department_id={fb_id}).")

conn.commit()
conn.close()