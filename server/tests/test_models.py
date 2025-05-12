import pytest
from datetime import datetime
from server import create_app
from server.models import db, User, IncidentReport
from server.utils.auth_utils import hash_password

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

def test_create_user(app):
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    assert user.id is not None
    assert user.username == 'testuser'
    assert user.email == 'test@example.com'
    assert user.role == 'user'
    assert user.is_active is True
    assert user.created_at is not None
    assert user.updated_at is not None

def test_create_incident(app):
    # Create a user first
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    # Create an incident
    incident = IncidentReport(
        title='Test Incident',
        description='Test Description',
        location='Test Location',
        status='reported',
        user_id=user.id,
        media_url='https://example.com/image.jpg'
    )
    db.session.add(incident)
    db.session.commit()

    assert incident.id is not None
    assert incident.title == 'Test Incident'
    assert incident.description == 'Test Description'
    assert incident.location == 'Test Location'
    assert incident.status == 'reported'
    assert incident.user_id == user.id
    assert incident.media_url == 'https://example.com/image.jpg'
    assert incident.created_at is not None
    assert incident.updated_at is not None

def test_user_incident_relationship(app):
    # Create a user
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    # Create incidents for the user
    incident1 = IncidentReport(
        title='Incident 1',
        description='Description 1',
        location='Location 1',
        status='reported',
        user_id=user.id
    )
    incident2 = IncidentReport(
        title='Incident 2',
        description='Description 2',
        location='Location 2',
        status='under_investigation',
        user_id=user.id
    )
    db.session.add_all([incident1, incident2])
    db.session.commit()

    # Test relationship
    assert len(user.incidents) == 2
    assert user.incidents[0].title == 'Incident 1'
    assert user.incidents[1].title == 'Incident 2'

def test_user_validation(app):
    # Test username validation
    with pytest.raises(ValueError):
        User(
            username='',  # Empty username
            email='test@example.com',
            password=hash_password('password123'),
            role='user'
        )

    # Test email validation
    with pytest.raises(ValueError):
        User(
            username='testuser',
            email='invalid-email',  # Invalid email
            password=hash_password('password123'),
            role='user'
        )

    # Test role validation
    with pytest.raises(ValueError):
        User(
            username='testuser',
            email='test@example.com',
            password=hash_password('password123'),
            role='invalid_role'  # Invalid role
        )

def test_incident_validation(app):
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    # Test title validation
    with pytest.raises(ValueError):
        IncidentReport(
            title='',  # Empty title
            description='Test Description',
            location='Test Location',
            status='reported',
            user_id=user.id
        )

    # Test status validation
    with pytest.raises(ValueError):
        IncidentReport(
            title='Test Incident',
            description='Test Description',
            location='Test Location',
            status='invalid_status',  # Invalid status
            user_id=user.id
        )

def test_user_update(app):
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    # Update user
    user.username = 'updateduser'
    user.email = 'updated@example.com'
    user.role = 'admin'
    db.session.commit()

    updated_user = User.query.get(user.id)
    assert updated_user.username == 'updateduser'
    assert updated_user.email == 'updated@example.com'
    assert updated_user.role == 'admin'

def test_incident_update(app):
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    incident = IncidentReport(
        title='Test Incident',
        description='Test Description',
        location='Test Location',
        status='reported',
        user_id=user.id
    )
    db.session.add(incident)
    db.session.commit()

    # Update incident
    incident.title = 'Updated Incident'
    incident.description = 'Updated Description'
    incident.status = 'under_investigation'
    db.session.commit()

    updated_incident = IncidentReport.query.get(incident.id)
    assert updated_incident.title == 'Updated Incident'
    assert updated_incident.description == 'Updated Description'
    assert updated_incident.status == 'under_investigation'

def test_user_deletion(app):
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    user_id = user.id
    db.session.delete(user)
    db.session.commit()

    assert User.query.get(user_id) is None

def test_incident_deletion(app):
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    incident = IncidentReport(
        title='Test Incident',
        description='Test Description',
        location='Test Location',
        status='reported',
        user_id=user.id
    )
    db.session.add(incident)
    db.session.commit()

    incident_id = incident.id
    db.session.delete(incident)
    db.session.commit()

    assert IncidentReport.query.get(incident_id) is None

def test_cascade_delete(app):
    user = User(
        username='testuser',
        email='test@example.com',
        password=hash_password('password123'),
        role='user'
    )
    db.session.add(user)
    db.session.commit()

    incident = IncidentReport(
        title='Test Incident',
        description='Test Description',
        location='Test Location',
        status='reported',
        user_id=user.id
    )
    db.session.add(incident)
    db.session.commit()

    incident_id = incident.id
    db.session.delete(user)
    db.session.commit()

    assert User.query.get(user.id) is None
    assert IncidentReport.query.get(incident_id) is None 