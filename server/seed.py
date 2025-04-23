from app import create_app
from extensions import db
from models import User, IncidentReport
from datetime import datetime, timedelta
import random

def seed_database():
    """Seed the database with initial test data."""
    print("Starting database seeding...")
    
    # Create test users
    admin = User(
        username="admin",
        email="admin@ajali.com",
        role="admin"
    )
    admin.set_password("admin123")

    user1 = User(
        username="john_doe",
        email="john@example.com",
        role="user"
    )
    user1.set_password("user123")

    user2 = User(
        username="jane_doe",
        email="jane@example.com",
        role="user"
    )
    user2.set_password("user123")

    db.session.add_all([admin, user1, user2])
    db.session.commit()
    print("Users created successfully!")

    # Create test incidents
    incidents = [
        {
            "title": "Traffic Accident on Highway",
            "description": "Multiple vehicles involved in accident on main highway",
            "status": "under investigation",
            "latitude": -1.2921,
            "longitude": 36.8219,
            "user_id": user1.id
        },
        {
            "title": "Fire in Residential Building",
            "description": "Fire reported in apartment building, emergency services responding",
            "status": "reported",
            "latitude": -1.2925,
            "longitude": 36.8226,
            "user_id": user2.id
        },
        {
            "title": "Power Line Down",
            "description": "Fallen power line blocking road access",
            "status": "resolved",
            "latitude": -1.2911,
            "longitude": 36.8209,
            "user_id": user1.id
        },
        {
            "title": "Water Main Break",
            "description": "Major water leak affecting several streets",
            "status": "under investigation",
            "latitude": -1.2935,
            "longitude": 36.8229,
            "user_id": user2.id
        }
    ]

    # Add random created_at times within the last week
    now = datetime.utcnow()
    for incident_data in incidents:
        random_days = random.randint(0, 7)
        random_hours = random.randint(0, 23)
        created_at = now - timedelta(days=random_days, hours=random_hours)
        
        incident = IncidentReport(
            title=incident_data["title"],
            description=incident_data["description"],
            status=incident_data["status"],
            latitude=incident_data["latitude"],
            longitude=incident_data["longitude"],
            user_id=incident_data["user_id"],
            created_at=created_at,
            updated_at=created_at
        )
        db.session.add(incident)

    db.session.commit()
    print("Incidents created successfully!")
    print("Database seeding completed!")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        # Seed the database
        seed_database()
