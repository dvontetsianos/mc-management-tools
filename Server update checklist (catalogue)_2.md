# Server update checklist: catalogue branch → server

**Read this first.** Claude may not remember these conversations next time.
This file is the memory: on update day, open it and tell Claude "let's do the server update, here is the checklist"
and paste it in. Tick each box as you go.

The server database is still at the **main** stage. Nothing below deletes or changes existing data:
items, stock, purchases, movements, history and **staff counts** all stay exactly as they are.
The scripts only **add** new columns/tables or **remove one rule**.
After the update, **Close count** turns the October counts into the new stock (part E).

---

## A. Practice run on the laptop (a few days before, on a COPY of the server database)

- [ ] 1. On the server, copy `C:\MC Management Tools\assets.db` (and `uploads` if you want photos) to a USB / shared folder.
- [ ] 2. On the laptop, keep the laptop's own `assets.db` aside in a **separate** folder (not the project folder).
- [ ] 3. With the backend stopped, put the server copy in the laptop project folder as `assets.db`.
- [ ] 4. Run the 3 scripts from step 9d, in order. Each should finish without errors.
- [ ] 5. Start the backend and frontend. Check:
  - [ ] F&B Items loads, staff counts are there (Staff Count, Missing).
  - [ ] Dashboard loads.
  - [ ] **Close count** → preview for one location looks right (each row = counted − system).
        Closing is fine too, it's only a copy.
- [ ] 6. Stop the backend and put the laptop's own `assets.db` back.

## B. On the laptop (update day, before going to the server)

- [ ] 7. Everything on `catalogue` committed and pushed (`git status` clean).
- [ ] 8. Merge `catalogue` into `main` and push, one box at a time:
  - `git switch main`
  - `git pull`
  - `git merge catalogue`
  - `git push`
  - `git switch catalogue` (to keep working on the branch afterwards)

## C. On the server (one box at a time, in `C:\MC Management Tools`)

- [ ] 9a. **Stop the app**, so nobody saves anything during the update:
  `nssm stop MCManagementTools`
- [ ] 9b. **Extra manual backup**: copy `assets.db` and the `uploads` folder to a safe folder
  (e.g. `C:\MC backups\before catalogue <date>`).
- [ ] 9c. Get the new code: `git pull`
- [ ] 9d. Run the database updates, **in this order**:
  1. `python migrate_add_items_specs.py` → adds code, specification, material, size, color, supplier description (+ unique codes)
  2. `python migrate_item_names_not_unique.py` → item names may repeat (IDs and codes stay unique)
  3. `python migrate_department_item_fields.py` → the "Shown in Table" setting per department
  - `migrate_item_names_with_code.py` is **not needed**.
- [ ] 9e. Run `update.bat` (it backs up again, installs, builds the frontend and starts the service).
  - Created automatically when the app starts, no script needed:
    `user_preferences`, `app_settings` (dashboard switches), `stock_adjustments` (close count records),
    and the `edit_items_access` permission.

## D. After the update (in the browser, as admin)

- [ ] 10. **Users → Edit Permissions**: tick **edit_items_access** for everyone who should keep
  adding/editing items. Until then, everyone except admins is view-only on the item pages.
- [ ] 11. **Departments**: check the "Shown in Table" boxes for F&B, Housekeeping and Kitchen.
- [ ] 12. Quick checks:
  - [ ] F&B Items loads, staff counts are still there (Staff Count column, Missing).
  - [ ] Dashboard tiles show numbers.
  - [ ] Quick Count opens on a phone.
  - [ ] Edit an item as admin → saves.

## E. Close the October count (only when counting is really finished)

- [ ] 13. Items page → **Close count**. Pick a hotel + department (or one location).
- [ ] 14. Read the preview: every row = counted − system. "Not counted" rows are left alone.
- [ ] 15. **Yes, close count**. A safety backup runs first; if it fails, nothing changes.
- [ ] 16. Repeat per hotel / department. History gets one "closed count" line each time.

## F. Optional: Housekeeping catalogue import

- Needs: part C done, and a department named exactly `Housekeeping` on the server.
- Copy `HK_database_List_Draft_XLS.xlsx` into `C:\MC Management Tools` (next to `import_hk_catalogue.py`).
  1. Test run, changes nothing:
     `python import_hk_catalogue.py HK_database_List_Draft_XLS.xlsx`
     → last line: `TEST RUN ONLY ... 147 item(s)`
  2. Real import (backs up the database first):
     `python import_hk_catalogue.py HK_database_List_Draft_XLS.xlsx --apply`
     → last line: `DONE: 147 item(s) imported into Housekeeping, linked to 5 hotel(s).`
  3. Fix the spelling mistakes from her file (test run, then real):
     `python fix_hk_names.py` → then `python fix_hk_names.py --apply`
     → last line: `DONE: 12 name(s) fixed.`
  4. Delete the Excel file from the project folder afterwards (git doesn't ignore .xlsx files).
- Running it twice never doubles anything: codes that already exist are skipped.

## G. Later (not on update day)

- Read-only check that every `broken_quantity` on the server is 0, before it is removed from the code (close count step 6).
- Opening quantity becomes a one-time setup tool (hide or lock it after the setup year, decision pending).

## If something goes wrong

- `nssm stop MCManagementTools`
- Put back `assets.db` and `uploads` from step 9b.
- `git checkout <previous main commit>` (or ask Claude), then `nssm start MCManagementTools`.
