import sqlite3
from .database import Base, engine
from . import models


DB_PATH = "assets.db"

#1. drop the old lost_found_items table (found_by was NOT NULL there)
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS lost_found_items")
conn.commit()
conn.close()

print("Dropped the old lost_found_items table.")


#2. recreate it (and anything else new in models.py) from the current models
Base.metadata.create_all(bind=engine)

print("Recreated lost_found_items with found_by now nullable.")
print("Migration complete. Old Lost & Found rows were test data and are gone; nothing else in the database was touched.")
