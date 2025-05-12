from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate
import cloudinary

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
cors = CORS()
mail = Mail()
migrate = Migrate()

def init_extensions(app):
    """Initialize Flask extensions."""
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", ["http://localhost:5173"])}} , supports_credentials=True)
    mail.init_app(app)
    migrate.init_app(app, db)

    # Initialize Cloudinary
    cloudinary.config(
        cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
        api_key=app.config['CLOUDINARY_API_KEY'],
        api_secret=app.config['CLOUDINARY_API_SECRET']
    )

    # JWT configuration
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        if isinstance(user, dict):
            return user.get('id')
        return user

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        from .models import User
        identity = jwt_data["sub"]
        return User.query.filter_by(id=identity).one_or_none()

    return app
