from .database import Base, engine
from . import models


Base.metadata.create_all(bind=engine)

print("Done - suppliers table created, assets table now has supplier_id and cost_per_unit.")