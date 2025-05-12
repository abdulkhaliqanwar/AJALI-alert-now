import pytest
from datetime import datetime, timedelta
from server import create_app
from server.models import db, User
from server.utils.auth_utils import (
    generate_token,
    verify_token,
    admin_required,
    hash_password,
    verify_password
)

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def test_user(app):
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
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
        password=hash_password('admin123'),
        role='admin'
    )
    db.session.add(admin)
    db.session.commit()
    return admin

def test_generate_token(test_user):
    token = generate_token(test_user.id)
    assert token is not None
    assert isinstance(token, str)

def test_verify_token(test_user):
    token = generate_token(test_user.id)
    user_id = verify_token(token)
    assert user_id == test_user.id

def test_verify_invalid_token():
    with pytest.raises(Exception):
        verify_token('invalid_token')

def test_verify_expired_token(test_user):
    # Create a token that expires in 1 second
    token = generate_token(test_user.id, expires_delta=timedelta(seconds=1))
    # Wait for 2 seconds
    import time
    time.sleep(2)
    
    with pytest.raises(Exception):
        verify_token(token)

def test_hash_password():
    password = 'testpassword'
    hashed = hash_password(password)
    assert hashed != password
    assert isinstance(hashed, str)

def test_verify_password():
    password = 'testpassword'
    hashed = hash_password(password)
    assert verify_password(password, hashed) is True
    assert verify_password('wrongpassword', hashed) is False

def test_admin_required_decorator(app, test_admin, test_user):
    @admin_required
    def test_route():
        return {'message': 'success'}

    # Test with admin user
    with app.test_request_context(headers={'Authorization': f'Bearer {generate_token(test_admin.id)}'}):
        response = test_route()
        assert response['message'] == 'success'

    # Test with regular user
    with app.test_request_context(headers={'Authorization': f'Bearer {generate_token(test_user.id)}'}):
        with pytest.raises(Exception) as exc_info:
            test_route()
        assert 'Admin access required' in str(exc_info.value)

    # Test without token
    with app.test_request_context():
        with pytest.raises(Exception) as exc_info:
            test_route()
        assert 'Missing token' in str(exc_info.value)

def test_token_with_custom_claims(test_user):
    custom_claims = {'role': 'admin', 'permissions': ['read', 'write']}
    token = generate_token(test_user.id, custom_claims=custom_claims)
    decoded = verify_token(token)
    assert decoded['role'] == 'admin'
    assert decoded['permissions'] == ['read', 'write']

def test_password_strength_validation():
    # Test weak password
    weak_password = '123'
    with pytest.raises(ValueError) as exc_info:
        hash_password(weak_password)
    assert 'Password too weak' in str(exc_info.value)

    # Test strong password
    strong_password = 'StrongP@ssw0rd123'
    hashed = hash_password(strong_password)
    assert verify_password(strong_password, hashed) is True

def test_token_refresh(test_user):
    # Generate initial token
    initial_token = generate_token(test_user.id, expires_delta=timedelta(minutes=5))
    
    # Generate refresh token
    refresh_token = generate_token(test_user.id, expires_delta=timedelta(days=7))
    
    # Verify both tokens
    assert verify_token(initial_token) == test_user.id
    assert verify_token(refresh_token) == test_user.id

def test_token_blacklist(app, test_user):
    token = generate_token(test_user.id)
    
    # Add token to blacklist
    from server.utils.auth_utils import blacklist_token
    blacklist_token(token)
    
    # Verify blacklisted token
    with pytest.raises(Exception) as exc_info:
        verify_token(token)
    assert 'Token has been revoked' in str(exc_info.value)

def test_password_reset_token(test_user):
    # Generate password reset token
    reset_token = generate_token(test_user.id, expires_delta=timedelta(hours=1))
    
    # Verify reset token
    user_id = verify_token(reset_token)
    assert user_id == test_user.id
    
    # Test token expiration
    expired_token = generate_token(test_user.id, expires_delta=timedelta(seconds=1))
    import time
    time.sleep(2)
    with pytest.raises(Exception):
        verify_token(expired_token) 