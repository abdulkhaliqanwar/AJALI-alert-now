import pytest
from server.app import app, db
from flask import json

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_create_incident(client):
    # Mock user login and get access token
    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    assert login_response.status_code == 200
    access_token = json.loads(login_response.data)['access_token']
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    data = {
        'title': 'Test Incident',
        'description': 'This is a test incident',
        'latitude': '1.2345',
        'longitude': '2.3456'
    }

    response = client.post('/api/incidents/', data=data, headers=headers)
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert json_data['title'] == 'Test Incident'
    assert json_data['description'] == 'This is a test incident'

def test_get_incidents(client):
    response = client.get('/api/incidents/')
    assert response.status_code == 401  # Unauthorized without token
