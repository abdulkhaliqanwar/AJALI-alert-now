import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from config import config
from extensions import init_extensions
from routes.auth_routes import auth_bp
from routes.incident_routes import incident_bp
from routes.admin_routes import admin_bp

# Load environment variables from .env file
load_dotenv()

def create_app(config_name=None):
    """Application factory function."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')

    app = Flask(__name__)
    # Disable automatic trailing slash behavior
    app.url_map.strict_slashes = False
    app.config.from_object(config[config_name])

    # Initialize extensions
    init_extensions(app)

    # Enable CORS for all routes (relaxed for testing)
    CORS(app, 
         resources={r"/api/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"])

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(incident_bp, url_prefix='/api/incidents')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/')
    def index():
        return "Ajali! API is running"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run()
