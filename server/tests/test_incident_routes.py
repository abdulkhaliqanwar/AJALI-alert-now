import pytest
from datetime import datetime
from server import create_app
from server.models import db, User, IncidentReport
from server.utils.auth_utils import generate_token

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
        token = generate_token(user_id)
        return {'Authorization': f'Bearer {token}'}
    return _auth_headers

@pytest.fixture
def test_user(app):
    user = User(
        username='testuser',
        email='test@example.com',
        password='password123',
        role='user'
    )
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def test_admin(app):
    admin = User(
        username='admin',
        email='admin@example.com',
        password='admin123',
        role='admin'
    )
    db.session.add(admin)
    db.session.commit()
    return admin

@pytest.fixture
def test_incident(app, test_user):
    incident = IncidentReport(
        title='Test Incident',
        description='Test Description',
        location='Test Location',
        status='reported',
        user_id=test_user.id,
        created_at=datetime.utcnow()
    )
    db.session.add(incident)
    db.session.commit()
    return incident

def test_create_incident(client, auth_headers, test_user):
    headers = auth_headers(test_user.id)
    data = {
        'title': 'New Incident',
        'description': 'New Description',
        'location': 'New Location'
    }
    
    response = client.post('/api/incidents', json=data, headers=headers)
    assert response.status_code == 201
    assert response.json['title'] == 'New Incident'
    assert response.json['status'] == 'reported'

def test_create_incident_with_media(client, auth_headers, test_user):
    headers = auth_headers(test_user.id)
    data = {
        'title': 'New Incident',
        'description': 'New Description',
        'location': 'New Location',
        'media': (open('test.jpg', 'rb'), 'test.jpg')
    }
    
    response = client.post('/api/incidents', data=data, headers=headers)
    assert response.status_code == 201
    assert response.json['media_url'] is not None

def test_update_incident(client, auth_headers, test_user, test_incident):
    headers = auth_headers(test_user.id)
    data = {
        'title': 'Updated Incident',
        'description': 'Updated Description'
    }
    
    response = client.patch(f'/api/incidents/{test_incident.id}', json=data, headers=headers)
    assert response.status_code == 200
    assert response.json['title'] == 'Updated Incident'
    assert response.json['description'] == 'Updated Description'

def test_delete_incident(client, auth_headers, test_user, test_incident):
    headers = auth_headers(test_user.id)
    
    response = client.delete(f'/api/incidents/{test_incident.id}', headers=headers)
    assert response.status_code == 200
    assert response.json['message'] == 'Incident deleted successfully'

def test_update_incident_status(client, auth_headers, test_admin, test_incident):
    headers = auth_headers(test_admin.id)
    data = {'status': 'under_investigation'}
    
    response = client.patch(f'/api/incidents/{test_incident.id}/status', json=data, headers=headers)
    assert response.status_code == 200
    assert response.json['status'] == 'under_investigation'

def test_get_incidents(client, auth_headers, test_user, test_incident):
    headers = auth_headers(test_user.id)
    
    response = client.get('/api/incidents', headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]['title'] == 'Test Incident'

def test_incident_validation(client, auth_headers, test_user):
    headers = auth_headers(test_user.id)
    data = {
        'title': '',  # Empty title
        'description': 'Test Description',
        'location': 'Test Location'
    }
    
    response = client.post('/api/incidents', json=data, headers=headers)
    assert response.status_code == 400
    assert 'title' in response.json['errors']

def test_unauthorized_access(client, test_incident):
    # Test without auth headers
    response = client.get(f'/api/incidents/{test_incident.id}')
    assert response.status_code == 401

def test_wrong_user_access(client, auth_headers, test_user, test_incident):
    # Create another user
    other_user = User(
        username='otheruser',
        email='other@example.com',
        password='password123',
        role='user'
    )
    db.session.add(other_user)
    db.session.commit()
    
    headers = auth_headers(other_user.id)
    response = client.patch(f'/api/incidents/{test_incident.id}', json={'title': 'New Title'}, headers=headers)
    assert response.status_code == 403

def test_admin_access_all_incidents(client, auth_headers, test_admin, test_incident):
    headers = auth_headers(test_admin.id)
    
    response = client.get('/api/incidents', headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]['title'] == 'Test Incident'

def test_incident_not_found(client, auth_headers, test_user):
    headers = auth_headers(test_user.id)
    
    response = client.get('/api/incidents/999', headers=headers)
    assert response.status_code == 404 