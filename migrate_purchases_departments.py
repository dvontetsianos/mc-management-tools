import sqlite3

DB_PATH = r"C:\Users\d.vontetsianos\Desktop\MC Management Tools\assets.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("PRAGMA table_info(purchases)")
columns = [row[1] for row in cur.fetchall()]

if "department_id" in columns:
    print("department_id column already exists, skipping add.")
else:
    cur.execute("ALTER TABLE purchases ADD COLUMN department_id INTEGER REFERENCES departments(id)")
    print("Added department_id column to purchases.")

cur.execute("""
    UPDATE purchases
    SET department_id = (
        SELECT items.department_id FROM items WHERE items.id = purchases.item_id
    )
    WHERE department_id IS NULL
""")
print(f"Backfilled {cur.rowcount} existing purchases with their item's department.")

conn.commit()
conn.close()