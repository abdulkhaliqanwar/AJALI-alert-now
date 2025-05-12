from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, db
from utils.auth_utils import admin_required

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users (admin only)."""
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>/role', methods=['PATCH'])
@jwt_required()
@admin_required
def update_user_role(user_id):
    """Update a user's role (admin only)."""
    try:
        user = User.query.get_or_404(user_id)
        new_role = request.json.get('role')

        if new_role not in ['user', 'admin']:
            return jsonify({'error': 'Invalid role'}), 400

        user.role = new_role
        db.session.commit()

        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete a user (admin only)."""
    try:
        user = User.query.get_or_404(user_id)
        
        # Prevent self-deletion
        current_user_id = get_jwt_identity()
        if user.id == current_user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400

        db.session.delete(user)
        db.session.commit()

        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>/status', methods=['PATCH'])
@jwt_required()
@admin_required
def update_user_status(user_id):
    """Update a user's active status (admin only)."""
    try:
        user = User.query.get_or_404(user_id)
        is_active = request.json.get('is_active')

        if not isinstance(is_active, bool):
            return jsonify({'error': 'Invalid status value'}), 400

        # Prevent self-deactivation
        current_user_id = get_jwt_identity()
        if user.id == current_user_id:
            return jsonify({'error': 'Cannot deactivate your own account'}), 400

        user.is_active = is_active
        db.session.commit()

        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 