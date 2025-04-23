from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User

def admin_required(fn):
    """Decorator to check if the current user is an admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        return fn(*args, **kwargs)
    return wrapper

def get_current_user():
    """Helper function to get the current authenticated user."""
    current_user_id = get_jwt_identity()
    return User.query.get(current_user_id)

def user_exists(user_id):
    """Helper function to check if a user exists."""
    return User.query.get(user_id) is not None
