import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration."""
    # Basic Flask config
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    
    # Cloudinary settings
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', 'dpx7kstwf')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '826333217155912')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', 'YfHEqt_CmEzkYa-uolMnmPhn2u0')
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # AWS S3 settings for file uploads
    AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY')
    AWS_SECRET_KEY = os.environ.get('AWS_SECRET_KEY')
    S3_BUCKET = os.environ.get('S3_BUCKET', 'kenya-alert-now')
    S3_LOCATION = f'https://{S3_BUCKET}.s3.amazonaws.com/'
    
    # Email settings
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', True)
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@kenyaalertnow.com')
    
    # SMS settings (Twilio)
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')
    
    # Security settings
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT', 'your-salt-here')
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_LENGTH_MIN = 8
    SECURITY_TRACKABLE = True
    SECURITY_REGISTERABLE = True
    SECURITY_SEND_REGISTER_EMAIL = True
    SECURITY_RECOVERABLE = True
    SECURITY_CHANGEABLE = True
    
    # Rate limiting
    RATELIMIT_DEFAULT = "100 per day"
    RATELIMIT_STORAGE_URL = "memory://"
    
    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']
    
    # Notification settings
    NOTIFICATION_ENABLED = True
    NOTIFICATION_ASYNC = True
    
    # Logging
    LOG_TO_STDOUT = os.environ.get('LOG_TO_STDOUT', False)
    LOG_TO_FILE = True
    LOG_FILE = 'logs/app.log'
    LOG_LEVEL = 'INFO'
    
    # Cache settings
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300
    
    # Session settings
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = timedelta(days=31)
    
    # CORS settings
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
    ]

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')
    SQLALCHEMY_ECHO = True

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT')
    
    # Production-specific settings
    PREFERRED_URL_SCHEME = 'https'
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_HTTPONLY = True
    
    # Stricter rate limiting
    RATELIMIT_DEFAULT = "50 per day"
    
    # Production logging
    LOG_TO_STDOUT = True
    LOG_TO_FILE = True
    LOG_LEVEL = 'WARNING'
    
    # Production cache
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = os.environ.get('REDIS_URL')
    
    # Production CORS
    CORS_ORIGINS = [
        'https://kenyaalertnow.com',
        'https://api.kenyaalertnow.com'
    ]

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
