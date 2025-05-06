"""add notification preferences

Revision ID: add_notification_preferences
Revises: 575473968258
Create Date: 2024-02-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = 'add_notification_preferences'
down_revision = '575473968258'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to users table
    op.add_column('users', sa.Column('phone_number', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('email_notifications', sa.Boolean(), server_default='true', nullable=False))
    op.add_column('users', sa.Column('sms_notifications', sa.Boolean(), server_default='true', nullable=False))

def downgrade():
    # Remove the columns if we need to roll back
    op.drop_column('users', 'sms_notifications')
    op.drop_column('users', 'email_notifications')
    op.drop_column('users', 'phone_number')
