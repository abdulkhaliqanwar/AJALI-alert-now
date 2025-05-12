from flask_mail import Message
from ..extensions import mail, db
from ..models import User
import os
from twilio.rest import Client

def send_email_notification(user_email, subject, body):
    """Send email notification to user."""
    try:
        msg = Message(
            subject,
            sender=os.getenv('MAIL_DEFAULT_SENDER'),
            recipients=[user_email]
        )
        msg.body = body
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def send_sms_notification(phone_number, message):
    """Send SMS notification using Twilio."""
    try:
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        from_number = os.getenv('TWILIO_PHONE_NUMBER')

        if not all([account_sid, auth_token, from_number]):
            print("Twilio credentials not configured")
            return False

        client = Client(account_sid, auth_token)
        client.messages.create(
            body=message,
            from_=from_number,
            to=phone_number
        )
        return True
    except Exception as e:
        print(f"Error sending SMS: {str(e)}")
        return False

def notify_status_change(incident_id, new_status):
    """Notify user when incident status changes."""
    from models import IncidentReport
    
    try:
        incident = IncidentReport.query.get(incident_id)
        if not incident:
            return False

        user = User.query.get(incident.user_id)
        if not user:
            return False

        # Email notification
        subject = f"Incident Status Update - {incident.title}"
        body = f"""
        Hello {user.username},

        The status of your incident report "{incident.title}" has been updated to: {new_status}

        You can view the details at: http://localhost:5173/incidents/{incident_id}

        Best regards,
        Ajali! Team
        """
        email_sent = send_email_notification(user.email, subject, body)

        # SMS notification (if phone number is available)
        if hasattr(user, 'phone_number') and user.phone_number:
            message = f"Ajali! Alert: Your incident '{incident.title}' status has been updated to {new_status}."
            sms_sent = send_sms_notification(user.phone_number, message)
        else:
            sms_sent = False

        return email_sent or sms_sent

    except Exception as e:
        print(f"Error in notification process: {str(e)}")
        return False
