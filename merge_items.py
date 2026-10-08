#one-off tool: joins duplicate items into one (temporary, delete this file when the clean-up is finished)
#
#usage (from the project folder, with the app's python):
#   .venv\Scripts\python merge_items.py merges.txt            shows what would happen, changes NOTHING
#   .venv\Scripts\python merge_items.py merges.txt --apply    backs up the database first, then merges
#
#merges.txt: one pair per line, the id to KEEP first, then the id to REMOVE
#   65 519
#   543 541
#   543 597        <- the same item can be kept in several lines (groups of 3 or more)
#   # lines starting with # are ignored
#
#what one merge does (keep A, remove B):
#   stock      B's quantities are added to A at the same location (if A isn't there yet, B's row becomes A's)
#   opening    B's opening quantity is added to A's, per hotel
#   history    B's purchases, movements and History lines are moved to A, nothing is lost
#   photo      if A has no photo, it takes B's
#   counts     where two rows are joined: both counted -> added together, only one counted -> cleared (recount)
#   finally    B is deleted, and one line in History says what happened
#
#everything is done in ONE save: if anything goes wrong, nothing changes

import argparse
import sqlite3
import subprocess
import sys
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "assets.db"


#---------------------------------------------------------------------------
#reads merges.txt into a list of (keep_id, remove_id, line_number)
def read_pairs(path):

    pairs = []
    problems = []

    for line_number, line in enumerate(Path(path).read_text(encoding="utf-8-sig").splitlines(), start=1):
        text = line.strip()

        if not text or text.startswith("#"):
            continue

        parts = text.split()

        if len(parts) != 2 or not parts[0].isdigit() or not parts[1].isdigit():
            problems.append(f"line {line_number}: '{text}' should be two ids, like: 65 519")
            continue

        pairs.append((int(parts[0]), int(parts[1]), line_number))

    return pairs, problems


#---------------------------------------------------------------------------
#every safety check BEFORE anything is touched
def check_pairs(db, pairs):

    problems = []
    removed = {}

    for keep_id, remove_id, line_number in pairs:
        where = f"line {line_number} ({keep_id} {remove_id})"

        keep = db.execute("SELECT id, department_id FROM items WHERE id = ?", (keep_id,)).fetchone()
        remove = db.execute("SELECT id, department_id FROM items WHERE id = ?", (remove_id,)).fetchone()

        if keep_id == remove_id:
            problems.append(f"{where}: an item can't be merged into itself")
        if keep is None:
            problems.append(f"{where}: item {keep_id} doesn't exist")
        if remove is None:
            problems.append(f"{where}: item {remove_id} doesn't exist")
        if keep and remove and keep["department_id"] != remove["department_id"]:
            problems.append(f"{where}: the two items are in different departments")

        #a removed item can't appear anywhere else, it won't exist after its own line
        if remove_id in removed:
            problems.append(f"{where}: item {remove_id} is already removed on line {removed[remove_id]}")
        removed[remove_id] = line_number

    for keep_id, remove_id, line_number in pairs:
        if keep_id in removed:
            problems.append(f"line {line_number}: item {keep_id} is kept here but removed on line {removed[keep_id]}")

    return problems




#---------------------------------------------------------------------------
#one item in a few readable lines, used for "before" and "after"
def describe(db, item_id):

    item = db.execute("SELECT id, name, image_url FROM items WHERE id = ?", (item_id,)).fetchone()

    if item is None:
        return f"   #{item_id} (deleted)"

    opening = db.execute(
        "SELECT COALESCE(SUM(opening_quantity), 0) FROM item_hotels WHERE item_id = ?", (item_id,)
    ).fetchone()[0]

    stock = db.execute(
        """SELECT l.name, il.total_quantity, il.broken_quantity, il.staff_counted_quantity
           FROM item_locations il JOIN locations l ON l.id = il.location_id
           WHERE il.item_id = ? ORDER BY l.name""", (item_id,)
    ).fetchall()

    purchases = db.execute("SELECT COUNT(*) FROM purchases WHERE item_id = ?", (item_id,)).fetchone()[0]
    movements = db.execute("SELECT COUNT(*) FROM item_movements WHERE item_id = ?", (item_id,)).fetchone()[0]

    places = []
    for row in stock:
        text = f"{row['name']} {row['total_quantity']}"
        if row["broken_quantity"]:
            text += f" (broken {row['broken_quantity']})"
        if row["staff_counted_quantity"] is not None:
            text += f" [counted {row['staff_counted_quantity']}]"
        places.append(text)

    return (
        f"   #{item['id']} {item['name']}\n"
        f"      opening {opening} | stock: {', '.join(places) if places else 'none'}\n"
        f"      {purchases} purchase(s), {movements} movement(s), photo: {'yes' if item['image_url'] else 'no'}"
    )





#---------------------------------------------------------------------------
#the merge itself, keep A, remove B (no commit here, main() decides)
def merge(db, keep_id, remove_id):

    keep = db.execute("SELECT * FROM items WHERE id = ?", (keep_id,)).fetchone()
    remove = db.execute("SELECT * FROM items WHERE id = ?", (remove_id,)).fetchone()

    #1. stock per location
    keep_rows = {
        row["location_id"]: row
        for row in db.execute("SELECT * FROM item_locations WHERE item_id = ?", (keep_id,))
    }

    for row in db.execute("SELECT * FROM item_locations WHERE item_id = ?", (remove_id,)).fetchall():
        target = keep_rows.get(row["location_id"])

        if target is None:
            #A isn't at this location: B's row simply becomes A's
            db.execute("UPDATE item_locations SET item_id = ? WHERE id = ?", (keep_id, row["id"]))
            continue

        #both are here: add the numbers together on A's row, then remove B's row
        keep_count = target["staff_counted_quantity"]
        remove_count = row["staff_counted_quantity"]

        if keep_count is not None and remove_count is not None:
            counted = keep_count + remove_count
            counted_at = max(filter(None, [target["staff_counted_at"], row["staff_counted_at"]]), default=None)
            counted_by = target["staff_counted_by"]
        else:
            #only one of them was counted, the total can't be known: recount
            counted, counted_at, counted_by = None, None, None

        db.execute(
            """UPDATE item_locations
               SET total_quantity = ?, broken_quantity = ?,
                   staff_counted_quantity = ?, staff_counted_at = ?, staff_counted_by = ?
               WHERE id = ?""",
            (
                (target["total_quantity"] or 0) + (row["total_quantity"] or 0),
                (target["broken_quantity"] or 0) + (row["broken_quantity"] or 0),
                counted, counted_at, counted_by,
                target["id"],
            ),
        )
        db.execute("DELETE FROM item_locations WHERE id = ?", (row["id"],))

    #2. opening quantity per hotel
    keep_links = {
        link["hotel_id"]: link
        for link in db.execute("SELECT * FROM item_hotels WHERE item_id = ?", (keep_id,))
    }

    for link in db.execute("SELECT * FROM item_hotels WHERE item_id = ?", (remove_id,)).fetchall():
        target = keep_links.get(link["hotel_id"])

        if target is None:
            db.execute("UPDATE item_hotels SET item_id = ? WHERE id = ?", (keep_id, link["id"]))
        else:
            db.execute(
                "UPDATE item_hotels SET opening_quantity = ? WHERE id = ?",
                ((target["opening_quantity"] or 0) + (link["opening_quantity"] or 0), target["id"]),
            )
            db.execute("DELETE FROM item_hotels WHERE id = ?", (link["id"],))

    #the old single opening number on the item itself is kept in step too
    db.execute(
        "UPDATE items SET opening_quantity = ? WHERE id = ?",
        ((keep["opening_quantity"] or 0) + (remove["opening_quantity"] or 0), keep_id),
    )

    #3. history: purchases, movements and History lines now belong to A
    purchases = db.execute("UPDATE purchases SET item_id = ? WHERE item_id = ?", (keep_id, remove_id)).rowcount
    movements = db.execute("UPDATE item_movements SET item_id = ? WHERE item_id = ?", (keep_id, remove_id)).rowcount
    db.execute(
        """UPDATE actions_logs SET entity_id = ?
           WHERE entity_id = ? AND entity_type IN ('Item', 'Item Location')""",
        (keep_id, remove_id),
    )

    #4. photo: only if A has none (B's photo file stays on disk either way, nothing is deleted)
    if not keep["image_url"] and remove["image_url"]:
        db.execute("UPDATE items SET image_url = ? WHERE id = ?", (remove["image_url"], keep_id))

    #5. B goes, and History gets one line about it
    db.execute("DELETE FROM items WHERE id = ?", (remove_id,))

    db.execute(
        """INSERT INTO actions_logs (username, action, entity_type, entity_name, entity_id, details, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (
            "merge script",
            "merged",
            "Item",
            keep["name"],
            keep_id,
            f"Merged #{remove_id} {remove['name']} into this item "
            f"({purchases} purchase(s) and {movements} movement(s) moved over)",
            str(datetime.utcnow()),
        ),
    )



    

#---------------------------------------------------------------------------
def main():

    parser = argparse.ArgumentParser()
    parser.add_argument("pairs_file", help="text file with one 'keep remove' pair per line")
    parser.add_argument("--apply", action="store_true", help="really merge (without it nothing changes)")
    args = parser.parse_args()

    pairs, problems = read_pairs(args.pairs_file)

    db = sqlite3.connect(DB_FILE)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")

    problems += check_pairs(db, pairs)

    if problems:
        print("NOTHING WAS CHANGED, fix these first:")
        for problem in problems:
            print("  - " + problem)
        sys.exit(1)

    if not pairs:
        print("No pairs found in the file.")
        sys.exit(1)

    #the same backup update.bat makes, and stop if it fails
    if args.apply:
        print("Backing up the database...")
        backup = subprocess.run([sys.executable, str(BASE_DIR / "backup_db.py"), "--before-update"], cwd=BASE_DIR)
        if backup.returncode != 0:
            print("BACKUP FAILED - nothing was changed.")
            sys.exit(1)

    try:
        for keep_id, remove_id, line_number in pairs:
            print(f"\nLine {line_number}: keep #{keep_id}, remove #{remove_id}")
            print(" before:")
            print(describe(db, keep_id))
            print(describe(db, remove_id))

            merge(db, keep_id, remove_id)

            print(" after:")
            print(describe(db, keep_id))

        if args.apply:
            db.commit()
            print(f"\nDONE: {len(pairs)} merge(s) saved.")
        else:
            db.rollback()
            print(f"\nTEST RUN ONLY: nothing was changed. Run again with --apply to save these {len(pairs)} merge(s).")

    except Exception as error:
        db.rollback()
        print(f"\nSOMETHING WENT WRONG, nothing was changed: {error}")
        sys.exit(1)

    finally:
        db.close()


if __name__ == "__main__":
    main()