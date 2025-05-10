from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, db
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already exists'}), 400

    user = User(
        username=data.get('username'),
        email=data.get('email'),
        role='user'
    )
    user.set_password(data.get('password'))

    try:
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        
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
    identifier = data.get('username') or data.get('email')
    user = User.query.filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

    if user and user.check_password(data.get('password')):
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        return jsonify({
            'token': access_token,
            'user': user.to_dict()
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

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
            user.phone_number = data['phone_number']

        db.session.commit()
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
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Username already exists'}), 400
            user.username = data['username']
            
        if 'email' in data and data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']

        if 'password' in data:
            user.set_password(data['password'])

        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
