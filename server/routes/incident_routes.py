from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import (
    User, IncidentReport, IncidentCategory, IncidentComment,
    UserActivity, db
)
from ..utils.cloudinary_utils import upload_file, delete_file
from ..utils.notification_utils import notify_status_change
from datetime import datetime
from sqlalchemy import or_, and_
import json
from werkzeug.utils import secure_filename
import os
import boto3
from botocore.exceptions import ClientError
from .auth_routes import admin_required, log_activity

incident_bp = Blueprint('incident', __name__)

def allowed_file(filename):
    """Check if file type is allowed."""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Removed S3 upload function since we will use Cloudinary instead

@incident_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Get all incident categories."""
    categories = IncidentCategory.query.all()
    return jsonify([category.to_dict() for category in categories]), 200

@incident_bp.route('/categories', methods=['POST'])
@jwt_required()
@admin_required
def create_category():
    """Create a new incident category (admin only)."""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Category name is required'}), 400

    category = IncidentCategory(
        name=data['name'],
        description=data.get('description'),
        icon=data.get('icon'),
        color=data.get('color', '#000000')
    )

    try:
        db.session.add(category)
        db.session.commit()
        return jsonify(category.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

from ..utils.cloudinary_utils import upload_file

@incident_bp.route('/', methods=['POST'])
@jwt_required()
def create_incident():
    """Create a new incident report."""
    current_user_id = get_jwt_identity()
    
    # Handle form data for file uploads
    data = request.form.to_dict()
    files = request.files.getlist('media')
    
    required_fields = ['title', 'description', 'latitude', 'longitude']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    try:
        incident = IncidentReport(
            title=data['title'],
            description=data['description'],
            latitude=float(data['latitude']),
            longitude=float(data['longitude']),
            status='reported',
            priority=data.get('priority', 'medium'),
            category_id=data.get('category_id'),
            address=data.get('address'),
            affected_area_radius=float(data.get('affected_area_radius', 0)),
            user_id=current_user_id
        )

        # Handle file uploads using Cloudinary
        if files:
            media_urls = []
            for file in files:
                if file and allowed_file(file.filename):
                    file_url = upload_file(file)
                    if file_url:
                        media_urls.append(file_url)
            
            if media_urls:
                incident.media_urls = json.dumps(media_urls)

        db.session.add(incident)
        db.session.commit()

        # Log activity
        log_activity(current_user_id, 'CREATE_INCIDENT',
                    f'Created incident report: {incident.title}',
                    request.remote_addr)

        return jsonify(incident.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incident_bp.route('/', methods=['GET'])
@jwt_required()
def get_incidents():
    """Get all incidents with filtering and pagination."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')
    priority = request.args.get('priority')
    category_id = request.args.get('category_id')
    search = request.args.get('search', '')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Validate and parse start_date and end_date
    from datetime import datetime
    def parse_date(date_str):
        try:
            return datetime.strptime(date_str, '%Y-%m-%d')
        except Exception:
            return None

    start_date_parsed = parse_date(start_date) if start_date else None
    end_date_parsed = parse_date(end_date) if end_date else None

    if start_date and not start_date_parsed:
        current_app.logger.warning(f"Invalid start_date format: {start_date} from user {current_user_id}")
        return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}), 400
    if end_date and not end_date_parsed:
        current_app.logger.warning(f"Invalid end_date format: {end_date} from user {current_user_id}")
        return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD.'}), 400
    
    # Base query
    query = IncidentReport.query

    # Apply filters
    if status:
        query = query.filter(IncidentReport.status == status)
    if priority:
        query = query.filter(IncidentReport.priority == priority)
    if category_id:
        query = query.filter(IncidentReport.category_id == category_id)
    if search:
        query = query.filter(
            or_(
                IncidentReport.title.ilike(f'%{search}%'),
                IncidentReport.description.ilike(f'%{search}%')
            )
        )
    if start_date_parsed:
        query = query.filter(IncidentReport.created_at >= start_date_parsed)
    if end_date_parsed:
        query = query.filter(IncidentReport.created_at <= end_date_parsed)

    # Regular users can only see their own incidents
    if user.role != 'admin':
        query = query.filter(IncidentReport.user_id == current_user_id)

    # Order by created_at descending
    query = query.order_by(IncidentReport.created_at.desc())

    # Paginate results
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'incidents': [incident.to_dict() for incident in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@incident_bp.route('/<int:incident_id>', methods=['GET'])
@jwt_required()
def get_incident(incident_id):
    """Get a specific incident."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    incident = IncidentReport.query.get_or_404(incident_id)

    # Check if user has access to this incident
    if user.role != 'admin' and incident.user_id != current_user_id:
        return jsonify({'error': 'Access denied'}), 403

    return jsonify(incident.to_dict()), 200

from ..utils.cloudinary_utils import upload_file

@incident_bp.route('/<int:incident_id>', methods=['PATCH'])
@jwt_required()
def update_incident(incident_id):
    """Update an incident."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    incident = IncidentReport.query.get_or_404(incident_id)

    # Only admin or the creator can update the incident
    if user.role != 'admin' and incident.user_id != current_user_id:
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    files = request.files.getlist('media')

    try:
        # Regular users can only update title and description
        if user.role != 'admin':
            allowed_fields = ['title', 'description']
            for field in data:
                if field not in allowed_fields:
                    return jsonify({'error': f'Cannot update {field}'}), 403

        # Update allowed fields
        for field in ['title', 'description', 'priority', 'category_id',
                     'address', 'affected_area_radius']:
            if field in data:
                setattr(incident, field, data[field])

        # Admin-only fields
        if user.role == 'admin':
            if 'status' in data:
                incident.status = data['status']
                if data['status'] == 'resolved':
                    incident.resolved_at = datetime.utcnow()
            if 'assigned_to' in data:
                incident.assigned_to = data['assigned_to']
            if 'resolution_notes' in data:
                incident.resolution_notes = data['resolution_notes']

        # Handle new file uploads using Cloudinary
        if files:
            media_urls = incident.get_media_urls()
            for file in files:
                if file and allowed_file(file.filename):
                    file_url = upload_file(file)
                    if file_url:
                        media_urls.append(file_url)
            incident.media_urls = json.dumps(media_urls)

        db.session.commit()

        # Log activity
        log_activity(current_user_id, 'UPDATE_INCIDENT',
                    f'Updated incident report: {incident.title}',
                    request.remote_addr)

        return jsonify(incident.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incident_bp.route('/<int:incident_id>/status', methods=['PATCH'])
@jwt_required()
@admin_required
def update_incident_status(incident_id):
    """Update incident status (admin only)."""
    incident = IncidentReport.query.get_or_404(incident_id)
    data = request.get_json()

    if 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400

    try:
        incident.status = data['status']
        if data['status'] == 'resolved':
            incident.resolved_at = datetime.utcnow()
        
        if 'resolution_notes' in data:
            incident.resolution_notes = data['resolution_notes']

        db.session.commit()

        # Log activity
        current_user_id = get_jwt_identity()
        log_activity(current_user_id, 'UPDATE_INCIDENT_STATUS',
                    f'Updated incident status to {data["status"]}: {incident.title}',
                    request.remote_addr)

        return jsonify(incident.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incident_bp.route('/<int:incident_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(incident_id):
    """Add a comment to an incident."""
    current_user_id = get_jwt_identity()
    incident = IncidentReport.query.get_or_404(incident_id)
    data = request.get_json()

    if not data.get('content'):
        return jsonify({'error': 'Comment content is required'}), 400

    try:
        comment = IncidentComment(
            incident_id=incident_id,
            user_id=current_user_id,
            content=data['content']
        )
        db.session.add(comment)
        db.session.commit()

        # Log activity
        log_activity(current_user_id, 'ADD_COMMENT',
                    f'Added comment to incident: {incident.title}',
                    request.remote_addr)

        return jsonify(comment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incident_bp.route('/<int:incident_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(incident_id):
    """Get all comments for an incident."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    incident = IncidentReport.query.get_or_404(incident_id)

    # Check if user has access to this incident
    if user.role != 'admin' and incident.user_id != current_user_id:
        return jsonify({'error': 'Access denied'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    pagination = IncidentComment.query.filter_by(incident_id=incident_id)\
        .order_by(IncidentComment.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'comments': [comment.to_dict() for comment in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@incident_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get incident statistics."""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)

    # Base query
    query = IncidentReport.query

    # Regular users only see their stats
    if user.role != 'admin':
        query = query.filter(IncidentReport.user_id == current_user_id)

    # Total incidents
    total_incidents = query.count()

    # Incidents by status
    status_counts = db.session.query(
        IncidentReport.status,
        db.func.count(IncidentReport.id)
    ).filter(
        IncidentReport.user_id == current_user_id if user.role != 'admin' else True
    ).group_by(IncidentReport.status).all()

    # Incidents by priority
    priority_counts = db.session.query(
        IncidentReport.priority,
        db.func.count(IncidentReport.id)
    ).filter(
        IncidentReport.user_id == current_user_id if user.role != 'admin' else True
    ).group_by(IncidentReport.priority).all()

    # Incidents by category
    category_counts = db.session.query(
        IncidentCategory.name,
        db.func.count(IncidentReport.id)
    ).join(
        IncidentReport,
        IncidentReport.category_id == IncidentCategory.id
    ).filter(
        IncidentReport.user_id == current_user_id if user.role != 'admin' else True
    ).group_by(IncidentCategory.name).all()

    # Recent incidents
    recent_incidents = query.order_by(
        IncidentReport.created_at.desc()
    ).limit(5).all()

    return jsonify({
        'total_incidents': total_incidents,
        'status_counts': dict(status_counts),
        'priority_counts': dict(priority_counts),
        'category_counts': dict(category_counts),
        'recent_incidents': [incident.to_dict() for incident in recent_incidents]
    }), 200

@incident_bp.route('/batch/status', methods=['PATCH'])
@jwt_required()
@admin_required
def batch_update_status():
    """Batch update incident statuses (admin only)."""
    data = request.get_json()
    
    if not data.get('incident_ids') or not data.get('status'):
        return jsonify({'error': 'Incident IDs and status are required'}), 400

    try:
        incidents = IncidentReport.query.filter(
            IncidentReport.id.in_(data['incident_ids'])
        ).all()

        for incident in incidents:
            incident.status = data['status']
            if data['status'] == 'resolved':
                incident.resolved_at = datetime.utcnow()
            if data.get('resolution_notes'):
                incident.resolution_notes = data['resolution_notes']

        db.session.commit()

        # Log activity
        current_user_id = get_jwt_identity()
        log_activity(current_user_id, 'BATCH_UPDATE_STATUS',
                    f'Batch updated {len(incidents)} incidents to status: {data["status"]}',
                    request.remote_addr)

        return jsonify({
            'message': f'Successfully updated {len(incidents)} incidents',
            'incidents': [incident.to_dict() for incident in incidents]
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
