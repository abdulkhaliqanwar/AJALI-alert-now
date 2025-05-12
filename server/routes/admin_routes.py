from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, IncidentReport, db
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    """Decorator to check if the current user is an admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.route('/incidents/status/<int:incident_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_incident_status(incident_id):
    """Update the status of an incident (admin only)."""
    incident = IncidentReport.query.get_or_404(incident_id)
    data = request.get_json()

    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400

    # Validate status
    valid_statuses = ['reported', 'under investigation', 'resolved', 'rejected']
    if data['status'] not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

    try:
        incident.status = data['status']
        db.session.commit()
        return jsonify(incident.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users (admin only)."""
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat()
    } for user in users]), 200

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
@admin_required
def update_user_role(user_id):
    """Update a user's role (admin only)."""
    data = request.get_json()
    
    if not data or 'role' not in data:
        return jsonify({'error': 'Role is required'}), 400

    # Validate role
    valid_roles = ['user', 'admin']
    if data['role'] not in valid_roles:
        return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400

    user = User.query.get_or_404(user_id)
    
    try:
        user.role = data['role']
        db.session.commit()
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard_stats():
    """Get dashboard statistics (admin only)."""
    try:
        total_incidents = IncidentReport.query.count()
        total_users = User.query.count()
        
        # Get counts by status
        status_counts = db.session.query(
            IncidentReport.status,
            db.func.count(IncidentReport.id)
        ).group_by(IncidentReport.status).all()
        
        status_stats = {status: count for status, count in status_counts}
        
        # Get recent incidents
        recent_incidents = IncidentReport.query.order_by(
            IncidentReport.created_at.desc()
        ).limit(5).all()

        return jsonify({
            'total_incidents': total_incidents,
            'total_users': total_users,
            'status_stats': status_stats,
            'recent_incidents': [incident.to_dict() for incident in recent_incidents]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
