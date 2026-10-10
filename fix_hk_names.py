#one-off tool: fixes spelling mistakes in the names of the imported Housekeeping catalogue
#
#usage (from the project folder, after import_hk_catalogue.py):
#   python fix_hk_names.py            shows what would change, changes NOTHING
#   python fix_hk_names.py --apply    backs up the database first, then renames
#
#an item is only renamed if it still has the old (wrong) name, so a name someone already
#changed by hand in the app is never overwritten. Every rename goes into History.
#everything is done in ONE save: if anything goes wrong, nothing changes

import argparse
import sqlite3
import subprocess
import sys
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "assets.db"

#code: (wrong name from the Excel, correct name)
FIXES = {
    "HK-LIN-1": ("Σενδόνι Single Μονό πανωσέντονο και κατωσέντονο", "Σεντόνι Single Μονό πανωσέντονο και κατωσέντονο"),
    "HK-LIN-2": ("Σενδόνι King Size Διπλό πανωσέντονο και κατωσέντονο", "Σεντόνι King Size Διπλό πανωσέντονο και κατωσέντονο"),
    "HK-LIN-3": ("Σενδόνι Single Sateen Stripe Μονό πανωσέντονο και κατωσέντονο", "Σεντόνι Single Sateen Stripe Μονό πανωσέντονο και κατωσέντονο"),
    "HK-LIN-4": ("Σενδόνι King Size Sateen Stripe Διπλό πανωσέντονο και κατωσέντονο", "Σεντόνι King Size Sateen Stripe Διπλό πανωσέντονο και κατωσέντονο"),
    "HK-LIN-5": ("Σενδόνι παιδικού κρεββατιου πανωσέντονο και κατωσέντονο", "Σεντόνι παιδικού κρεβατιού πανωσέντονο και κατωσέντονο"),
    #the "M" of Mεγάλη was an English M, so searching "Μεγάλη" didn't find these two
    "HK-LIN-6": ("Μαξιλαροθήκη Mεγάλη House Wife κλείσιμο φάκελος 25εκ", "Μαξιλαροθήκη Μεγάλη House Wife κλείσιμο φάκελος 25εκ"),
    "HK-LIN-7": ("Μαξιλαροθήκη Mεγάλη House Wife κλείσιμο φάκελος 25εκ", "Μαξιλαροθήκη Μεγάλη House Wife κλείσιμο φάκελος 25εκ"),
    "HK-LIN-52": ("Ανώστρμα Υπερδιπλο", "Ανώστρωμα Υπέρδιπλο"),
    "HK-INR-13": ("Θήκη χαρτιου", "Θήκη χαρτιού"),
    "HK-INR-17": ("Σιδερο σιδερώστρτα", "Σίδερο σιδερώστρα"),
    "HK-INR-21": ("Στεγνωτήρας Μαλλιώνν", "Στεγνωτήρας Μαλλιών"),
    "HK-INR-35": ("Ποδόμακτρο μοκκέτα", "Ποδόμακτρο μοκέτα"),
}


def main():

    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="really rename (without it nothing changes)")
    args = parser.parse_args()

    if not DB_FILE.exists():
        raise SystemExit(f"No database found at {DB_FILE} - run this from the project folder.")

    db = sqlite3.connect(DB_FILE)
    db.row_factory = sqlite3.Row

    to_fix = []

    for code, (wrong, right) in FIXES.items():
        row = db.execute("SELECT id, name FROM items WHERE code = ?", (code,)).fetchone()

        if row is None:
            print(f"  {code:<11} not in the database, skipped")
        elif row["name"] == wrong:
            to_fix.append((row["id"], code, wrong, right))
            print(f"  {code:<11} {wrong}  ->  {right}")
        elif row["name"] == right:
            print(f"  {code:<11} already correct")
        else:
            print(f"  {code:<11} was renamed by hand to '{row['name']}', left as it is")

    if not to_fix:
        print("\nNothing to fix.")
        db.close()
        return

    if not args.apply:
        db.close()
        print(f"\nTEST RUN ONLY: nothing was changed. Run again with --apply to fix these {len(to_fix)} name(s).")
        return

    #the same backup update.bat makes, and stop if it fails
    print("Backing up the database...")
    backup = subprocess.run([sys.executable, str(BASE_DIR / "backup_db.py"), "--before-update"], cwd=BASE_DIR)
    if backup.returncode != 0:
        db.close()
        print("BACKUP FAILED - nothing was changed.")
        sys.exit(1)

    now = str(datetime.utcnow())

    try:
        for item_id, code, wrong, right in to_fix:
            db.execute("UPDATE items SET name = ? WHERE id = ?", (right, item_id))
            db.execute(
                """INSERT INTO actions_logs (username, action, entity_type, entity_name, entity_id, details, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                ("fix script", "updated", "Item", right, item_id, f"Name: {wrong} -> {right}", now),
            )

        db.commit()
        print(f"\nDONE: {len(to_fix)} name(s) fixed.")

    except Exception as error:
        db.rollback()
        print(f"\nSOMETHING WENT WRONG, nothing was changed: {error}")
        sys.exit(1)

    finally:
        db.close()


if __name__ == "__main__":
    main()