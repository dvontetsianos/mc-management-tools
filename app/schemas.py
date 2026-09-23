from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    department_id: int | None = None
    permissions: list[str] = []




class UserOut(BaseModel):
    id: int
    username: str
    role: str
    department: str | None = None
    department_id: int | None = None
    permissions: list[str]

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str
    

class FeedbackCreate(BaseModel):
    type: str
    message: str


class UserPasswordUpdate(BaseModel):
    password: str


class UserDepartmentUpdate(BaseModel):
    department_id: int | None = None


class UserPermissionsUpdate(BaseModel):
    permissions: list[str] = []


class DepartmentCreate(BaseModel):
    name: str


class DepartmentResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class RequestCreate(BaseModel):
    title: str
    description: str
    target_department_id: int

class RequestResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    created_at: datetime
    image_url: str | None = None
    sender_id: int
    sender_department_id: int | None = None
    sender_username: str | None = None
    sender_department: str | None = None
    target_department_id: int
    target_department: str | None = None


class RequestStatusUpdate(BaseModel):
    status: str


class LostFoundItemCreate(BaseModel):
    description: str
    location_found: str | None = None
    found_by: str | None = None
    notes: str | None = None


class LostFoundItemResponse(BaseModel):
    id: int
    description: str
    location_found: str | None = None
    date_found: datetime
    found_by: str
    status: str
    claimed_by: str | None = None
    claimed_date: datetime | None = None
    notes: str | None = None

    class Config:
        from_attributes = True


class LostFoundClaim(BaseModel):
    claimed_by: str



class ItemCreate(BaseModel):
    name: str
    category_id: int
    supplier_id: int | None = None
    cost_per_unit: float | None = None
    opening_quantity: int = 0
    department_id: int | None = None


class ItemUpdate(BaseModel):
    name: str
    category_id: int
    supplier_id: int | None = None
    cost_per_unit: float | None=None
    opening_quantity: int = 0
    department_id: int | None = None


class ItemLocationResponse(BaseModel):
    id: int
    item_id: int
    item_name: str | None = None
    location_id: int
    location: str | None = None
    total_quantity: int
    broken_quantity: int
    staff_counted_quantity: int | None = None
    staff_counted_at: datetime | None = None
    staff_counted_by: str | None = None

    class Config:
        from_attributes = True


class ItemLocationCountSubmit(BaseModel):
    counted_quantity: int


class ItemResponse(BaseModel):
    id: int
    name: str
    category: str | None = None
    category_id: int | None = None
    supplier: str | None = None
    supplier_id: int | None = None
    cost_per_unit: float | None = None
    image_url: str | None = None
    total_quantity: int
    assigned_quantity: int = 0
    broken_quantity: int
    opening_quantity: int = 0
    purchases_this_year: int = 0
    expected_total: int = 0
    broken_missing: int = 0
    staff_counted_quantity: int | None = None
    locations: list[ItemLocationResponse] = []
    department_id: int | None = None
    department: str | None = None

    class Config:
        from_attributes = True


class ItemLocationCreate(BaseModel):
    item_id: int
    location_id: int
    total_quantity: int = 0
    broken_quantity: int = 0


class ItemLocationUpdate(BaseModel):
    total_quantity: int
    broken_quantity: int



class PurchaseCreate(BaseModel):
    item_id: int
    quantity: int
    location_id: int
    unit_cost: float | None = None
    supplier_id: int | None = None
    document_number: str | None = None
    document_date: datetime | None = None
    notes: str | None = None



class PurchaseResponse(BaseModel):
    id: int
    item_id: int | None = None
    item_name: str | None = None
    category_id: int | None = None
    category: str | None = None
    department_id: int | None = None
    department: str | None = None
    quantity: int
    location_id: int | None = None
    location: str | None = None
    unit_cost: float | None = None
    supplier_id: int | None = None
    supplier: str | None = None
    document_number: str | None = None
    document_date: datetime | None = None
    source_file: str | None = None
    notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True



class ItemMovementCreate(BaseModel):
    item_id: int
    from_location_id: int
    to_location_id: int
    quantity: int
    reason: str | None = None


class ItemMovementResponse(BaseModel):
    id: int
    item_id: int | None = None
    item_name: str | None = None
    from_location_id: int | None = None
    from_location: str | None = None
    to_location_id: int
    to_location: str | None = None
    quantity: int
    moved_by: str
    reason: str | None = None
    purchase_id: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True