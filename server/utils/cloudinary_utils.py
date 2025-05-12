import cloudinary
import cloudinary.uploader
from werkzeug.utils import secure_filename
import os
from flask import current_app

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

def allowed_file(filename):
    """Check if the file extension is allowed."""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_file(file):
    """
    Upload a file to Cloudinary.
    
    Args:
        file: FileStorage object from request.files
    
    Returns:
        dict: Cloudinary upload response containing URL and other metadata
        None: If upload fails
    """
    if not file or not file.filename:
        print("No file provided")
        return None

    if not allowed_file(file.filename):
        print(f"File type not allowed: {file.filename}")
        return None

    try:
        # Secure the filename
        filename = secure_filename(file.filename)
        
        # Create a temporary file path
        temp_path = os.path.join('/tmp', filename)
        
        try:
            # Save the file temporarily
            file.save(temp_path)
            
            # Determine resource type based on file extension
            extension = filename.rsplit('.', 1)[1].lower()
            resource_type = 'video' if extension in ['mp4', 'mov'] else 'image'
            
            # Upload to cloudinary
            result = cloudinary.uploader.upload(
                temp_path,
                resource_type=resource_type,
                folder="ajali_incidents/",
                use_filename=True,
                unique_filename=True,
                overwrite=False
            )
            
            print(f"Upload successful: {result['secure_url']}")
            return {
                'secure_url': result['secure_url'],
                'public_id': result['public_id'],
                'resource_type': result['resource_type']
            }
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        print(f"Error uploading file to Cloudinary: {str(e)}")
        return None

def delete_file(public_id, resource_type='image'):
    """
    Delete a file from Cloudinary.
    
    Args:
        public_id: Cloudinary public ID of the file
        resource_type: Type of resource ('image' or 'video')
    
    Returns:
        bool: True if deletion was successful, False otherwise
    """
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f"Error deleting file from Cloudinary: {str(e)}")
        return False

def get_file_url(public_id, resource_type='image'):
    """
    Get the URL of a file from Cloudinary.
    
    Args:
        public_id: Cloudinary public ID of the file
        resource_type: Type of resource ('image' or 'video')
    
    Returns:
        str: URL of the file
    """
    try:
        return cloudinary.CloudinaryImage(public_id).build_url()
    except Exception as e:
        print(f"Error getting file URL from Cloudinary: {str(e)}")
        return None
