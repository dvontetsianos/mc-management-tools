from app.database import SessionLocal
from app import models
from app.main import pwd_context

db = SessionLocal()

hashed_password = pwd_context.hash("1234")


admin_user = models.User(
    username="admin",
    password_hash=hashed_password,
    role="admin"
)

db.add(admin_user)
db.commit()

print("Admin user created successfully")

db.close()