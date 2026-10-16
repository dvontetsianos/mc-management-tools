#Import Items: the empty Excel template, checking a filled one, and adding its items
#
#the file has one sheet per department (F&B, Housekeeping, Kitchen), every row is one new item
#   Category, Subcategory and Supplier must already exist (Setup), rows with a new name are rejected
#   items that already exist (same Code, or same Name in that department when there's no code) are skipped
#   under each hotel: the opening quantity (0 or more), empty = the item isn't in that hotel
#
#main.py only has the 3 endpoints, everything else is here

from datetime import datetime
from io import BytesIO
from zipfile import BadZipFile

from fastapi import HTTPException
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.utils.exceptions import InvalidFileException
from openpyxl.worksheet.datavalidation import DataValidation

from . import models


#sheet name = department name
IMPORT_DEPARTMENTS = ["F&B", "Housekeeping", "Kitchen"]

MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_ROWS = 5000
TEMPLATE_ROWS = 2000

#(field, column title), in the order of the template. A * marks the two that can't be empty
MAIN_COLUMNS = [("name", "Name *"), ("code", "Code"), ("category", "Category *"), ("subcategory", "Subcategory"),
                ("supplier", "Supplier"), ("cost_per_unit", "Cost per Unit")]
SPEC_COLUMNS = [("specification", "Specification"), ("material", "Material"), ("size", "Size"),
                ("color", "Color"), ("supplier_description", "Supplier Description")]

HEADER_FILL = PatternFill("solid", fgColor="1F3A5F")
HOTEL_FILL = PatternFill("solid", fgColor="2E6B4F")
HEADER_FONT = Font(bold=True, color="FFFFFF")


#---------------------------------------------------------------------------
#one clean line of text: no double spaces, no line breaks, empty -> None
def clean(value):

    if value is None:
        return None

    text = " ".join(str(value).replace("\xa0", " ").split())

    return text or None


#Excel turns some sizes into dates (4-6 becomes 4 June), those are turned back
def clean_size(value):

    if isinstance(value, datetime):
        return f"{value.day}-{value.month}"

    return clean(value)


#a column title, ready to compare: "Name *" -> "name"
def header_key(value):

    return (clean(value) or "").rstrip("*").strip().lower()


#the columns a department's sheet has: the main ones, its catalogue fields, then one per hotel
def sheet_columns(fields):

    columns = [(field, title) for field, title in MAIN_COLUMNS if field != "code" or "code" in fields]
    columns += [(field, title) for field, title in SPEC_COLUMNS if field in fields]

    return columns


#---------------------------------------------------------------------------
#the departments of the 3 sheets that exist in the database
def get_departments(db):

    departments = db.query(models.Department).filter(models.Department.name.in_(IMPORT_DEPARTMENTS)).all()

    return sorted(departments, key=lambda department: IMPORT_DEPARTMENTS.index(department.name))


def get_hotels(db, hotel_scope):

    query = db.query(models.Hotel).order_by(models.Hotel.id)

    if hotel_scope is not None:
        query = query.filter(models.Hotel.id.in_(hotel_scope))

    return query.all()


#---------------------------------------------------------------------------
#the empty template: a How to sheet, one sheet per department, and a hidden sheet with the drop-down lists
def build_template(db, hotel_scope, department_item_fields):

    hotels = get_hotels(db, hotel_scope)
    departments = get_departments(db)
    suppliers = [supplier.name for supplier in db.query(models.Supplier).order_by(models.Supplier.name)]

    workbook = Workbook()

    how_to = workbook.active
    how_to.title = "How to"
    lines = [
        "Import Items",
        "",
        "One sheet per department. Every row is one new item. Don't rename the sheets or the column titles.",
        "Name and Category can't be empty (marked with *).",
        "Category, Subcategory and Supplier must already exist in the app (Setup). Pick them from the drop-down lists.",
        "Cost per Unit: a number, e.g. 12.50. Leave it empty if you don't know it yet.",
        "Hotel columns (green): the opening quantity in that hotel, 0 or more. Leave it empty if the item isn't in that hotel.",
        "Every item needs a number under at least one hotel. The opening quantity goes to that hotel's Unassigned.",
        "Items that already exist (same Code, or same Name in that department when there's no Code) are skipped.",
        "In the app you first see what will happen, nothing is saved until you press Import.",
    ]
    for line in lines:
        how_to.append([line])
    how_to["A1"].font = Font(bold=True, size=14)
    how_to.column_dimensions["A"].width = 120

    lists = workbook.create_sheet("Lists")
    lists_column = 1

    #one drop-down list = one column of the hidden Lists sheet
    def add_list(title, values):
        nonlocal lists_column

        if not values:
            return None

        letter = get_column_letter(lists_column)
        lists.cell(row=1, column=lists_column, value=title)
        for row_number, value in enumerate(values, start=2):
            lists.cell(row=row_number, column=lists_column, value=value)

        lists_column += 1
        return f"=Lists!${letter}$2:${letter}${len(values) + 1}"

    supplier_list = add_list("Suppliers", suppliers)

    for department in departments:
        sheet = workbook.create_sheet(department.name)
        columns = sheet_columns(department_item_fields(department))

        categories = db.query(models.Category).filter(
            models.Category.department_id == department.id
        ).order_by(models.Category.name).all()

        category_list = add_list(f"{department.name} categories", [category.name for category in categories])
        subcategory_list = add_list(
            f"{department.name} subcategories",
            sorted({subcategory.name for category in categories for subcategory in category.subcategories})
        )

        titles = [title for _, title in columns] + [hotel.name for hotel in hotels]
        sheet.append(titles)

        for column_number, title in enumerate(titles, start=1):
            cell = sheet.cell(row=1, column=column_number)
            cell.font = HEADER_FONT
            cell.fill = HOTEL_FILL if column_number > len(columns) else HEADER_FILL
            cell.alignment = Alignment(horizontal="center")
            sheet.column_dimensions[get_column_letter(column_number)].width = 40 if title == "Name *" else max(14, len(title) + 4)

        sheet.freeze_panes = "B2"

        drop_downs = {"category": category_list, "subcategory": subcategory_list, "supplier": supplier_list}

        for column_number, (field, _) in enumerate(columns, start=1):
            letter = get_column_letter(column_number)
            cells = f"{letter}2:{letter}{TEMPLATE_ROWS + 1}"

            if drop_downs.get(field):
                validation = DataValidation(type="list", formula1=drop_downs[field], allow_blank=True)
                validation.error = "Pick one from the list (it must already exist in the app)."
                validation.errorTitle = "Not in the list"
                sheet.add_data_validation(validation)
                validation.add(cells)

            if field == "cost_per_unit":
                for row in range(2, TEMPLATE_ROWS + 2):
                    sheet.cell(row=row, column=column_number).number_format = "0.00"

            #sizes like 4-6 stay text, Excel doesn't turn them into dates
            if field in ("code", "size"):
                for row in range(2, TEMPLATE_ROWS + 2):
                    sheet.cell(row=row, column=column_number).number_format = "@"

    #the Lists sheet goes last and stays hidden
    workbook.move_sheet("Lists", offset=len(workbook.sheetnames))
    lists.sheet_state = "hidden"
    workbook.active = 1 if len(workbook.sheetnames) > 2 else 0

    output = BytesIO()
    workbook.save(output)

    return output.getvalue()


#---------------------------------------------------------------------------
#the uploaded file, only .xlsx up to 10 MB
async def read_upload(file):

    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported.")

    contents = await file.read(MAX_FILE_SIZE + 1)

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="The file must be 10 MB or smaller.")

    try:
        return load_workbook(BytesIO(contents), data_only=True)

    except (InvalidFileException, BadZipFile, KeyError, ValueError):
        raise HTTPException(status_code=400, detail="The selected file is not a valid Excel workbook.")


#a number in a cell (12.5, "12,50"), or None when it isn't one
def to_number(value):

    if isinstance(value, bool):
        return None

    if isinstance(value, (int, float)):
        return float(value)

    try:
        return float(str(value).strip().replace(",", "."))
    except ValueError:
        return None


#---------------------------------------------------------------------------
#checks every row of the file. Nothing is saved here.
#returns the report for the page, and the list of items that can be added
def check_workbook(db, workbook, hotel_scope, department_item_fields):

    report = {"sheets": [], "problems": []}
    to_add = []

    departments = {department.name: department for department in get_departments(db)}
    all_hotels = {hotel.name.lower(): hotel for hotel in db.query(models.Hotel).all()}
    suppliers = {supplier.name.lower(): supplier for supplier in db.query(models.Supplier).all()}

    existing_codes = {
        code.upper(): (item_id, name)
        for item_id, name, code in db.query(models.Item.id, models.Item.name, models.Item.code).filter(models.Item.code.isnot(None))
    }

    found_sheets = [name for name in IMPORT_DEPARTMENTS if name in workbook.sheetnames]
    if not found_sheets:
        report["problems"].append("No F&B, Housekeeping or Kitchen sheet in this file. Use the template.")

    codes_in_file = {}

    for sheet_name in found_sheets:
        sheet = workbook[sheet_name]
        result = {"department": sheet_name, "rows": [], "notes": [], "add": 0, "skip": 0, "error": 0}
        report["sheets"].append(result)

        department = departments.get(sheet_name)
        if department is None:
            result["notes"].append(f"There's no {sheet_name} department in the app, this sheet was not read.")
            continue

        if sheet.max_row > MAX_ROWS + 1:
            result["notes"].append(f"This sheet has more than {MAX_ROWS} rows, split it into smaller files.")
            continue

        rows = list(sheet.iter_rows(values_only=True))
        if not rows:
            continue

        #which column is which, from the titles in row 1
        known = {header_key(title): field for field, title in sheet_columns(department_item_fields(department))}
        columns = {}
        hotel_columns = {}
        ignored = []

        for index, title in enumerate(rows[0]):
            key = header_key(title)
            if not key:
                continue

            if key in known:
                columns[known[key]] = index
            elif key in all_hotels:
                hotel_columns[index] = all_hotels[key]
            else:
                ignored.append(clean(title))

        if ignored:
            result["notes"].append("These columns are not part of the template and were not read: " + ", ".join(ignored))

        outside = [hotel.name for hotel in hotel_columns.values() if hotel_scope is not None and hotel.id not in hotel_scope]
        if outside:
            result["notes"].append("You can only add items to your own hotels, remove these columns: " + ", ".join(outside))
            continue

        if "name" not in columns or "category" not in columns:
            if any(any(clean(value) for value in row) for row in rows[1:]):
                result["notes"].append("The Name or Category column is missing. Use the template.")
            continue

        categories = {
            category.name.lower(): category
            for category in db.query(models.Category).filter(models.Category.department_id == department.id)
        }

        existing_names = {
            name.lower()
            for (name,) in db.query(models.Item.name).filter(models.Item.department_id == department.id)
            if name
        }
        names_in_sheet = {}

        for row_number, values in enumerate(rows[1:], start=2):
            values = list(values)

            def cell(field):
                index = columns.get(field)
                return values[index] if index is not None and index < len(values) else None

            #empty rows (or rows with only spaces) are not rows
            if not any(clean(value) for value in values):
                continue

            errors = []
            name = clean(cell("name"))
            category_name = clean(cell("category"))
            subcategory_name = clean(cell("subcategory"))
            supplier_name = clean(cell("supplier"))
            code = (clean(cell("code")) or "").upper() or None

            if name is None:
                errors.append("Name is empty")

            category = None
            if category_name is None:
                errors.append("Category is empty")
            else:
                category = categories.get(category_name.lower())
                if category is None:
                    errors.append(f"Category {category_name} doesn't exist in {sheet_name}")

            subcategory = None
            if subcategory_name and category:
                subcategory = next((s for s in category.subcategories if s.name.lower() == subcategory_name.lower()), None)
                if subcategory is None:
                    errors.append(f"Subcategory {subcategory_name} doesn't exist under {category.name}")

            supplier = None
            if supplier_name:
                supplier = suppliers.get(supplier_name.lower())
                if supplier is None:
                    errors.append(f"Supplier {supplier_name} doesn't exist")

            cost = None
            if clean(cell("cost_per_unit")):
                cost = to_number(cell("cost_per_unit"))
                if cost is None or cost < 0:
                    errors.append("Cost per Unit must be a number (0 or more)")
                    cost = None

            openings = {}
            wrong_quantity = False
            for index, hotel in hotel_columns.items():
                value = values[index] if index < len(values) else None
                if not clean(value):
                    continue

                quantity = to_number(value)
                if quantity is None or quantity < 0 or quantity != int(quantity):
                    errors.append(f"{hotel.name} must be a whole number (0 or more)")
                    wrong_quantity = True
                else:
                    openings[hotel.id] = int(quantity)

            if not openings and not wrong_quantity:
                errors.append("Put a number (0 or more) under at least one hotel")

            #the same code twice in the file, or the same name twice in a sheet (without codes)
            if code and code in codes_in_file:
                errors.append(f"Code {code} is also on {codes_in_file[code]}")
            if not code and name and name.lower() in names_in_sheet:
                errors.append(f"Same name as row {names_in_sheet[name.lower()]}")

            skip_reason = None
            if code and code in existing_codes:
                item_id, item_name = existing_codes[code]
                skip_reason = f"Code {code} already exists (#{item_id} {item_name})"
            elif not code and name and name.lower() in existing_names:
                skip_reason = f"{name} already exists in {sheet_name}"

            if code:
                codes_in_file.setdefault(code, f"{sheet_name} row {row_number}")
            if not code and name:
                names_in_sheet.setdefault(name.lower(), row_number)

            line = {"row": row_number, "name": name or "-", "category": category_name or "-"}

            if errors:
                result["error"] += 1
                result["rows"].append({**line, "status": "error", "reason": ", ".join(errors)})
                continue

            if skip_reason:
                result["skip"] += 1
                result["rows"].append({**line, "status": "skip", "reason": skip_reason})
                continue

            result["add"] += 1
            result["rows"].append({**line, "status": "add", "reason": ""})

            specs = {field: clean(cell(field)) for field, _ in SPEC_COLUMNS if field in columns}
            if "size" in columns:
                specs["size"] = clean_size(cell("size"))

            to_add.append({
                "name": name,
                "code": code,
                "department_id": department.id,
                "category_id": category.id,
                "subcategory_id": subcategory.id if subcategory else None,
                "supplier_id": supplier.id if supplier else None,
                "cost_per_unit": cost,
                "openings": openings,
                "specs": specs,
            })

    report["add"] = sum(sheet["add"] for sheet in report["sheets"])
    report["skip"] = sum(sheet["skip"] for sheet in report["sheets"])
    report["error"] = sum(sheet["error"] for sheet in report["sheets"])

    return report, to_add


#---------------------------------------------------------------------------
#adds the checked items, all in ONE save: if anything goes wrong, nothing is added
def add_items(db, to_add, username, get_unassigned_row):

    for row in to_add:
        item = models.Item(
            name=row["name"],
            code=row["code"],
            department_id=row["department_id"],
            category_id=row["category_id"],
            subcategory_id=row["subcategory_id"],
            supplier_id=row["supplier_id"],
            cost_per_unit=row["cost_per_unit"],
            opening_quantity=sum(row["openings"].values()),
            **row["specs"]
        )
        db.add(item)
        db.flush()

        for hotel_id, quantity in row["openings"].items():
            db.add(models.ItemHotel(item_id=item.id, hotel_id=hotel_id, opening_quantity=quantity))

            #the opening quantity is real stock: it starts in the hotel's Unassigned, the same as a new item
            if quantity > 0:
                unassigned_row = get_unassigned_row(db, item.id, hotel_id)
                unassigned_row.total_quantity = (unassigned_row.total_quantity or 0) + quantity
                db.flush()

        db.add(models.ActionsLog(
            username=username,
            action="imported",
            entity_type="Item",
            entity_name=item.name,
            entity_id=item.id,
            details="From Import Items (Excel)"
        ))

    db.commit()

    return len(to_add)
