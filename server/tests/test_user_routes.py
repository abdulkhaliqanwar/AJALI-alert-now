import pytest
from server import create_app
from server.models import db, User
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

def test_register_user(client):
    data = {
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'password123'
    }
    
    response = client.post('/api/auth/register', json=data)
    assert response.status_code == 201
    assert response.json['username'] == 'newuser'
    assert response.json['email'] == 'new@example.com'
    assert 'password' not in response.json

def test_login_user(client, test_user):
    data = {
        'email': 'test@example.com',
        'password': 'password123'
    }
    
    response = client.post('/api/auth/login', json=data)
    assert response.status_code == 200
    assert 'token' in response.json
    assert response.json['user']['email'] == 'test@example.com'

def test_get_users(client, auth_headers, test_admin):
    headers = auth_headers(test_admin.id)
    
    response = client.get('/api/users', headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 1  # Only admin user
    assert response.json[0]['email'] == 'admin@example.com'

def test_update_user_role(client, auth_headers, test_admin, test_user):
    headers = auth_headers(test_admin.id)
    data = {'role': 'admin'}
    
    response = client.patch(f'/api/users/{test_user.id}/role', json=data, headers=headers)
    assert response.status_code == 200
    assert response.json['role'] == 'admin'

def test_delete_user(client, auth_headers, test_admin, test_user):
    headers = auth_headers(test_admin.id)
    
    response = client.delete(f'/api/users/{test_user.id}', headers=headers)
    assert response.status_code == 200
    assert response.json['message'] == 'User deleted successfully'

def test_update_user_status(client, auth_headers, test_admin, test_user):
    headers = auth_headers(test_admin.id)
    data = {'is_active': False}
    
    response = client.patch(f'/api/users/{test_user.id}/status', json=data, headers=headers)
    assert response.status_code == 200
    assert response.json['is_active'] is False

def test_register_validation(client):
    data = {
        'username': '',  # Empty username
        'email': 'invalid-email',
        'password': '123'  # Too short
    }
    
    response = client.post('/api/auth/register', json=data)
    assert response.status_code == 400
    assert 'username' in response.json['errors']
    assert 'email' in response.json['errors']
    assert 'password' in response.json['errors']

def test_login_validation(client):
    data = {
        'email': 'test@example.com',
        'password': 'wrongpassword'
    }
    
    response = client.post('/api/auth/login', json=data)
    assert response.status_code == 401
    assert 'Invalid credentials' in response.json['message']

def test_unauthorized_user_access(client, auth_headers, test_user):
    headers = auth_headers(test_user.id)
    
    response = client.get('/api/users', headers=headers)
    assert response.status_code == 403

def test_self_role_update_prevention(client, auth_headers, test_admin):
    headers = auth_headers(test_admin.id)
    data = {'role': 'user'}
    
    response = client.patch(f'/api/users/{test_admin.id}/role', json=data, headers=headers)
    assert response.status_code == 400
    assert 'Cannot update your own role' in response.json['message']

def test_self_deletion_prevention(client, auth_headers, test_admin):
    headers = auth_headers(test_admin.id)
    
    response = client.delete(f'/api/users/{test_admin.id}', headers=headers)
    assert response.status_code == 400
    assert 'Cannot delete your own account' in response.json['message']

def test_user_not_found(client, auth_headers, test_admin):
    headers = auth_headers(test_admin.id)
    
    response = client.get('/api/users/999', headers=headers)
    assert response.status_code == 404

def test_duplicate_email_registration(client, test_user):
    data = {
        'username': 'anotheruser',
        'email': 'test@example.com',  # Same email as test_user
        'password': 'password123'
    }
    
    response = client.post('/api/auth/register', json=data)
    assert response.status_code == 400
    assert 'Email already registered' in response.json['message']

def test_duplicate_username_registration(client, test_user):
    data = {
        'username': 'testuser',  # Same username as test_user
        'email': 'another@example.com',
        'password': 'password123'
    }
    
    response = client.post('/api/auth/register', json=data)
    assert response.status_code == 400
    assert 'Username already taken' in response.json['message'] 