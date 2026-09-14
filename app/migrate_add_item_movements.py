import sqlite3
from .database import Base, engine
from . import models


#1. add the module column to items, if it isnt there yet
conn = sqlite3.connect("assets.db")
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(items)")
existing_columns = [row[1] for row in cursor.fetchall()]


if "module" not in existing_columns:
    cursor.execute("ALTER TABLE items ADD COLUMN module TEXT DEFAULT 'fb'")
    conn.commit()
    print("Added module column to items table.")
else:
    print("module column already exists, skipping.")


conn.close()


#2. create the new item_movements table and anything else new in models.py
Base.metadata.create_all(bind=engine)
print("Ensured item_movements table exists.")


print("Migration complete.")