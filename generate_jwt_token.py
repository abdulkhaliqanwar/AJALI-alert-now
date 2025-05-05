from server.app import create_app
from flask_jwt_extended import create_access_token

app = create_app('development')

with app.app_context():
    # Replace 1 with a valid user ID from your database
    token = create_access_token(identity=1)
    print("JWT Token:")
    print(token)
