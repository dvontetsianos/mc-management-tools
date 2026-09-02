from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Asset(Base):
    __tablename__ = "assets"

    __table_args__ = (
        UniqueConstraint(
            "name",
            "location_id",
            name="unique_asset_per_locations"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category_id = Column(
        Integer,
        ForeignKey("categories.id")
    )
    category = relationship(
        "Category",
        back_populates="assets"
    )
    location_id = Column(Integer, ForeignKey("locations.id"))
    location = relationship("Location", back_populates="assets")
    total_quantity = Column(Integer, default=0)
    broken_quantity = Column(Integer, default=0)
    image_url = Column(String, nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    supplier = relationship("Supplier", back_populates="assets")
    cost_per_unit = Column(Float, nullable=True)

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    assets = relationship("Asset", back_populates="location")
    item_locations = relationship("ItemLocation", back_populates="location")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    assets = relationship(
        "Asset",
        back_populates="category"
    )

    items = relationship(
        "Item",
        back_populates="category"
    )


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    assets = relationship(
        "Asset",
        back_populates="supplier"
    )

    items = relationship(
        "Item",
        back_populates="supplier"
    )

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    users = relationship(
        "User",
        back_populates="department"
    )

    requests_received = relationship(
        "Request",
        foreign_keys="Request.target_department_id",
        back_populates="target_department"
    )

    requests_sent = relationship(
        "Request",
        foreign_keys="Request.sender_department_id",
        back_populates="sender_department"
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user")
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = relationship("Department", back_populates="users")
    permissions = relationship(
        "UserPermission",
        back_populates="user"
    )


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    user_permissions = relationship(
        "UserPermission",
        back_populates="permission"
    )


class UserPermission(Base):
    __tablename__ = "user_permissions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    permission_id = Column(Integer, ForeignKey("permissions.id"))
    user = relationship(
        "User",
        back_populates="permissions"
    )
    permission = relationship(
        "Permission",
        back_populates="user_permissions"
    )



class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    image_url = Column(String, nullable=True)

    sender_id = Column(Integer, ForeignKey("users.id"))
    sender = relationship("User")

    sender_department_id = Column(Integer, ForeignKey("departments.id"))
    sender_department = relationship(
        "Department",
        foreign_keys=[sender_department_id],
        back_populates="requests_sent"
    )

    target_department_id = Column(Integer, ForeignKey("departments.id"))
    target_department = relationship(
        "Department",
        foreign_keys=[target_department_id],
        back_populates="requests_received"
    )


class ActionsLog(Base):
    __tablename__ = "actions_logs"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    action = Column(String)
    entity_type = Column(String)
    entity_name = Column(String)
    entity_id = Column(Integer, nullable=True)
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class LostFoundItem(Base):
    __tablename__ = "lost_found_items"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    location_found = Column(String, nullable=True)
    date_found = Column(DateTime, default=datetime.utcnow)
    found_by = Column(String)
    status = Column(String, default="unclaimed")
    claimed_by = Column(String, nullable=True)
    claimed_date = Column(DateTime, nullable=True)
    notes = Column(String, nullable=True)


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="items")
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    supplier = relationship("Supplier", back_populates="items")
    cost_per_unit = Column(Float, nullable=True)
    image_url = Column(String, nullable=True)

    locations = relationship("ItemLocation", back_populates="item")



class ItemLocation(Base):
    __tablename__ = "item_locations"

    __table_args__ = (
        UniqueConstraint(
            "item_id",
            "location_id",
            name="unique_item_per_location"
        ),
    )


    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    item = relationship("Item", back_populates="locations")
    location_id = Column(Integer, ForeignKey("locations.id"))
    location = relationship("Location", back_populates="item_locations")
    total_quantity = Column(Integer, default=0)
    broken_quantity = Column(Integer, default=0)