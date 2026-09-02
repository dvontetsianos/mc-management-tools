from .database import SessionLocal
from . import models


def run_migration():
    db = SessionLocal()


    try:
        all_assets = db.query(models.Asset).all()

        print(f"Found {len(all_assets)} existing asset rows.")

        items_by_name = {}

        for asset in all_assets:
            items_by_name.setdefault(asset.name, []).append(asset)


        items_created = 0
        locations_created = 0


        for name, asset_group in items_by_name.items():

            first = asset_group[0]

            new_item = models.Item(
                name=name,
                category_id=first.category_id,
                supplier_id=first.supplier_id,
                cost_per_unit=first.cost_per_unit,
                image_url=first.image_url
            )

            db.add(new_item)
            db.flush()

            items_created += 1

            for asset in asset_group:

                new_location = models.ItemLocation(
                    item_id=new_item.id,
                    location_id=asset.location_id,
                    total_quantity=asset.total_quantity,
                    broken_quantity=asset.broken_quantity
                )

                db.add(new_location)
                locations_created += 1

        db.commit()

        print(f"Created {items_created} items.")
        print(f"Created {locations_created} location assignments.")
        print("Migration complete. The old 'assets' table was left untouched.")


    except Exception as e:

        db.rollback()
        print(f"Migration failed, nothing was changed: {e}")


    finally:
        db.close()


if __name__ == "__main__":
    run_migration()