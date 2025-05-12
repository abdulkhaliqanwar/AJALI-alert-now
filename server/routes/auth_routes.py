from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import User, UserActivity, db
from datetime import timedelta, datetime
import pyotp
import requests
from functools import wraps
import re

auth_bp = Blueprint('auth', __name__)

def validate_password(password):
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    return True, "Password is strong"

def log_activity(user_id, activity_type, description, ip_address=None):
    """Log user activity."""
    activity = UserActivity(
        user_id=user_id,
        activity_type=activity_type,
        description=description,
        ip_address=ip_address
    )
    db.session.add(activity)
    db.session.commit()

def admin_required(f):
    """Decorator to check if user is admin."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get_or_404(current_user_id)
        if user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Validate username format
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', data['username']):
        return jsonify({'error': 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'}), 400

    # Validate email format
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', data['email']):
        return jsonify({'error': 'Invalid email format'}), 400

    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    # Validate password strength
    is_valid, message = validate_password(data['password'])
    if not is_valid:
        return jsonify({'error': message}), 400

    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        role=data.get('role', 'user'),
        phone_number=data.get('phone_number'),
        language=data.get('language', 'en'),
        timezone=data.get('timezone', 'UTC')
    )
    user.set_password(data['password'])

    try:
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        
        # Log activity
        log_activity(user.id, 'REGISTER', f'User registered with username {user.username}',
                    request.remote_addr)

        return jsonify({
            'token': access_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return token."""
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    # Check if account is locked
    if user.account_locked_until and user.account_locked_until > datetime.utcnow():
        return jsonify({
            'error': 'Account is temporarily locked',
            'locked_until': user.account_locked_until.isoformat()
        }), 403

    if not user.check_password(data.get('password')):
        # Increment failed login attempts
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        
        # Lock account after 5 failed attempts
        if user.failed_login_attempts >= 5:
            user.account_locked_until = datetime.utcnow() + timedelta(minutes=15)
            db.session.commit()
            return jsonify({
                'error': 'Account locked due to too many failed attempts',
                'locked_until': user.account_locked_until.isoformat()
            }), 403
        
        db.session.commit()
        return jsonify({'error': 'Invalid credentials'}), 401

    # Check 2FA if enabled
    if user.two_factor_enabled:
        if 'two_factor_code' not in data:
            return jsonify({
                'error': 'Two-factor authentication required',
                'requires_2fa': True
            }), 428
        
        totp = pyotp.TOTP(user.two_factor_secret)
        if not totp.verify(data['two_factor_code']):
            return jsonify({'error': 'Invalid 2FA code'}), 401

    # Reset failed login attempts and update last login
    user.failed_login_attempts = 0
    user.last_login = datetime.utcnow()
    db.session.commit()

    # Create access token
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(days=1)
    )

    # Log activity
    log_activity(user.id, 'LOGIN', f'User logged in from IP {request.remote_addr}',
                request.remote_addr)

    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/2fa/enable', methods=['POST'])
@jwt_required()
def enable_2fa():
    """Enable two-factor authentication."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)

    if user.two_factor_enabled:
        return jsonify({'error': '2FA is already enabled'}), 400

    # Generate secret key
    secret = pyotp.random_base32()
    user.two_factor_secret = secret
    user.two_factor_enabled = True
    db.session.commit()

    # Generate QR code URI
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(user.email, issuer_name="KenyaAlertNow")

    log_activity(user.id, 'ENABLE_2FA', '2FA enabled for account', request.remote_addr)

    return jsonify({
        'secret': secret,
        'qr_uri': provisioning_uri
    }), 200

@auth_bp.route('/2fa/disable', methods=['POST'])
@jwt_required()
def disable_2fa():
    """Disable two-factor authentication."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    
    if not user.two_factor_enabled:
        return jsonify({'error': '2FA is not enabled'}), 400

    # Verify current password
    data = request.get_json()
    if not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid password'}), 401

    user.two_factor_enabled = False
    user.two_factor_secret = None
    db.session.commit()

    log_activity(user.id, 'DISABLE_2FA', '2FA disabled for account', request.remote_addr)

    return jsonify({'message': '2FA has been disabled'}), 200

@auth_bp.route('/notification-preferences', methods=['PATCH'])
@jwt_required()
def update_notification_preferences():
    """Update user notification preferences."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    data = request.get_json()

    try:
        if 'email_notifications' in data:
            user.email_notifications = data['email_notifications']
        if 'sms_notifications' in data:
            user.sms_notifications = data['sms_notifications']
        if 'phone_number' in data:
            # Validate phone number format
            if not re.match(r'^\+?1?\d{9,15}$', data['phone_number']):
                return jsonify({'error': 'Invalid phone number format'}), 400
            user.phone_number = data['phone_number']

        db.session.commit()
        log_activity(user.id, 'UPDATE_PREFERENCES', 'Updated notification preferences',
                    request.remote_addr)
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    """Update user profile."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    data = request.get_json()

    try:
        if 'username' in data and data['username'] != user.username:
            if not re.match(r'^[a-zA-Z0-9_]{3,20}$', data['username']):
                return jsonify({'error': 'Invalid username format'}), 400
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Username already exists'}), 400
            user.username = data['username']
            
        if 'email' in data and data['email'] != user.email:
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', data['email']):
                return jsonify({'error': 'Invalid email format'}), 400
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']

        if 'password' in data:
            is_valid, message = validate_password(data['password'])
            if not is_valid:
                return jsonify({'error': message}), 400
            user.set_password(data['password'])

        if 'language' in data:
            user.language = data['language']

        if 'timezone' in data:
            user.timezone = data['timezone']

        if 'dark_mode' in data:
            user.dark_mode = data['dark_mode']

        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']

        if 'preferences' in data:
            user.set_preferences(data['preferences'])

        db.session.commit()
        log_activity(user.id, 'UPDATE_PROFILE', 'Updated user profile', request.remote_addr)
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def list_users():
    """List all users (admin only)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    role = request.args.get('role', '')

    query = User.query

    if search:
        query = query.filter(
            (User.username.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )

    if role:
        query = query.filter(User.role == role)

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'users': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@auth_bp.route('/users/<int:user_id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update_user(user_id):
    """Update user details (admin only)."""
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    current_user_id = get_jwt_identity()

    try:
        if 'role' in data:
            # Prevent self-demotion
            if user_id == current_user_id and data['role'] != 'admin':
                return jsonify({'error': 'Cannot remove your own admin privileges'}), 403
            user.role = data['role']

        if 'is_active' in data:
            # Prevent self-deactivation
            if user_id == current_user_id:
                return jsonify({'error': 'Cannot deactivate your own account'}), 403
            user.is_active = data['is_active']

        db.session.commit()
        log_activity(current_user_id, 'UPDATE_USER',
                    f'Updated user {user.username} (ID: {user.id})',
                    request.remote_addr)
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/activities', methods=['GET'])
@jwt_required()
def get_activities():
    """Get user activities."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    
    # Admin can see all activities, regular users only see their own
    query = UserActivity.query
    if user.role != 'admin':
        query = query.filter_by(user_id=current_user_id)

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagination = query.order_by(UserActivity.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'activities': [activity.to_dict() for activity in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200
