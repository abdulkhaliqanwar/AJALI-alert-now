import cloudinary
import cloudinary.uploader
from werkzeug.utils import secure_filename
import os

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
    if file and allowed_file(file.filename):
        try:
            # Secure the filename
            filename = secure_filename(file.filename)
            
            # Determine resource type based on file extension
            extension = filename.rsplit('.', 1)[1].lower()
            resource_type = 'video' if extension in ['mp4', 'mov'] else 'image'
            
            # Upload to cloudinary
            result = cloudinary.uploader.upload(
                file,
                resource_type=resource_type,
                folder="ajali_incidents/",  # Organize files in a folder
                use_filename=True,  # Use original filename
                unique_filename=True,  # Ensure filename is unique
                overwrite=False  # Don't overwrite existing files
            )
            
            return {
                'url': result['secure_url'],
                'public_id': result['public_id'],
                'resource_type': result['resource_type']
            }
            
        except Exception as e:
            print(f"Error uploading file to Cloudinary: {str(e)}")
            return None
    
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
