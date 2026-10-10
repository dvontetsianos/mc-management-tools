# Server update checklist: catalogue branch → server

The server database is still at the **main** stage. Nothing below deletes or changes existing data:
items, stock, purchases, movements, history and **staff counts** all stay exactly as they are.
The scripts only **add** new columns/tables or **remove one rule**.

---

## On the laptop (before going to the server)

1. Make sure everything on `catalogue` is committed and pushed (`git status` clean, `git push`).
2. Check these files are in the repo (in the project folder):
   - `migrate_add_items_specs.py`
   - `migrate_item_names_not_unique.py`
   - `migrate_department_item_fields.py`
   - `import_hk_catalogue.py` (only if importing Eirini's file)
3. Merge `catalogue` into `main` and push:
   - `git switch main`
   - `git pull`
   - `git merge catalogue`
   - `git push`
   - `git switch catalogue` (to keep working on the branch afterwards)

## On the server (one box at a time, in the project folder)

4. **Stop the app**, so nobody saves anything during the update:
   `nssm stop MCManagementTools`
5. **Extra manual backup**: copy `assets.db` and the `uploads` folder to a safe folder
   (e.g. `C:\MC backups\before catalogue <date>`).
6. Get the new code: `git pull`
7. Run the database updates, **in this order**:
   1. `python migrate_add_items_specs.py` → adds code, specification, material, size, color, supplier description (+ unique codes)
   2. `python migrate_item_names_not_unique.py` → item names may repeat (IDs and codes stay unique)
   3. `python migrate_department_item_fields.py` → the "Shown in Table" setting per department
   - `migrate_item_names_with_code.py` is **not needed** (the not-unique script replaces it).
8. Run `update.bat` (it backs up again, installs, builds the frontend and starts the service).
   - The new `user_preferences` table and the `edit_items_access` permission are created
     automatically when the app starts. No script needed.
9. Optional: import the Housekeeping catalogue
   - Needs: step 7 done, and a department named exactly `Housekeeping` on the server.
   - Copy `HK_database_List_Draft_XLS.xlsx` into `C:\MC Management Tools` (next to `import_hk_catalogue.py`).
   1. Test run, changes nothing:
      `python import_hk_catalogue.py HK_database_List_Draft_XLS.xlsx`
      → last line: `TEST RUN ONLY ... 147 item(s)`
   2. Real import (backs up the database first):
      `python import_hk_catalogue.py HK_database_List_Draft_XLS.xlsx --apply`
      → last line: `DONE: 147 item(s) imported into Housekeeping, linked to 5 hotel(s).`
   3. Delete the Excel file from the project folder afterwards (git doesn't ignore .xlsx files).
   - Running it twice never doubles anything: codes that already exist are skipped.

## After the update (in the browser, as admin)

10. **Users → Edit Permissions**: tick **edit_items_access** for everyone who should keep
    adding/editing items. Until then, everyone except admins is view-only on the item pages.
11. **Departments**: check the "Shown in Table" boxes for F&B, Housekeeping and Kitchen.
12. Quick checks:
    - F&B Items loads, staff counts are still there (Staff Count column, Missing).
    - Edit an item as admin → saves.
    - Columns button works.

## If something goes wrong

- `nssm stop MCManagementTools`
- Put back `assets.db` and `uploads` from step 5.
- `git checkout <previous main commit>` (or ask Claude), then `nssm start MCManagementTools`.
