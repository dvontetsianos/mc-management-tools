from .database import engine
from sqlalchemy import text


with engine.connect() as connection:
    connection.execute(text("ALTER TABLE actions_logs ADD COLUMN details TEXT"))
    connection.commit()


print("Done - actions_logs table now has a details column.")