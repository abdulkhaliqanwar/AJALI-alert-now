import unittest
import io
from unittest.mock import patch
from server.app import create_app
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

    @patch('server.routes.incident_routes.upload_file_to_s3')
    def test_create_incident(self, mock_upload):
        mock_upload.return_value = 'https://dummyurl.com/test.jpg'

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

        print(response.data)  # Debug output

        self.assertEqual(response.status_code, 201)
        json_data = response.get_json()
        self.assertIn('id', json_data)
        self.assertEqual(json_data['title'], data['title'])
        self.assertEqual(json_data['description'], data['description'])

if __name__ == '__main__':
    unittest.main()
