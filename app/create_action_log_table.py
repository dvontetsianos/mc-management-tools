from .database import Base, engine
from . import models


Base.metadata.create_all(bind=engine)

print("Done - action_logs table created.")