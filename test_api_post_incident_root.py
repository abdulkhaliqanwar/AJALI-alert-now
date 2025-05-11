import unittest
import io
import sys
import os

# Add the server directory to sys.path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'server')))

from app import create_app
from flask_jwt_extended import create_access_token

class IncidentApiTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('default')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

        # Create a test user id and access token
        self.test_user_id = 1
        self.access_token = create_access_token(identity=self.test_user_id)

    def tearDown(self):
        self.app_context.pop()

    def test_create_incident(self):
        data = {
            'title': 'Test Incident',
            'description': 'This is a test incident',
            'latitude': '1.23456',
            'longitude': '2.34567'
        }
        # Create a dummy file to upload
        data['media'] = (io.BytesIO(b"dummy data"), 'test.jpg')

        headers = {
            'Authorization': f'Bearer {self.access_token}'
        }

        response = self.client.post(
            '/api/incidents/',
            data=data,
            headers=headers,
            content_type='multipart/form-data'
        )

        self.assertEqual(response.status_code, 201)
        json_data = response.get_json()
        self.assertIn('id', json_data)
        self.assertEqual(json_data['title'], data['title'])
        self.assertEqual(json_data['description'], data['description'])

if __name__ == '__main__':
    unittest.main()
