#backup of the database (every run) and the item photos (once a week)
#
#run it from anywhere (it finds its own folder), the app can keep running:
#   .venv\Scripts\python backup_db.py                    normal (nightly) backup
#   .venv\Scripts\python backup_db.py --before-update    backup made by update.bat
#
#settings in .env (next to this file):
#   BACKUP_DIR=C:\MC Backups                  required: where the backups are kept
#   BACKUP_SHARE_DIR=\\server\folder\MC       optional: a second copy, same layout
#   BACKUP_DAY_MINUTES=5                      TESTING ONLY: makes "1 day" last 5 minutes.
#                                             leave it out for real use (1 day = 1440 minutes)
#
#what the backup folder looks like:
#   READ ME - backup status.txt     what happened last, and how to restore
#   database\daily\                 one zip per run, kept 30 days
#   database\monthly\               the first daily zip of each 30-day period, kept a year
#   database\before update\         one zip per update.bat run, the newest 10 are kept
#   photos\                         copy of the uploads folder, new photos only, nothing deleted
#
#every run also writes to logs/backup_log.txt; exit code 0 = ok, 1 = something failed

import argparse
import os
import re
import shutil
import sqlite3
import sys
import zipfile
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "assets.db"
UPLOADS_DIR = BASE_DIR / "uploads"
LOG_FILE = BASE_DIR / "logs" / "backup_log.txt"

#all in "days"; BACKUP_DAY_MINUTES decides how long a day is
KEEP_DAILY_DAYS = 30
MONTHLY_PERIOD_DAYS = 30
KEEP_MONTHLY_DAYS = 365
PHOTOS_EVERY_DAYS = 7
KEEP_NEWEST_DAILY = 10
KEEP_BEFORE_UPDATE = 10

REAL_DAY_MINUTES = 24 * 60

DAILY = Path("database") / "daily"
MONTHLY = Path("database") / "monthly"
BEFORE_UPDATE = Path("database") / "before update"
PHOTOS = Path("photos")
STATUS_FILE = "READ ME - backup status.txt"

#only files with exactly this kind of name are ever moved or deleted
BACKUP_NAME = re.compile(r"^mc_backup_(\d{4}-\d{2}-\d{2})_(\d{4})(_[a-z0-9]+)?\.zip$")

HUMAN_TIME = "%d/%m/%Y %H:%M:%S"


def log(message):
    line = f"{datetime.now():%Y-%m-%d %H:%M:%S}  {message}"
    print(line)

    try:
        os.makedirs(LOG_FILE.parent, exist_ok=True)
        with open(LOG_FILE, "a", encoding="utf-8") as file:
            file.write(line + "\n")
    except OSError:
        pass


#---------------------------------------------------------------- database

def make_db_zip(folder, suffix):

    os.makedirs(folder, exist_ok=True)

    stamp = datetime.now().strftime("%Y-%m-%d_%H%M")
    zip_path = folder / f"mc_backup_{stamp}{suffix}.zip"

    #work on temporary names, so a half-written backup never looks like a real one
    temp_db = folder / "_in_progress_assets.db"
    temp_zip = folder / "_in_progress_backup.zip"

    for leftover in (temp_db, temp_zip):
        if leftover.exists():
            leftover.unlink()

    try:
        #sqlite's own backup: a clean copy even while people are saving counts
        source = sqlite3.connect(f"{DB_FILE.as_uri()}?mode=ro", uri=True)
        target = sqlite3.connect(temp_db)
        with target:
            source.backup(target)
        source.close()

        check = target.execute("PRAGMA integrity_check").fetchone()[0]
        items = target.execute("SELECT COUNT(*) FROM items").fetchone()[0]
        target.close()

        if check != "ok":
            raise RuntimeError(f"the copied database failed its health check: {check}")

        with zipfile.ZipFile(temp_zip, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.write(temp_db, "assets.db")

        with zipfile.ZipFile(temp_zip) as archive:
            broken = archive.testzip()
            if broken:
                raise RuntimeError(f"the zip is damaged at {broken}")

        temp_zip.replace(zip_path)

    finally:
        for leftover in (temp_db, temp_zip):
            if leftover.exists():
                leftover.unlink()

    return zip_path, items


def copy_file_safely(source, destination):

    os.makedirs(destination.parent, exist_ok=True)

    #copy under a temporary name first, so a cut-off copy never has the real name
    temp_copy = destination.with_name(f"_in_progress_{destination.name}")
    shutil.copy2(source, temp_copy)

    if temp_copy.stat().st_size != source.stat().st_size:
        temp_copy.unlink()
        raise RuntimeError(f"the copy of {source.name} has the wrong size")

    temp_copy.replace(destination)


def list_backups(folder):
    #(time taken, file), newest first

    backups = []

    if not folder.exists():
        return backups

    for file in folder.iterdir():
        match = BACKUP_NAME.match(file.name)

        if match and file.is_file():
            taken = datetime.strptime(f"{match.group(1)} {match.group(2)}", "%Y-%m-%d %H%M")
            backups.append((taken, file))

    backups.sort(reverse=True)
    return backups


def period_of(taken, day_minutes):
    return int(taken.timestamp() // 60 // (MONTHLY_PERIOD_DAYS * day_minutes))


def clean_up(root, day_minutes):
    #daily: older than 30 days -> moved to monthly if its period has none yet, otherwise deleted
    #monthly: older than a year -> deleted
    #before update: only the newest 10 are kept

    now = datetime.now()
    day = timedelta(minutes=day_minutes)

    daily = list_backups(root / DAILY)
    monthly = list_backups(root / MONTHLY)

    monthly_periods = {period_of(taken, day_minutes) for taken, _ in monthly}
    protected = {file for _, file in daily[:KEEP_NEWEST_DAILY]}

    moved = 0
    deleted = 0

    #oldest first, so the earliest backup of a period is the one that becomes monthly
    for taken, file in reversed(daily):

        if file in protected or now - taken <= KEEP_DAILY_DAYS * day:
            continue

        period = period_of(taken, day_minutes)

        if period not in monthly_periods:
            os.makedirs(root / MONTHLY, exist_ok=True)
            file.replace(root / MONTHLY / file.name)
            monthly_periods.add(period)
            moved += 1
        else:
            file.unlink()
            deleted += 1

    for taken, file in list_backups(root / MONTHLY):
        if now - taken > KEEP_MONTHLY_DAYS * day:
            file.unlink()
            deleted += 1

    for _, file in list_backups(root / BEFORE_UPDATE)[KEEP_BEFORE_UPDATE:]:
        file.unlink()
        deleted += 1

    return moved, deleted


#---------------------------------------------------------------- photos

def read_last_photo_backup(root):

    status = root / STATUS_FILE

    if not status.exists():
        return None

    match = re.search(
        r"^Last photo backup:\s+(\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2})",
        status.read_text(encoding="utf-8"),
        re.MULTILINE
    )

    if not match:
        return None

    return datetime.strptime(match.group(1), HUMAN_TIME)


def photos_due(last, day_minutes):

    if last is None:
        return True

    #a date in the future means the clock was changed: don't wait for it
    if last > datetime.now():
        return True

    return datetime.now() - last >= timedelta(minutes=PHOTOS_EVERY_DAYS * day_minutes)


def backup_photos(root):

    target = root / PHOTOS
    copied = 0

    if UPLOADS_DIR.exists():
        for photo in sorted(UPLOADS_DIR.rglob("*")):

            if not photo.is_file():
                continue

            backup_file = target / photo.relative_to(UPLOADS_DIR)

            if backup_file.exists() and backup_file.stat().st_size == photo.stat().st_size:
                continue

            copy_file_safely(photo, backup_file)
            copied += 1

    #nothing is ever deleted from the photos folder
    return copied


def count_photos(root):
    folder = root / PHOTOS
    return sum(1 for file in folder.rglob("*") if file.is_file()) if folder.exists() else 0


#---------------------------------------------------------------- old layout

def move_old_layout(root):
    #backups made by the first version of this script sat loose in the backup folder

    os.makedirs(root / DAILY, exist_ok=True)

    for _, file in list_backups(root):
        file.replace(root / DAILY / file.name)

    old_marker = root / "_last_photo_backup.txt"
    last = None

    if old_marker.exists():
        try:
            last = datetime.fromisoformat(old_marker.read_text(encoding="utf-8").strip())
        except ValueError:
            last = None
        old_marker.unlink()

    return last


#---------------------------------------------------------------- status file

def describe(folder):
    backups = list_backups(folder)

    if not backups:
        return "0"

    return f"{len(backups)}   (newest {backups[0][0]:%d/%m/%Y %H:%M}, oldest {backups[-1][0]:%d/%m/%Y %H:%M})"


def write_status(root, run, day_minutes):

    lines = []

    if day_minutes != REAL_DAY_MINUTES:
        lines += [
            f"*** TEST MODE: 1 day = {day_minutes} minutes (BACKUP_DAY_MINUTES in .env) ***",
            ""
        ]

    lines += [
        "MC Management Tools - backups",
        "=============================",
        "",
        f"Last run:              {run['time']:{HUMAN_TIME}}  {run['result']}",
        f"Last database backup:  {run['db_text']}",
        f"Last photo backup:     {run['photo_text']}",
        f"Photos in backup:      {count_photos(root)}",
        "",
        f"Daily backups:         {describe(root / DAILY)}",
        f"Monthly backups:       {describe(root / MONTHLY)}",
        f"Before-update backups: {describe(root / BEFORE_UPDATE)}",
        f"Second copy:           {run['share_text']}",
        "",
        "What is in this folder",
        "----------------------",
        "database\\daily          one backup per night, kept for 30 days",
        "database\\monthly        the first backup of each month, kept for a year",
        "database\\before update  one backup each time the app was updated, the last 10",
        "photos                  every item photo ever uploaded (nothing is deleted here)",
        "",
        "How to restore",
        "--------------",
        "1. Stop the app (server: stop the MCManagementTools service, laptop: Ctrl+C in the uvicorn terminal).",
        f"2. In {BASE_DIR}, rename assets.db to assets_backup_before_restore.db",
        "3. Open the zip of the day you want to go back to and copy assets.db from it",
        f"   into {BASE_DIR}",
        f"4. Copy everything inside the photos folder here into {UPLOADS_DIR}",
        "   (choose 'Skip' for files that already exist).",
        "5. Start the app again, log in and check the items.",
        "6. When everything looks right, delete assets_backup_before_restore.db.",
        ""
    ]

    temp = root / f"_in_progress_{STATUS_FILE}"
    temp.write_text("\n".join(lines), encoding="utf-8")
    temp.replace(root / STATUS_FILE)


#---------------------------------------------------------------- one full round

def backup_to(root, day_minutes, before_update, share_text, made_zip=None):
    #database zip (or a copy of the one just made), photos if due, clean-up, status file

    os.makedirs(root, exist_ok=True)

    last_photos = move_old_layout(root) or read_last_photo_backup(root)

    sub = BEFORE_UPDATE if before_update else DAILY
    suffix = "_update" if before_update else ""

    now = datetime.now()

    if made_zip is None:
        zip_path, items = make_db_zip(root / sub, suffix)
        size = zip_path.stat().st_size / (1024 * 1024)
        db_text = f"{now:{HUMAN_TIME}}  OK  ({items} items, {size:.1f} MB)"
    else:
        zip_path = root / sub / made_zip.name
        copy_file_safely(made_zip, zip_path)
        db_text = f"{now:{HUMAN_TIME}}  OK  (copy of {made_zip.name})"

    if photos_due(last_photos, day_minutes):
        new_photos = backup_photos(root)
        photo_text = f"{datetime.now():{HUMAN_TIME}}  OK  ({new_photos} new)"
        photos_summary = f"photos backed up ({new_photos} new)"
    else:
        photo_text = f"{last_photos:{HUMAN_TIME}}  OK  (next one due {last_photos + timedelta(minutes=PHOTOS_EVERY_DAYS * day_minutes):%d/%m/%Y %H:%M})"
        photos_summary = "photos not due yet"

    moved, deleted = clean_up(root, day_minutes)

    write_status(root, {
        "time": now,
        "result": "OK",
        "db_text": db_text,
        "photo_text": photo_text,
        "share_text": share_text
    }, day_minutes)

    summary = f"{sub}\\{zip_path.name}, {photos_summary}, {moved} moved to monthly, {deleted} old backup(s) removed"
    return zip_path, summary


def write_failed_status(root, error, day_minutes, share_text):
    #keep the previous numbers, only say that the last run failed

    try:
        last_photos = read_last_photo_backup(root)
        old = (root / STATUS_FILE).read_text(encoding="utf-8") if (root / STATUS_FILE).exists() else ""
        db_match = re.search(r"^Last database backup:\s+(.*)$", old, re.MULTILINE)

        write_status(root, {
            "time": datetime.now(),
            "result": f"FAILED: {error}",
            "db_text": db_match.group(1) if db_match else "none yet",
            "photo_text": f"{last_photos:{HUMAN_TIME}}  OK" if last_photos else "none yet",
            "share_text": share_text
        }, day_minutes)
    except Exception:
        pass


def main():

    parser = argparse.ArgumentParser()
    parser.add_argument("--before-update", action="store_true", help="backup made by update.bat")
    args = parser.parse_args()

    load_dotenv(BASE_DIR / ".env")

    backup_setting = os.getenv("BACKUP_DIR", "").strip()
    share_setting = os.getenv("BACKUP_SHARE_DIR", "").strip()
    day_setting = os.getenv("BACKUP_DAY_MINUTES", "").strip()

    if day_setting:
        try:
            day_minutes = int(day_setting)
            if day_minutes < 1:
                raise ValueError
        except ValueError:
            log(f"FAILED: BACKUP_DAY_MINUTES must be a whole number above 0, not '{day_setting}'")
            return 1
    else:
        day_minutes = REAL_DAY_MINUTES

    test_text = f"[TEST: 1 day = {day_minutes} min] " if day_minutes != REAL_DAY_MINUTES else ""

    if not backup_setting:
        log(f"{test_text}FAILED: BACKUP_DIR is not set in .env")
        return 1

    root = Path(backup_setting)
    share_dir = Path(share_setting) if share_setting else None
    share_text = f"{share_dir}" if share_dir else "not set up"

    if not DB_FILE.exists():
        log(f"{test_text}FAILED: database not found at {DB_FILE}")
        write_failed_status(root, f"database not found at {DB_FILE}", day_minutes, share_text)
        return 1

    try:
        zip_path, summary = backup_to(root, day_minutes, args.before_update, share_text)
    except Exception as error:
        log(f"{test_text}FAILED: {error}")
        write_failed_status(root, error, day_minutes, share_text)
        return 1

    log(f"{test_text}OK: {summary}")

    if share_dir is None:
        return 0

    try:
        _, share_summary = backup_to(share_dir, day_minutes, args.before_update, "this is the second copy", made_zip=zip_path)
    except Exception as error:
        log(f"{test_text}FAILED network copy to {share_dir}: {error} (the local backup is fine)")
        write_failed_status(root, f"second copy to {share_dir} failed: {error}", day_minutes, f"{share_dir}  FAILED")
        return 1

    log(f"{test_text}OK second copy: {share_summary}")

    #note in this folder's status file that the second copy worked too
    try:
        status = root / STATUS_FILE
        text = status.read_text(encoding="utf-8")
        text = re.sub(
            r"^Second copy:.*$",
            lambda _: f"Second copy:           {share_dir}  OK  ({datetime.now():{HUMAN_TIME}})",
            text,
            flags=re.MULTILINE
        )
        status.write_text(text, encoding="utf-8")
    except OSError:
        pass

    return 0


if __name__ == "__main__":
    sys.exit(main())
