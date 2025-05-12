import pytest
from server import create_app
from server.models import db, User, IncidentReport
from flask_jwt_extended import create_access_token
import io

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers():
    def _auth_headers(user_id):
        access_token = create_access_token(identity=user_id)
        return {'Authorization': f'Bearer {access_token}'}
    return _auth_headers

@pytest.fixture
def test_user(app):
    user = User(
        name='Test User',
        email='test@example.com',
        role='user'
    )
    user.set_password('password123')
    with app.app_context():
        db.session.add(user)
        db.session.commit()
        return user

@pytest.fixture
def test_admin(app):
    admin = User(
        name='Admin User',
        email='admin@example.com',
        role='admin'
    )
    admin.set_password('password123')
    with app.app_context():
        db.session.add(admin)
        db.session.commit()
        return admin

@pytest.fixture
def test_incident(app, test_user):
    incident = IncidentReport(
        title='Test Incident',
        description='Test Description',
        latitude=1.234,
        longitude=2.345,
        user_id=test_user.id,
        status='reported'
    )
    with app.app_context():
        db.session.add(incident)
        db.session.commit()
        return incident

def test_create_incident(client, auth_headers, test_user):
    """Test creating a new incident report"""
    headers = auth_headers(test_user.id)
    data = {
        'title': 'New Incident',
        'description': 'Test Description',
        'latitude': '1.234',
        'longitude': '2.345'
    }
    response = client.post('/api/incidents/', data=data, headers=headers)
    assert response.status_code == 201
    assert response.json['title'] == 'New Incident'

def test_create_incident_with_media(client, auth_headers, test_user):
    """Test creating an incident with media upload"""
    headers = auth_headers(test_user.id)
    data = {
        'title': 'New Incident with Media',
        'description': 'Test Description',
        'latitude': '1.234',
        'longitude': '2.345',
        'media': (io.BytesIO(b'test image content'), 'test.jpg')
    }
    response = client.post('/api/incidents/', data=data, headers=headers, content_type='multipart/form-data')
    assert response.status_code == 201
    assert response.json['title'] == 'New Incident with Media'
    assert response.json['media_url'] is not None

def test_update_incident(client, auth_headers, test_user, test_incident):
    """Test updating an incident report"""
    headers = auth_headers(test_user.id)
    data = {
        'title': 'Updated Incident',
        'description': 'Updated Description'
    }
    response = client.put(f'/api/incidents/{test_incident.id}', data=data, headers=headers)
    assert response.status_code == 200
    assert response.json['title'] == 'Updated Incident'

def test_update_incident_media(client, auth_headers, test_user, test_incident):
    """Test updating incident media"""
    headers = auth_headers(test_user.id)
    data = {
        'media': (io.BytesIO(b'updated image content'), 'updated.jpg')
    }
    response = client.put(
        f'/api/incidents/{test_incident.id}',
        data=data,
        headers=headers,
        content_type='multipart/form-data'
    )
    assert response.status_code == 200
    assert response.json['media_url'] is not None

def test_delete_incident(client, auth_headers, test_user, test_incident):
    """Test deleting an incident report"""
    headers = auth_headers(test_user.id)
    response = client.delete(f'/api/incidents/{test_incident.id}', headers=headers)
    assert response.status_code == 200
    assert response.json['message'] == 'Incident deleted successfully'

def test_update_incident_status(client, auth_headers, test_admin, test_incident):
    """Test updating incident status (admin only)"""
    headers = auth_headers(test_admin.id)
    data = {'status': 'under investigation'}
    response = client.patch(f'/api/incidents/{test_incident.id}/status', json=data, headers=headers)
    assert response.status_code == 200
    assert response.json['status'] == 'under investigation'

def test_unauthorized_status_update(client, auth_headers, test_user, test_incident):
    """Test that non-admin users cannot update incident status"""
    headers = auth_headers(test_user.id)
    data = {'status': 'under investigation'}
    response = client.patch(f'/api/incidents/{test_incident.id}/status', json=data, headers=headers)
    assert response.status_code == 403

def test_get_incidents(client, auth_headers, test_user):
    """Test getting all incidents"""
    headers = auth_headers(test_user.id)
    response = client.get('/api/incidents/', headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_incident_details(client, auth_headers, test_user, test_incident):
    """Test getting incident details"""
    headers = auth_headers(test_user.id)
    response = client.get(f'/api/incidents/{test_incident.id}', headers=headers)
    assert response.status_code == 200
    assert response.json['id'] == test_incident.id

def test_incident_validation(client, auth_headers, test_user):
    """Test incident validation"""
    headers = auth_headers(test_user.id)
    # Test missing required fields
    data = {'title': 'Incomplete Incident'}
    response = client.post('/api/incidents/', data=data, headers=headers)
    assert response.status_code == 400

def test_incident_permissions(client, auth_headers, test_user, test_admin, test_incident):
    """Test incident permissions"""
    # Test that non-owner cannot edit
    headers = auth_headers(test_admin.id)
    data = {'title': 'Unauthorized Update'}
    response = client.put(f'/api/incidents/{test_incident.id}', data=data, headers=headers)
    assert response.status_code == 403

    # Test that admin can edit any incident
    headers = auth_headers(test_admin.id)
    data = {'title': 'Admin Update'}
    response = client.put(f'/api/incidents/{test_incident.id}', data=data, headers=headers)
    assert response.status_code == 200
