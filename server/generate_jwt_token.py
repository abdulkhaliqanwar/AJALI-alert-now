import sys
import os

# Add server directory to sys.path for imports
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from flask_jwt_extended import create_access_token

app = create_app('development')

with app.app_context():
    # Replace 1 with a valid user ID from your database
    token = create_access_token(identity=1)
    print("JWT Token:")
    print(token)
