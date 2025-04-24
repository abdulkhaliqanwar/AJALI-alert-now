from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import IncidentReport, User, db
from utils.cloudinary_utils import upload_file
from datetime import datetime

incident_bp = Blueprint('incidents', __name__)

@incident_bp.route('/', methods=['POST'])
@jwt_required()
def create_incident():
    """Create a new incident report."""
    current_user_id = get_jwt_identity()
    data = request.form.to_dict()
    
    # Validate required fields
    required_fields = ['title', 'description', 'latitude', 'longitude']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Handle media upload if present
        media_url = None
        if 'media' in request.files:
            media_file = request.files['media']
            upload_result = upload_file(media_file)
            media_url = upload_result.get('url')

        incident = IncidentReport(
            title=data['title'],
            description=data['description'],
            latitude=float(data['latitude']),
            longitude=float(data['longitude']),
            media_url=media_url,
            user_id=current_user_id,
            status='reported'
        )

        db.session.add(incident)
        db.session.commit()

        return jsonify(incident.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incident_bp.route('/', methods=['GET'])
@jwt_required()
def get_incidents():
    """Get all incidents or filter by status with pagination."""
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    query = IncidentReport.query

    if status:
        query = query.filter(IncidentReport.status == status)

    pagination = query.order_by(IncidentReport.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    incidents = pagination.items

    return jsonify({
        'incidents': [incident.to_dict() for incident in incidents],
        'total': pagination.total,
        'page': pagination.page,
        'per_page': pagination.per_page,
        'pages': pagination.pages
    }), 200

@incident_bp.route('/<int:incident_id>', methods=['GET'])
@jwt_required()
def get_incident(incident_id):
    """Get a specific incident."""
    incident = IncidentReport.query.get_or_404(incident_id)
    return jsonify(incident.to_dict()), 200

@incident_bp.route('/<int:incident_id>', methods=['PUT'])
@jwt_required()
def update_incident(incident_id):
    """Update an incident report."""
    current_user_id = get_jwt_identity()
    incident = IncidentReport.query.get_or_404(incident_id)
    
    # Only allow updates by the creator or admin
    user = User.query.get(current_user_id)
    if incident.user_id != current_user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.form.to_dict()
    
    try:
        # Update fields if provided
        if 'title' in data:
            incident.title = data['title']
        if 'description' in data:
            incident.description = data['description']
        if 'latitude' in data:
            incident.latitude = float(data['latitude'])
        if 'longitude' in data:
            incident.longitude = float(data['longitude'])

        # Handle new media upload if present
        if 'media' in request.files:
            media_file = request.files['media']
            upload_result = upload_file(media_file)
            incident.media_url = upload_result.get('url')

        incident.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(incident.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incident_bp.route('/<int:incident_id>', methods=['DELETE'])
@jwt_required()
def delete_incident(incident_id):
    """Delete an incident report."""
    current_user_id = get_jwt_identity()
    incident = IncidentReport.query.get_or_404(incident_id)
    
    # Only allow deletion by the creator or admin
    user = User.query.get(current_user_id)
    if incident.user_id != current_user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        db.session.delete(incident)
        db.session.commit()
        return jsonify({'message': 'Incident deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incident_bp.route('/user/incidents', methods=['GET'])
@jwt_required()
def get_user_incidents():
    """Get all incidents reported by the current user."""
    current_user_id = get_jwt_identity()
    incidents = IncidentReport.query.filter_by(user_id=current_user_id)\
        .order_by(IncidentReport.created_at.desc()).all()
    return jsonify([incident.to_dict() for incident in incidents]), 200
