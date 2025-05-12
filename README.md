# Ajali! - Emergency Alert System

Ajali! is a real-time emergency alert system that enables citizens to report accidents and emergencies to appropriate authorities and the general public. The system helps bridge the critical time gap between incident occurrence and first responder action.

## Features

### Core Features
- User authentication and authorization
- Incident report creation, editing, and deletion
- Geolocation support for incident reports
- Image and video upload support
- Interactive Google Maps integration
- Admin dashboard for incident management
- Real-time status updates

### Optional Features
- Email notifications for status changes
- SMS notifications for status changes

## Tech Stack

### Frontend
- React.js
- Redux Toolkit for state management
- Material-UI for components
- Google Maps API integration
- Jest for testing

### Backend
- Python Flask
- PostgreSQL database
- JWT authentication
- Cloudinary for media storage
- Pytest for testing

## Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- PostgreSQL
- Cloudinary account
- Google Maps API key

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize the database:
```bash
flask db upgrade
```

6. Run the development server:
```bash
flask run
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm start
```

## Testing

### Backend Tests
```bash
cd server
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## API Documentation

The API documentation is available at `/api/docs` when running the backend server.

## Contributing

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit them:
```bash
git commit -m "feat: your feature description"
```

3. Push to your branch:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 