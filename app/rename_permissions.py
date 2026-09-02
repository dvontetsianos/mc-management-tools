from .database import SessionLocal
from . import models


RENAMES = {
    "fb_access": "assets_access",
    "storage_access": "categories_access",
    "engineering_access": "locations_access",
    "reports_access": "suppliers_access",
}


db = SessionLocal()

for old_name, new_name in RENAMES.items():
    permission = db.query(models.Permission).filter(
        models.Permission.name == old_name
    ).first()

    if permission:
        permission.name = new_name
        print(f"Renamed {old_name} -> {new_name}")

    else:
        print(f"Permission '{old_name}' not found, skipping")


db.commit()
db.close()

print("Done.")