from datetime import datetime
from .extensions import db, bcrypt
import json

class UserActivity(db.Model):
    """Model for tracking user activities."""
    __tablename__ = 'user_activities'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'description': self.description,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat()
        }

class User(db.Model):
    """User model for storing user data."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    is_active = db.Column(db.Boolean, default=True)
    phone_number = db.Column(db.String(20))
    email_notifications = db.Column(db.Boolean, default=True)
    sms_notifications = db.Column(db.Boolean, default=True)
    
    # New fields for enhanced features
    two_factor_enabled = db.Column(db.Boolean, default=False)
    two_factor_secret = db.Column(db.String(32))
    last_login = db.Column(db.DateTime)
    failed_login_attempts = db.Column(db.Integer, default=0)
    account_locked_until = db.Column(db.DateTime)
    preferences = db.Column(db.Text, default='{}')
    avatar_url = db.Column(db.String(500))
    dark_mode = db.Column(db.Boolean, default=False)
    language = db.Column(db.String(10), default='en')
    timezone = db.Column(db.String(50), default='UTC')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    incidents = db.relationship(
        'IncidentReport',
        backref='reporter',
        lazy=True,
        foreign_keys='IncidentReport.user_id'
    )
    assigned_incidents = db.relationship(
        'IncidentReport',
        lazy=True,
        foreign_keys='IncidentReport.assigned_to',
        back_populates='assignee'
    )
    activities = db.relationship('UserActivity', backref='user', lazy=True)

    def set_password(self, password):
        """Hash and set the user password."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Check if the provided password matches the hash."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def get_preferences(self):
        """Get user preferences as dictionary."""
        try:
            return json.loads(self.preferences)
        except:
            return {}

    def set_preferences(self, preferences_dict):
        """Set user preferences from dictionary."""
        self.preferences = json.dumps(preferences_dict)

    def to_dict(self):
        """Convert user to dictionary."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'phone_number': self.phone_number,
            'email_notifications': self.email_notifications,
            'sms_notifications': self.sms_notifications,
            'two_factor_enabled': self.two_factor_enabled,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'avatar_url': self.avatar_url,
            'dark_mode': self.dark_mode,
            'language': self.language,
            'timezone': self.timezone,
            'preferences': self.get_preferences(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class IncidentCategory(db.Model):
    """Model for incident categories."""
    __tablename__ = 'incident_categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(50))
    color = db.Column(db.String(7))  # Hex color code
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    incidents = db.relationship('IncidentReport', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'color': self.color,
            'created_at': self.created_at.isoformat()
        }

class IncidentComment(db.Model):
    """Model for incident comments."""
    __tablename__ = 'incident_comments'

    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('incident_reports.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'user_id': self.user_id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class IncidentReport(db.Model):
    """Model for storing incident reports."""
    __tablename__ = 'incident_reports'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='reported')
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    category_id = db.Column(db.Integer, db.ForeignKey('incident_categories.id'))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    media_urls = db.Column(db.Text, default='[]')  # JSON array of media URLs
    address = db.Column(db.String(500))
    affected_area_radius = db.Column(db.Float)  # in meters
    resolution_notes = db.Column(db.Text)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    comments = db.relationship('IncidentComment', backref='incident', lazy=True)
    assignee = db.relationship('User', foreign_keys=[assigned_to], back_populates='assigned_incidents')

    @property
    def location(self):
        """Return location as a dictionary."""
        return {
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address,
            'affected_area_radius': self.affected_area_radius
        }

    def get_media_urls(self):
        """Get media URLs as list."""
        try:
            return json.loads(self.media_urls)
        except:
            return []

    def add_media_url(self, url):
        """Add a media URL to the incident."""
        urls = self.get_media_urls()
        urls.append(url)
        self.media_urls = json.dumps(urls)

    def to_dict(self):
        """Convert incident to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'category': self.category.to_dict() if self.category else None,
            'location': self.location,
            'media_urls': self.get_media_urls(),
            'resolution_notes': self.resolution_notes,
            'assigned_to': self.assigned_to,
            'assignee': self.assignee.username if self.assignee else None,
            'user_id': self.user_id,
            'reporter_username': self.reporter.username if self.reporter else None,
            'reporter_email': self.reporter.email if self.reporter else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
