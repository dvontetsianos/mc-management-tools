from fastapi import FastAPI, Depends, HTTPException, Form, Request
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, get_db, SessionLocal
from . import models, schemas
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from jose import JWTError
from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pathlib import Path
import psutil
import socket
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment
from openpyxl.utils.exceptions import InvalidFileException
from zipfile import BadZipFile
from fastapi.responses import StreamingResponse
from io import BytesIO
import os
from dotenv import load_dotenv

load_dotenv()

import uuid
import shutil
from fastapi import UploadFile, File


#------------------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#------------------------------------------------------------------------

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

BASE_DIR = Path(__file__).resolve().parent.parent
LOG_FILE = BASE_DIR / "logs" / "user_feedback.txt"

#----------------------------------------------------------------------------

security = HTTPBearer()

#-----------------------------------------------------------------------------------

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        permissions = payload.get("permissions", [])
        department_id = payload.get("department_id")

        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return {
            "username": username,
            "role": role,
            "permissions": permissions,
            "department_id": department_id
        }
    
    except JWTError:
        raise HTTPException(status_code=401, detail="invalid token")

#-------------------------------------------------------------------------------------

def require_admin(user: dict = Depends(get_current_user)):
    if user["role"].lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    return user

#-----------------------------------------------------------------------
def require_admin_or_assets_access(user: dict = Depends(get_current_user)):
    if user["role"].lower() != "admin" and "assets_access" not in user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin or Assets access required")

    return user
#---------------------------------------------------------------------------------
def require_admin_or_categories_access(user: dict = Depends(get_current_user)):
    if user["role"].lower() != "admin" and "categories_access" not in user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin or Categories access required")

    return user
#-----------------------------------------------------------------------------------
def require_admin_or_locations_access(user: dict = Depends(get_current_user)):
    if user["role"].lower() != "admin" and "locations_access" not in user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin or Locations access required")

    return user
#----------------------------------------------------------------------------------
def require_admin_or_suppliers_access(user: dict = Depends(get_current_user)):
    if user["role"].lower() != "admin" and "suppliers_access" not in user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin or Suppliers access required")

    return user
#-------------------------------------------------------------------------
def require_admin_or_lost_found_access(user: dict = Depends(get_current_user)):
    if user["role"].lower() != "admin" and "lost_found_access" not in user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin or Lost & Found access required")

    return user
#-------------------------------------------------------------------------
def require_admin_or_reports_access(user: dict = Depends(get_current_user)):
    if user["role"].lower() != "admin" and "reports_access" not in user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin or Reports access required")

    return user
#-------------------------------------------------------------------------------------
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


    return encoded_jwt


#------------------------------------------------------------------------
def log_action(db, user, action, entity_type, entity_name, entity_id=None, details=None):

    log_entry = models.ActionsLog(
        username=user["username"],
        action=action,
        entity_type=entity_type,
        entity_name=entity_name,
        entity_id=entity_id,
        details=details
    )

    db.add(log_entry)
    db.commit()
#---------------------------------------------------------------------------------------
app = FastAPI()

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.0.187:5173",
        "https://localhost",
        "http://localhost"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def create_default_permissions():
    db = SessionLocal()

    permissions = [
        "assets_access",
        "categories_access",
        "locations_access",
        "suppliers_access",
        "view_excel_access",
        "lost_found_access",
        "reports_access"
    ]

    for permission_name in permissions:
        exists = db.query(models.Permission).filter(
            models.Permission.name == permission_name
        ).first()

        if not exists:
            db.add(
                models.Permission(name=permission_name)
            )

    db.commit()
    db.close()

create_default_permissions()

@app.get("/")
def home():
    return {"message": "F&B Asset System is running"}


#---------------------------------------------------------------------------------------
#get assets
@app.get("/assets", response_model=list[schemas.AssetResponse])
def get_assets(db: Session = Depends(get_db)):

    assets = db.query(models.Asset).options(
        joinedload(models.Asset.category),
        joinedload(models.Asset.location),
        joinedload(models.Asset.supplier)
    ).all()

    result = []

    for asset in assets:

        result.append({
            "id": asset.id,
            "name": asset.name,
            "category": asset.category.name if asset.category else None,
            "category_id": asset.category.id if asset.category else None,
            "location": asset.location.name if asset.location else None,
            "location_id": asset.location_id,
            "total_quantity": asset.total_quantity,
            "broken_quantity": asset.broken_quantity,
            "image_url": asset.image_url,
            "supplier": asset.supplier.name if asset.supplier else None,
            "supplier_id": asset.supplier_id,
            "cost_per_unit": asset.cost_per_unit
        })

    return result


#---------------------------------------------------------------------------
#export excel
@app.post("/assets/export")
def export_assets(
    assets: list[dict],
    db: Session = Depends(get_db)
):

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Assets"

    sheet.append([
        "ID",
        "Name",
        "Category",
        "Location",
        "Location ID",
        "Total Quantity",
        "Broken Quantity",
        "Supplier",
        "Cost per Unit"
    ])

    for asset in assets:
        sheet.append([
            asset["id"],
            asset["name"],
            asset["category"],
            asset.get("location"),
            asset.get("location_id"),
            asset["total_quantity"],
            asset["broken_quantity"],
            asset.get("supplier"),
            asset.get("cost_per_unit")
        ])

    for row in sheet.iter_rows(min_col=5, max_col=9):
        for cell in row:
            cell.alignment = Alignment(horizontal="center", vertical="center")


    file = BytesIO()
    workbook.save(file)

    file.seek(0)

    return StreamingResponse(
        file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=assets.xlsx"
        }
    )

#-----------------------------------------------------------------------------------
#import excel
@app.post("/excel/preview")
async def preview_excel(
    file: UploadFile = File(...),
    sheet_name: str | None = Form(None),
    user: dict = Depends(get_current_user)
):
    max_file_size = 10 * 1024 * 1024
    max_cells = 50_000

    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(
            status_code=400,
            detail="Only .xlsx files are supported."
        )

    file_contents = await file.read(max_file_size + 1)

    if len(file_contents) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail="The workbook must be 10 MB or smaller."
        )

    try:
        workbook = load_workbook(
            BytesIO(file_contents),
            read_only=True,
            data_only=True
        )

    except (InvalidFileException, BadZipFile):
        raise HTTPException(
            status_code=400,
            detail="The selected file is not a valid Excel workbook."
        )

    try:
        if sheet_name and sheet_name in workbook.sheetnames:
            worksheet = workbook[sheet_name]
        else:
            worksheet = workbook.active

        total_cells = worksheet.max_row * worksheet.max_column

        if total_cells > max_cells:
            raise HTTPException(
                status_code=400,
                detail="This worksheet is too large to preview."
            )

        rows = []

        for row in worksheet.iter_rows(values_only=True):
            rows.append([
                "" if cell is None else str(cell)
                for cell in row
            ])

        return {
            "file_name": file.filename,
            "sheet_names": workbook.sheetnames,
            "selected_sheet": worksheet.title,
            "rows": rows,
            "row_count": len(rows),
            "column_count": worksheet.max_column
        }

    finally:
        workbook.close()
#----------------------------------------------------------------------------------------
#create assets
@app.post("/assets")

def create_asset(
    asset: schemas.AssetCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    location = db.query(models.Location).filter(models.Location.id == asset.location_id).first()

    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    category = db.query(models.Category).filter(
        models.Category.id == asset.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    supplier = None

    if asset.supplier_id is not None:
        supplier = db.query(models.Supplier).filter(
            models.Supplier.id == asset.supplier_id
        ).first()

        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found"
            )

    new_asset = models.Asset(
        name=asset.name,
        category_id=asset.category_id,
        location_id=asset.location_id,
        total_quantity=asset.total_quantity,
        broken_quantity=asset.broken_quantity,
        supplier_id=asset.supplier_id,
        cost_per_unit=asset.cost_per_unit
    )

    try:
        db.add(new_asset)
        db.commit()
        db.refresh(new_asset)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="An asset with this name already exists in this location"
        )

    log_action(db, user, "created", "Asset", new_asset.name, new_asset.id)

    return {
        "id": new_asset.id,
        "name": new_asset.name,
        "category": category.name,
        "location": location.name,
        "total_quantity": new_asset.total_quantity,
        "broken_quantity": new_asset.broken_quantity,
        "supplier": supplier.name if supplier else None,
        "supplier_id": new_asset.supplier_id,
        "cost_per_unit": new_asset.cost_per_unit
    }

#---------------------------------------------------------------------------------------


#---------------------------------------------------------------------------------------
#update assets
@app.put("/assets/{asset_id}")

def update_asset(
    asset_id: int,
    asset: schemas.AssetUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):
    db_asset = db.query(models.Asset).filter(
        models.Asset.id == asset_id
        ).first()

    if db_asset is None:
        return {"error": "Asset not found"}

    category = db.query(models.Category).filter(
        models.Category.id == asset.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    location = db.query(models.Location).filter(
        models.Location.id == asset.location_id
    ).first()

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    supplier = None

    if asset.supplier_id is not None:
        supplier = db.query(models.Supplier).filter(
            models.Supplier.id == asset.supplier_id
        ).first()

        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found"
            )

    old_name = db_asset.name
    old_category_name = db_asset.category.name if db_asset.category else None
    old_location_name = db_asset.location.name if db_asset.location else None
    old_total_quantity = db_asset.total_quantity
    old_broken_quantity = db_asset.broken_quantity
    old_supplier_name = db_asset.supplier.name if db_asset.supplier else None
    old_cost_per_unit = db_asset.cost_per_unit

    
    db_asset.name = asset.name
    db_asset.category = category
    db_asset.location_id = asset.location_id
    db_asset.total_quantity = asset.total_quantity
    db_asset.broken_quantity = asset.broken_quantity
    db_asset.supplier_id = asset.supplier_id
    db_asset.cost_per_unit = asset.cost_per_unit

    db.commit()
    db.refresh(db_asset)

    new_supplier_name = supplier.name if supplier else None

    changes = []

    if old_name != asset.name:
        changes.append(f"Name: {old_name} -> {asset.name}")

    if old_category_name != category.name:
        changes.append(f"Category: {old_category_name} -> {category.name}")

    if old_location_name != location.name:
        changes.append(f"Location: {old_location_name} -> {location.name}")

    if old_total_quantity != asset.total_quantity:
        changes.append(f"Total Quantity: {old_total_quantity} -> {asset.total_quantity}")

    if old_broken_quantity != asset.broken_quantity:
        changes.append(f"Broken Quantity: {old_broken_quantity} -> {asset.broken_quantity}")

    if old_supplier_name != new_supplier_name:
        changes.append(f"Supplier: {old_supplier_name} -> {new_supplier_name}")

    if old_cost_per_unit != asset.cost_per_unit:
        changes.append(f"Cost per Unit: {old_cost_per_unit} -> {asset.cost_per_unit}")

    details = ", ".join(changes) if changes else "No changes"

    log_action(db, user, "updated", "Asset", db_asset.name, db_asset.id, details=details)
#==================================================
    return {
        "id": db_asset.id,
        "name": db_asset.name,
        "category": db_asset.category.name,
        "location": db_asset.location.name,
        "location_id": db_asset.location_id,
        "total_quantity": db_asset.total_quantity,
        "broken_quantity": db_asset.broken_quantity,
        "supplier": db_asset.supplier.name if db_asset.supplier else None,
        "supplier_id": db_asset.supplier_id,
        "cost_per_unit": db_asset.cost_per_unit
    }


#--------------------------------------------------------------------------------------
#delete assets
@app.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()

    if db_asset is None:
        return {"error": "Asset not found"}

    image_to_delete = db_asset.image_url

    asset_name = db_asset.name

    db.delete(db_asset)
    db.commit()

    log_action(db, user, "deleted", "Asset", asset_name, asset_id)

    if image_to_delete:
        if os.path.exists(image_to_delete):
            os.remove(image_to_delete)

    return {"message": "Asset deleted successfully"}

#-----------------------------------------------------------------------------------
#image
@app.post("/assets/{asset_id}/image")
def upload_asset_image(
    asset_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    asset = db.query(models.Asset).filter(
        models.Asset.id == asset_id
    ).first()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    old_image = asset.image_url

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed"
        )

    unique_filename = (
        f"{uuid.uuid4().hex}_{file.filename}"
    )

    upload_path = os.path.join(
        "uploads",
        "assets",
        unique_filename
    )

    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    asset.image_url = upload_path.replace("\\", "/")

    db.commit()
    db.refresh(asset)

    log_action(db, user, "uploaded image for", "Asset", asset.name, asset.id)

    if old_image:

        if os.path.exists(old_image):

            os.remove(old_image)

    return {
        "message": "Image uploaded successfully",
        "image_url": asset.image_url
    }

#------------------------------------------------------------------------
@app.delete("/assets/{asset_id}/image")
def delete_asset_image(
    asset_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    asset = db.query(models.Asset).filter(
        models.Asset.id == asset_id
    ).first()


    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    image_to_delete = asset.image_url

    asset.image_url = None
    db.commit()

    log_action(db, user, "removed image from", "Asset", asset.name, asset.id)


    if image_to_delete:
        if os.path.exists(image_to_delete):
            os.remove(image_to_delete)

    return {"message": "Image removed successfully"}


#---------------------------------------------------------------------
#get action history
@app.get("/history")
def get_history(
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    total = db.query(models.ActionsLog).count()

    logs = db.query(models.ActionsLog).order_by(models.ActionsLog.timestamp.desc()).all()

    return {
        "logs": logs,
        "total": total
    }

#------------------------------------------------------------------------
#inventory value report (grouped by category, location and supplier)
@app.get("/reports/inventory-value")
def get_inventory_value_report(
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin_or_reports_access)
):

    assets = db.query(models.Asset).options(
        joinedload(models.Asset.category),
        joinedload(models.Asset.location),
        joinedload(models.Asset.supplier)
    ).all()


    by_category = {}
    by_location = {}
    by_supplier = {}

    grand_total = 0.0
    missing_cost_count = 0


    for asset in assets:

        if asset.cost_per_unit is None:
            missing_cost_count += 1
            continue

        value = asset.total_quantity * asset.cost_per_unit


        category_name = asset.category.name if asset.category else "Uncategorized"
        location_name = asset.location.name if asset.location else "No location"
        supplier_name = asset.supplier.name if asset.supplier else "No Supplier"

        by_category[category_name] = by_category.get(category_name, 0) + value
        by_location[location_name] = by_location.get(location_name, 0) + value
        by_supplier[supplier_name] = by_supplier.get(supplier_name, 0) + value

        grand_total += value


    def to_sorted_list(breakdown):

        items = [{"name": name, "value": value} for name, value in breakdown.items()]

        items.sort(key=lambda item: item["value"], reverse=True)

        return items


    return {
        "grand_total": grand_total,
        "missing_cost_count": missing_cost_count,
        "by_category": to_sorted_list(by_category),
        "by_location": to_sorted_list(by_location),
        "by_supplier": to_sorted_list(by_supplier)
    }
#-----------------------------------------------------------------------------------------
#get locations
@app.get("/locations")
def get_locations(db: Session = Depends(get_db)):
    return db.query(models.Location).all()


#------------------------------------------------------------------------------------------
#create locations
@app.post("/locations")

def create_location(
    location_name: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_locations_access)
):

    new_location = models.Location(name=location_name)

    try:
        db.add(new_location)
        db.commit()
        db.refresh(new_location)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Location already exists"
        )


    return new_location

#---------------------------------------------------------------------------
#delete location
@app.delete("/locations/{location_id}")
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin)
):

    location = db.query(models.Location).filter(
        models.Location.id == location_id
    ).first()

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    assets_using_location = db.query(models.Asset).filter(
        models.Asset.location_id == location_id
    ).count()

    if assets_using_location > 0:
        raise HTTPException(
            status_code=404,
            detail="Cannot delete location. Assets are using this location."
        )

    db.delete(location)
    db.commit()

    return {
        "message": "Location deleted successfully"
    }
#------------------------------------------------------------------------------------
#get category
@app.get("/categories")
def get_categories(
    db: Session = Depends(get_db)
):
    return db.query(models.Category).all()

#---------------------------------------------------------------------------
#create category
@app.post("/categories")
def create_category(
    category_name: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin_or_categories_access)
):

    new_category = models.Category(
        name=category_name
    )

    try:
        db.add(new_category)
        db.commit()
        db.refresh(new_category)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    return new_category


#-----------------------------------------------------------------------
#delete category
@app.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    category = db.query(models.Category).filter(
        models.Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    assets_using_category = db.query(models.Asset).filter(
        models.Asset.category_id == category_id
    ).count()

    if assets_using_category > 0:
        raise HTTPException(
            status_code=404,
            detail="Cannot delete category. Assets are using this category."
        )

    db.delete(category)
    db.commit()

    return {
        "message": "Category deleted successfully"
    }

#---------------------------------------------------------------------------
#get suppliers
@app.get("/suppliers")
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).all()

#-------------------------------------------------------------------------------
#create supplier
@app.post("/suppliers")
def create_supplier(
    supplier_name: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_suppliers_access)
):

    new_supplier = models.Supplier(
        name=supplier_name
    )

    try:
        db.add(new_supplier)
        db.commit()
        db.refresh(new_supplier)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Supplier already exists"
        )

    return new_supplier


#------------------------------------------------------------------------
#delete supplier
@app.delete("/suppliers/{supplier_id}")
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == supplier_id
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )


    assets_using_supplier = db.query(models.Asset).filter(
        models.Asset.supplier_id == supplier_id
    ).count()

    if assets_using_supplier > 0:
        raise HTTPException(
            status_code=404,
            detail="Cannot delete supplier. Assets are using this supplier."
        )

    db.delete(supplier)
    db.commit()

    return {
        "message": "Supplier deleted successfully"
    }
#---------------------------------------------------------------------------
#get departments
@app.get("/departments", response_model=list[schemas.DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()

#-------------------------------------------------------------------
#create department
@app.post("/departments", response_model=schemas.DepartmentResponse)
def create_department(
    department: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    new_department = models.Department(
        name=department.name
    )

    try:
        db.add(new_department)
        db.commit()
        db.refresh(new_department)


    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Department already exists"
        )

    return new_department


#------------------------------------------------------------------------
#delete department
@app.delete("/departments/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    department = db.query(models.Department).filter(
        models.Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    users_using_department = db.query(models.User).filter(
        models.User.department_id == department_id
    ).count()


    if users_using_department > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete department. Users are assigned to this department."
        )

    db.delete(department)
    db.commit()

    return {
        "message": "Department deleted successfully"
    }


#-------------------------------------------------------------------------
#create request
@app.post("/requests", response_model=schemas.RequestResponse)
def create_request(
    request_data: schemas.RequestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    sender = db.query(models.User).filter(
        models.User.username == current_user["username"]
    ).first()

    target_department = db.query(models.Department).filter(
        models.Department.id == request_data.target_department_id
    ).first()

    if not target_department:
        raise HTTPException(
            status_code=404,
            detail="Target department not found"
        )

    new_request = models.Request(
        title=request_data.title,
        description=request_data.description,
        target_department_id=request_data.target_department_id,
        sender_id=sender.id,
        sender_department_id=sender.department_id
    )


    db.add(new_request)
    db.commit()
    db.refresh(new_request)


    return {
        "id": new_request.id,
        "title": new_request.title,
        "description": new_request.description,
        "status": new_request.status,
        "created_at": new_request.created_at,
        "image_url": new_request.image_url,
        "sender_id": new_request.sender_id,
        "sender_username": sender.username,
        "sender_department_id": new_request.sender_department_id,
        "sender_department": sender.department.name if sender.department else None,
        "target_department_id": new_request.target_department_id,
        "target_department": target_department.name
    }


#-------------------------------------------------------------------------
#get requests visible to the current user (sender, target, admin)
@app.get("/requests", response_model=list[schemas.RequestResponse])
def get_requests(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    viewer = db.query(models.User).filter(
        models.User.username == current_user["username"]
    ).first()

    all_requests = db.query(models.Request).all()

    visible_requests = []

    for req in all_requests:

        is_sender = req.sender_id == viewer.id
        is_target_department = (
            viewer.department_id is not None
            and req.target_department_id == viewer.department_id
        )
        is_admin = current_user["role"].lower() == "admin"

        if is_sender or is_target_department or is_admin:
            visible_requests.append(req)


    result = []


    for req in visible_requests:
        result.append({
            "id": req.id,
            "title": req.title,
            "description": req.description,
            "status": req.status,
            "created_at": req.created_at,
            "image_url": req.image_url,
            "sender_id": req.sender_id,
            "sender_username": req.sender.username if req.sender else None,
            "sender_department_id": req.sender_department_id,
            "sender_department": req.sender_department.name if req.sender_department else None,
            "target_department_id": req.target_department_id,
            "target_department": req.target_department.name if req.target_department else None
        })

    return result

#---------------------------------------------------------------------------
#pending request count for my department
@app.get("/requests/pending-count")
def get_pending_request_count(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    viewer = db.query(models.User).filter(
        models.User.username == current_user["username"]
    ).first()

    if viewer.department_id is None:
        return {"count": 0}


    count = db.query(models.Request).filter(
        models.Request.target_department_id == viewer.department_id,
        models.Request.status == "pending"
    ).count()

    return {"count": count}
#------------------------------------------------------------------------
#update request status target department or admin
@app.put("/requests/{request_id}/status")
def update_request_status(
    request_id: int,
    status_data: schemas.RequestStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):

    request_obj = db.query(models.Request).filter(
        models.Request.id == request_id
    ).first()


    if not request_obj:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    viewer = db.query(models.User).filter(
        models.User.username == current_user["username"]
    ).first()

    is_admin = current_user["role"].lower() == "admin"
    is_target_department = (
        viewer.department_id is not None
        and request_obj.target_department_id == viewer.department_id
    )

    if not (is_admin or is_target_department):
        raise HTTPException(
            status_code=403,
            detail="Only the target department or an admin can update this request"
        )

    request_obj.status = status_data.status
    db.commit()
    db.refresh(request_obj)

    return {
        "message": "Request status updated successfully",
        "status" : request_obj.status
    }

#-------------------------------------------------------------------------
#delete request
@app.delete("/requests/{request_id}")
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    request_obj = db.query(models.Request).filter(
        models.Request.id == request_id
    ).first()

    if not request_obj:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    db.delete(request_obj)
    db.commit()

    return {
        "message": "Request deleted successfully"
    }
#-------------------------------------------------------------------------------
@app.get("/debug/users")
def debug_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
#--------------------------------------------------------------------------
#get users
@app.get("/users", response_model=list[schemas.UserOut])
def get_users(
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    
    users = db.query(models.User).all()

    result = []

    for user in users:

        permissions = []

        for user_permission in user.permissions:
            permissions.append(
                user_permission.permission.name
            )
        
        result.append({
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "department": user.department.name if user.department else None,
            "department_id": user.department_id,
            "permissions": permissions
        })
    
    return result

#------------------------------------------------------------------------------------
#create user
@app.post("/users")
def create_user(
    user_data: schemas.UserCreate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    hashed_password = pwd_context.hash(user_data.password)

    db_user = models.User(
        username=user_data.username,
        password_hash=hashed_password,
        role=user_data.role,
        department_id=user_data.department_id
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    for permission_name in user_data.permissions:

        permission = db.query(models.Permission).filter(
            models.Permission.name == permission_name
        ).first()

        if permission:
            user_permission = models.UserPermission(
                user_id=db_user.id,
                permission_id=permission.id
            )

            db.add(user_permission)

    db.commit()

    return db_user

#-------------------------------------------------------------------------
#delete user
@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):
    db_user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if db_user.username == admin["username"]:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account"
        )

    #remove permissions first
    db.query(models.UserPermission).filter(
        models.UserPermission.user_id == user_id
    ).delete()


    db.delete(db_user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }

#--------------------------------------------------------------------------
#password update
@app.put("/users/{user_id}/password")
def change_user_password(
    user_id: int,
    password_data: schemas.UserPasswordUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    db_user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()


    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db_user.password_hash = pwd_context.hash(password_data.password)

    db.commit()

    return {
        "message": "Password updated successfully"
    }


#-------------------------------------------------------------------------
#update department
@app.put("/users/{user_id}/department")
def update_user_department(
    user_id: int,
    department_data: schemas.UserDepartmentUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    db_user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()


    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if department_data.department_id is not None:
        department = db.query(models.Department).filter(
            models.Department.id == department_data.department_id
        ).first()


        if not department:
            raise HTTPException(
                status_code=404,
                detail="Department not found"
            )


    db_user.department_id = department_data.department_id

    db.commit()

    return {
        "message": "Department updated successfully"
    }
#----------------------------------------------------------------------
#update permissions
@app.put("/users/{user_id}/permissions")
def update_user_permissions(
    user_id: int,
    permissions_data: schemas.UserPermissionsUpdate,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    db_user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    #remove existing permissions

    db.query(models.UserPermission).filter(
        models.UserPermission.user_id == user_id
    ).delete()

    #add selected permissions

    for permission_name in permissions_data.permissions:

        permission = db.query(models.Permission).filter(
            models.Permission.name == permission_name
        ).first()

        if not permission:
            raise HTTPException(
                status_code=404,
                detail=f"Permission `{permission_name}` not found"
            )

        db.add(
            models.UserPermission(
                user_id=user_id,
                permission_id=permission.id
            )
        )

    db.commit()

    return {
        "message": "Permissions updated successfully"
    }
#---------------------------------------------------------------------------------------
#login
@app.post("/login")
def login(user: schemas.UserLogin, request: Request, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(
        models.User.username ==user.username
    ).first()


    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")


    os.makedirs("logs", exist_ok=True)

    client_host = request.client.host if request.client else "unknown"

    print(
        f"LOGIN | User: {db_user.username} | "
        f"IP: {client_host} | "
        f"Time: {datetime.now().strftime('%H:%M:%S')}"
    )

    with open("logs/login_log.txt", "a", encoding="utf-8") as log_file:
        log_file.write(
            f"{datetime.now().strftime('%Y-%m-%d %H:%M')} | "
            f"User: {db_user.username} | "
            f"IP: {client_host}\n"
        )
    
    permissions = []

    for user_permission in db_user.permissions:
        permissions.append(user_permission.permission.name)

    token = create_access_token({
        "sub": db_user.username,
        "role": db_user.role,
        "permissions": permissions,
        "department_id": db_user.department_id
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
#--------------------------------------------------------------------------
#refresh token
@app.post("/refresh-token")
def refresh_token(current_user: dict = Depends(get_current_user)):

    token = create_access_token({
        "sub": current_user["username"],
        "role": current_user["role"],
        "permissions": current_user["permissions"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }

#----------------------------------------------------------------------------
#feedback
@app.post("/feedback")
def save_feedback(
    feedback: schemas.FeedbackCreate,
    current_user: dict = Depends(get_current_user)
):
    
    with open("logs/user_feedback.txt", "a", encoding="utf-8") as file:
    
        file.write("=" * 50 + "\n")
        file.write(f"Date: {datetime.now()}\n")
        file.write(f"User: {current_user['username']}\n")
        file.write(f"Type: {feedback.type}\n")
        file.write("Message:\n")
        file.write(feedback.message + "\n")
        file.write("=" * 50 + "\n\n")

    return {"message": "Feedback saved"}

#-----------------------------------------------------------------------
#system status
@app.get("/system/status")
def system_status():
    return {
        "hostname": socket.gethostname(),
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage("/").percent
    }

#------------------------------------------------------------------------
#get lost and found items
@app.get("/lost-found")
def get_lost_found_items(
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_lost_found_access)
):

    items = db.query(models.LostFoundItem).order_by(
        models.LostFoundItem.date_found.desc()
    ).all()

    return items

#-------------------------------------------------------------------------------
#create lost and found item
@app.post("/lost-found")
def create_lost_found_item(
    item: schemas.LostFoundItemCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_lost_found_access)
):

    new_item = models.LostFoundItem(
        description=item.description,
        location_found=item.location_found,
        found_by=item.found_by,
        notes=item.notes
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    log_action(db, user, "created", "Lost & Found Item", new_item.description, new_item.id, details=f"Location: {new_item.location_found or '-'}, Found by: {new_item.found_by or '-'}")

    return new_item

#-------------------------------------------------------------------------
#mark lost and found item as claimed
@app.put("/lost-found/{item_id}/claim")
def claim_lost_found_item(
    item_id: int,
    claim: schemas.LostFoundClaim,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_lost_found_access)
):

    db_item = db.query(models.LostFoundItem).filter(
        models.LostFoundItem.id == item_id
    ).first()

    if not db_item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    db_item.status = "claimed"
    db_item.claimed_by = claim.claimed_by
    db_item.claimed_date = datetime.utcnow()

    db.commit()
    db.refresh(db_item)

    log_action(db, user, "claimed", "Lost & Found Item", db_item.description, db_item.id, details=f"Claimed by {claim.claimed_by}")

    return db_item

#-----------------------------------------------------------------------------
#unclaim lost and found item (admin only)
@app.put("/lost-found/{item_id}/unclaim")
def unclaim_lost_found_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin)
):

    db_item = db.query(models.LostFoundItem).filter(
        models.LostFoundItem.id == item_id
    ).first()

    if not db_item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    previous_claimed_by = db_item.claimed_by

    db_item.status = "unclaimed"
    db_item.claimed_by = None
    db_item.claimed_date = None

    db.commit()
    db.refresh(db_item)

    log_action(db, user, "unclaimed", "Lost & Found Item", db_item.description, db_item.id, details=f"Was claimed by {previous_claimed_by}")

    return db_item
#------------------------------------------------------------------------
#delete lost and found item
@app.delete("/lost-found/{item_id}")
def delete_lost_found_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin)
):

    db_item = db.query(models.LostFoundItem).filter(
        models.LostFoundItem.id == item_id
    ).first()

    if not db_item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    item_description = db_item.description
    item_status = db_item.status
    item_claimed_by = db_item.claimed_by

    db.delete(db_item)
    db.commit()

    if item_status == "claimed":
        delete_details = f"Was claimed by {item_claimed_by}"

    else:
        delete_details = "Was unclaimed"

    log_action(db, user, "deleted", "Lost & Found Item", item_description, item_id, details=delete_details)


    return {"message": "Item deleted successfully"}


#-----------------------------------------------------------------------
#get items with aggregate total and their location assignments
@app.get("/items", response_model=list[schemas.ItemResponse])
def get_items(db: Session = Depends(get_db)):

    items = db.query(models.Item).options(
        joinedload(models.Item.category),
        joinedload(models.Item.supplier),
        joinedload(models.Item.locations).joinedload(models.ItemLocation.location)
    ).all()


    purchases_by_item = dict(
        db.query(models.Purchase.item_id, func.sum(models.Purchase.quantity))
        .group_by(models.Purchase.item_id)
        .all()
    )

    result = []

    for item in items:

        locations = []
        total_quantity = 0
        broken_quantity = 0

        for item_location in item.locations:

            locations.append({
                "id": item_location.id,
                "item_id": item.id,
                "item_name": item.name,
                "location_id": item_location.location_id,
                "location": item_location.location.name if item_location.location else None,
                "total_quantity": item_location.total_quantity,
                "broken_quantity": item_location.broken_quantity
            })

            total_quantity += item_location.total_quantity
            broken_quantity += item_location.broken_quantity


        opening_quantity = item.opening_quantity or 0
        purchases_this_year = purchases_by_item.get(item.id, 0) or 0
        expected_total = opening_quantity + purchases_this_year
        broken_missing = expected_total - total_quantity


        result.append({
            "id": item.id,
            "name": item.name,
            "category": item.category.name if item.category else None,
            "category_id": item.category_id,
            "supplier": item.supplier.name if item.supplier else None,
            "supplier_id": item.supplier_id,
            "cost_per_unit": item.cost_per_unit,
            "image_url": item.image_url,
            "total_quantity": total_quantity,
            "broken_quantity": broken_quantity,
            "opening_quantity": opening_quantity,
            "purchases_this_year": purchases_this_year,
            "expected_total": expected_total,
            "broken_missing": broken_missing,
            "locations": locations
        })

    return result

#----------------------------------------------------------------------------
#export items currently shown on screen in excel
@app.post("/items/export")
def export_items(
    items: list[dict],
    db: Session = Depends(get_db)
):

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Items"


    sheet.append([
        "ID",
        "Name",
        "Cateogry",
        "Locations",
        "Total Quantity",
        "Broken Quantity",
        "Supplier",
        "Cost per Unit"
    ])

    for item in items:
        location_names = ", ".join(
            loc["location"] for loc in item.get("locations", []) if loc.get("location")
        )

        sheet.append([
            item["id"],
            item["name"],
            item.get("category"),
            location_names,
            item["total_quantity"],
            item["broken_quantity"],
            item.get("supplier"),
            item.get("cost_per_unit")
        ])

    for row in sheet.iter_rows(min_col=5, max_col=8):
        for cell in row:
            cell.alignment = Alignment(horizontal="center", vertical="center")


    file = BytesIO()
    workbook.save(file)

    file.seek(0)

    return StreamingResponse(
        file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=items.xlsx"
        }
    )
#---------------------------------------------------------------------------------
#create item
@app.post("/items")
def create_item(
    item: schemas.ItemCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    category = db.query(models.Category).filter(
        models.Category.id == item.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    supplier = None


    if item.supplier_id is not None:
        supplier = db.query(models.Supplier).filter(
            models.Supplier.id == item.supplier_id
        ).first()

        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found"
            )


    new_item = models.Item(
        name=item.name,
        category_id=item.category_id,
        supplier_id=item.supplier_id,
        cost_per_unit=item.cost_per_unit
    )


    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)


    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="An item with this name already exists"
        )

    log_action(db, user, "created", "Item", new_item.name, new_item.id)

    return {
        "id": new_item.id,
        "name": new_item.name,
        "category": category.name,
        "category_id": new_item.category_id,
        "supplier": supplier.name if supplier else None,
        "supplier_id": new_item.supplier_id,
        "cost_per_unit": new_item.cost_per_unit,
        "image_url": new_item.image_url,
        "total_quantity": 0,
        "broken_quantity": 0,
        "locations": []
    }


#----------------------------------------------------------------------
#update item
@app.put("/items/{item_id}")
def update_item(
    item_id: int,
    item: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    db_item = db.query(models.Item).filter(
        models.Item.id == item_id
    ).first()

    if db_item is None:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    category = db.query(models.Category).filter(
        models.Category.id == item.category_id
    ).first()


    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    supplier = None

    if item.supplier_id is not None:
        supplier = db.query(models.Supplier).filter(
            models.Supplier.id == item.supplier_id
        ).first()


        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found"
            )


    old_name = db_item.name
    old_category_name = db_item.category.name if db_item.category else None
    old_supplier_name = db_item.supplier.name if db_item.supplier else None
    old_cost_per_unit = db_item.cost_per_unit

    db_item.name = item.name
    db_item.category_id = item.category_id
    db_item.supplier_id = item.supplier_id
    db_item.cost_per_unit = item.cost_per_unit


    try:
        db.commit()
        db.refresh(db_item)


    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="An item with this name already exists"
        )


    new_supplier_name = supplier.name if supplier else None

    changes = []

    if old_name != item.name:
        changes.append(f"Name: {old_name} -> {item.name}")


    if old_category_name != category.name:
        changes.append(f"Category: {old_category_name} -> {category.name}")


    if old_supplier_name != new_supplier_name:
        changes.append(f"Supplier: {old_supplier_name} -> {new_supplier_name}")


    if old_cost_per_unit != item.cost_per_unit:
        changes.append(f"Cost per Unit: {old_cost_per_unit} -> {item.cost_per_unit}")


    details = ", ".join(changes) if changes else "No changes"


    log_action(db, user, "updated", "Item", db_item.name, db_item.id, details=details)


    return {
        "id": db_item.id,
        "name": db_item.name,
        "category": category.name,
        "category_id": db_item.category_id,
        "supplier": new_supplier_name,
        "supplier_id": db_item.supplier_id,
        "cost_per_unit": db_item.cost_per_unit,
        "image_url": db_item.image_url
    }


#-----------------------------------------------------------------
#delete item admin only
@app.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin)
):

    db_item = db.query(models.Item).filter(
        models.Item.id == item_id
    ).first()

    if db_item is None:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    location_names = [
        item_location.location.name
        for item_location in db_item.locations
        if item_location.location
    ]

    image_to_delete = db_item.image_url
    item_name = db_item.name


    db.query(models.ItemLocation).filter(
        models.ItemLocation.item_id == item_id
    ).delete()

    db.delete(db_item)
    db.commit()

    details = (
        f"Was assigned to: {', '.join(location_names)}"
        if location_names
        else "Was not assigned to any locations"
    )

    log_action(db, user, "deleted", "Item", item_name, item_id, details=details)

    if image_to_delete:
        if os.path.exists(image_to_delete):
            os.remove(image_to_delete)

    return {"message": "Item deleted successfully"}

#-----------------------------------------------------------------------
#image
@app.post("/items/{item_id}/image")
def upload_item_image(
    item_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    item = db.query(models.Item).filter(
        models.Item.id == item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="item not found"
        )

    old_image = item.image_url


    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed"
        )

    unique_filename = (
        f"{uuid.uuid4().hex}_{file.filename}"
    )

    upload_path = os.path.join(
        "uploads",
        "items",
        unique_filename
    )

    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    item.image_url = upload_path.replace("\\", "/")

    db.commit()
    db.refresh(item)

    log_action(db, user, "uploaded image for", "Item", item.name, item.id)

    if old_image:

        if os.path.exists(old_image):

            os.remove(old_image)

    return {
        "message": "Image uploaded successfully",
        "image_url": item.image_url
    }


#----------------------------------------------------------------------------------
@app.delete("/items/{item_id}/image")
def delete_item_image(
    item_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    item = db.query(models.Item).filter(
        models.Item.id == item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )


    image_to_delete = item.image_url

    item.image_url = None
    db.commit()


    log_action(db, user, "removed image from", "Item", item.name, item.id)

    if image_to_delete:
        if os.path.exists(image_to_delete):
            os.remove(image_to_delete)

    return {"message": "Image removed successfully"}


#---------------------------------------------------------------------
#get item-location assignments for locations tab
@app.get("/item-locations", response_model=list[schemas.ItemLocationResponse])
def get_item_locations(db: Session = Depends(get_db)):

    item_locations = db.query(models.ItemLocation).options(
        joinedload(models.ItemLocation.item),
        joinedload(models.ItemLocation.location)
    ).all()


    result = []


    for item_location in item_locations:

        result.append({
            "id": item_location.id,
            "item_id": item_location.item_id,
            "item_name": item_location.item.name if item_location.item else None,
            "location_id": item_location.location_id,
            "location": item_location.location.name if item_location.location else None,
            "total_quantity": item_location.total_quantity,
            "broken_quantity": item_location.broken_quantity
        })


    return result

#---------------------------------------------------------------------
#assign an item to a location
@app.post("/item-locations")
def create_item_location(
    item_location: schemas.ItemLocationCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    item = db.query(models.Item).filter(
        models.Item.id == item_location.item_id
    ).first()


    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    location = db.query(models.Location).filter(
        models.Location.id == item_location.location_id
    ).first()


    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    new_item_location = models.ItemLocation(
        item_id=item_location.item_id,
        location_id=item_location.location_id,
        total_quantity=item_location.total_quantity,
        broken_quantity=item_location.broken_quantity
    )


    try:
        db.add(new_item_location)
        db.commit()
        db.refresh(new_item_location)


    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="This item is already assigned to this location. Edit its quantity instead."
        )

    log_action(
        db,
        user,
        "assigned",
        "Item",
        item.name,
        item.id,
        details=f"Assigned to {location.name} (Qty: {new_item_location.total_quantity}, Broken: {new_item_location.broken_quantity})"
    )

    return {
        "id": new_item_location.id,
        "item_id": new_item_location.item_id,
        "item_name": item.name,
        "location_id": new_item_location.location_id,
        "location": location.name,
        "total_quantity": new_item_location.total_quantity,
        "broken_quantity": new_item_location.broken_quantity
    }


#-----------------------------------------------------------------------
#update quantity at a location
@app.put("/item-locations/{item_location_id}")
def update_item_location(
    item_location_id: int,
    item_location: schemas.ItemLocationUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    db_item_location = db.query(models.ItemLocation).filter(
        models.ItemLocation.id == item_location_id
    ).first()

    if db_item_location is None:
        raise HTTPException(
            status_code=404,
            detail="Item location not found"
        )

    old_total_quantity = db_item_location.total_quantity
    old_broken_quantity = db_item_location.broken_quantity

    db_item_location.total_quantity = item_location.total_quantity
    db_item_location.broken_quantity = item_location.broken_quantity

    db.commit()
    db.refresh(db_item_location)


    changes = []

    if old_total_quantity != item_location.total_quantity:
        changes.append(f"Total Quantity: {old_total_quantity} -> {item_location.total_quantity}")


    if old_broken_quantity != item_location.broken_quantity:
        changes.append(f"Broken Quantity: {old_broken_quantity} -> {item_location.broken_quantity}")


    details = ", ".join(changes) if changes else "No changes"


    log_action(
        db,
        user,
        "updated",
        "Item Location",
        db_item_location.item.name if db_item_location.item else "Unknown item",
        db_item_location.item_id,
        details=f"At {db_item_location.location.name if db_item_location.location else 'Unknown location'}: {details}"
    )


    return {
        "id": db_item_location.id,
        "item_id": db_item_location.item_id,
        "item_name": db_item_location.item.name if db_item_location.item else None,
        "location_id": db_item_location.location_id,
        "location": db_item_location.location.name if db_item_location.location else None,
        "total_quantity": db_item_location.total_quantity,
        "broken_quantity": db_item_location.broken_quantity
    }


#----------------------------------------------------------------------------------
#remove an item from a single location (stays assigned elsewhere)
@app.delete("/item-locations/{item_location_id}")
def delete_item_location(
    item_location_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):


    db_item_location = db.query(models.ItemLocation).filter(
        models.ItemLocation.id == item_location_id
    ).first()


    if db_item_location is None:
        raise HTTPException(
            status_code=404,
            detail="Item location not found"
        )


    item_name = db_item_location.item.name if db_item_location.item else "Unknown item"
    location_name = db_item_location.location.name if db_item_location.location else "Unknown location"
    item_id = db_item_location.item_id


    db.delete(db_item_location)
    db.commit()


    log_action(db, user, "unassigned", "Item", item_name, item_id, details=f"Removed from {location_name}")

    return {"message": "Item removed from location successfully"}


#--------------------------------------------------------------------------
#get purchases, optionally filtered to one item
@app.get("/purchases", response_model=list[schemas.PurchaseResponse])
def get_purchases(
    item_id: int | None = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):


    query = db.query(models.Purchase).options(
        joinedload(models.Purchase.item),
        joinedload(models.Purchase.supplier)
    )

    if item_id is not None:
        query = query.filter(models.Purchase.item_id == item_id)


    purchases = query.order_by(models.Purchase.created_at.desc()).all()


    result = []


    for purchase in purchases:

        result.append({
            "id": purchase.id,
            "item_id": purchase.item_id,
            "item_name": purchase.item.name if purchase.item else None,
            "quantity": purchase.quantity,
            "unit_cost": purchase.unit_cost,
            "supplier_id": purchase.supplier_id,
            "supplier": purchase.supplier.name if purchase.supplier else None,
            "document_number": purchase.document_number,
            "document_date": purchase.document_date,
            "source_file": purchase.source_file,
            "notes": purchase.notes,
            "created_at": purchase.created_at
        })

    return result


#---------------------------------------------------------------------
#log a purchase
@app.post("/purchases", response_model=schemas.PurchaseResponse)
def create_purchase(
    purchase: schemas.PurchaseCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin_or_assets_access)
):

    item = db.query(models.Item).filter(
        models.Item.id == purchase.item_id
    ).first()


    if not item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    supplier = None

    if purchase.supplier_id is not None:
        supplier = db.query(models.Supplier).filter(
            models.Supplier.id == purchase.supplier_id
        ).first()


        if not supplier:
            raise HTTPException(
                status_code=404,
                detail="Supplier not found"
            )


    new_purchase = models.Purchase(
        item_id=purchase.item_id,
        quantity=purchase.quantity,
        unit_cost=purchase.unit_cost,
        supplier_id=purchase.supplier_id,
        document_number=purchase.document_number,
        document_date=purchase.document_date,
        notes=purchase.notes
    )

    db.add(new_purchase)
    db.commit()
    db.refresh(new_purchase)

    log_action(
        db,
        user,
        "logged a purchase of",
        item.name,
        item.id,
        details=f"Qty: {new_purchase.quantity}" + (f", Supplier: {supplier.name}" if supplier else "")
    )

    return {
        "id": new_purchase.id,
        "item_id": new_purchase.item_id,
        "item_name": item.name,
        "quantity": new_purchase.quantity,
        "unit_cost": new_purchase.unit_cost,
        "supplier_id": new_purchase.supplier_id,
        "supplier": supplier.name if supplier else None,
        "document_number": new_purchase.document_number,
        "document_date": new_purchase.document_date,
        "source_file": new_purchase.source_file,
        "notes": new_purchase.notes,
        "created_at": new_purchase.created_at
    }

#-------------------------------------------------------------------
#delete a purchase (admin only, for correcting mistakes)
@app.delete("/purchases/{purchase_id}")
def delete_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    admin: dict = Depends(require_admin)
):

    db_purchase = db.query(models.Purchase).filter(
        models.Purchase.id == purchase_id
    ).first()

    if db_purchase is None:
        raise HTTPException(
            status_code=404,
            detail="Purchase not found"
        )

    item_name = db_purchase.item.name if db_purchase.item else "Unknown item"
    item_id = db_purchase.item_id

    db.delete(db_purchase)
    db.commit()


    log_action(db, user=admin, action="deleted a logged purchase for",entity_type="Item", entity_name=item_name, entity_id=item_id, details=f"Qty: {db_purchase.quantity}")


    return {"message": "Purchase deleted successfully"}