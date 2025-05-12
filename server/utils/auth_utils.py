from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from ..models import User
import jwt
import os
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

def generate_token(user_id, expires_delta=timedelta(days=1), custom_claims=None):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + expires_delta,
        'iat': datetime.utcnow()
    }
    if custom_claims:
        payload.update(custom_claims)
    token = jwt.encode(payload, os.getenv('JWT_SECRET_KEY'), algorithm='HS256')
    return token

def verify_token(token):
    try:
        payload = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
        if is_token_blacklisted(token):
            raise Exception('Token has been revoked')
        return payload.get('user_id') or payload
    except jwt.ExpiredSignatureError:
        raise Exception('Token has expired')
    except jwt.InvalidTokenError:
        raise Exception('Invalid token')

def hash_password(password):
    if len(password) < 8:
        raise ValueError('Password too weak')
    return generate_password_hash(password)

def verify_password(password, hashed):
    return check_password_hash(hashed, password)

blacklist = set()

def blacklist_token(token):
    blacklist.add(token)

def is_token_blacklisted(token):
    return token in blacklist

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper
