import sqlite3
from .database import Base, engine, SessionLocal
from . import models


#1. add the opening_quantity column to items, if it isnt there yet
conn = sqlite3.connect("assets.db")
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(items)")
existing_columns = [row[1] for row in cursor.fetchall()]


if "opening_quantity" not in existing_columns:
    cursor.execute("ALTER TABLE items ADD COLUMN opening_quantity INTEGER DEFAULT 0")
    conn.commit()
    print("Added opening_quantity column to items table.")
else:
    print("opening_quantity column already exists, skipping.")


conn.close()


#2. create the new purchase table and anything else new in models.py
Base.metadata.create_all(bind=engine)
print("Ensured purchases table exists.")


#3. populate opening_quantity for each item from its current item_locations totals
db = SessionLocal()
try:
    items = db.query(models.Item).all()
    updated = 0
    for item in items:
        total = sum(loc.total_quantity for loc in item.locations)
        item.opening_quantity = total
        updated += 1
    db.commit()
    print(f"Set opening_quantity for {updated} items based on current totals.")
finally:
    db.close()


print("Migration complete.")