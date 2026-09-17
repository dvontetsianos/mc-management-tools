import sqlite3

DB_PATH = r"C:\Users\d.vontetsianos\Desktop\MC Management Tools\assets.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("""
    DELETE FROM item_locations
    WHERE total_quantity <= 0 AND broken_quantity <= 0
""")
print(f"Removed {cur.rowcount} leftover zero-quantity item_location rows.")

conn.commit()
conn.close()