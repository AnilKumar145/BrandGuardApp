"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-12 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_users_email', 'users', ['email'])

    # Brands
    op.create_table(
        'brands',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('owner_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('normalized_name', sa.String(length=255), nullable=False),
        sa.Column('logo_url', sa.Text(), nullable=True),
        sa.Column('website', sa.String(length=512), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_brands_owner', 'brands', ['owner_id'])
    op.create_index('idx_brands_normalized_name', 'brands', ['normalized_name'])

    # Official Social Accounts
    op.create_table(
        'official_social_accounts',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('brand_id', sa.String(length=36), sa.ForeignKey('brands.id', ondelete='CASCADE'), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('handle', sa.String(length=255), nullable=False),
        sa.Column('url', sa.Text(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.UniqueConstraint('brand_id', 'platform', 'handle', name='uq_brand_platform_handle')
    )
    op.create_index('idx_official_social_brand', 'official_social_accounts', ['brand_id'])

    # Official Apps
    op.create_table(
        'official_apps',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('brand_id', sa.String(length=36), sa.ForeignKey('brands.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('package_id', sa.String(length=255), nullable=True),
        sa.Column('developer_name', sa.String(length=255), nullable=False),
        sa.Column('store', sa.String(length=50), nullable=False),
        sa.Column('store_url', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_official_apps_brand', 'official_apps', ['brand_id'])

    # Detections
    op.create_table(
        'detections',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('brand_id', sa.String(length=36), sa.ForeignKey('brands.id', ondelete='CASCADE'), nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=False),
        sa.Column('platform', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=512), nullable=False),
        sa.Column('url', sa.Text(), nullable=True),
        sa.Column('handle_or_package', sa.String(length=255), nullable=True),
        sa.Column('developer_or_owner', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.Text(), nullable=True),
        sa.Column('risk_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('risk_level', sa.String(length=20), nullable=False),
        sa.Column('status', sa.String(length=30), default='needs_review'),
        sa.Column('is_official_excluded', sa.Boolean(), default=False),
        sa.Column('raw_signals', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'))
    )
    op.create_index('idx_detections_brand_risk', 'detections', ['brand_id', 'risk_score'])
    op.create_index('idx_detections_status', 'detections', ['status'])
    op.create_index('idx_detections_source', 'detections', ['source_type', 'platform'])

    # Detection Evidence
    op.create_table(
        'detection_evidence',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('detection_id', sa.String(length=36), sa.ForeignKey('detections.id', ondelete='CASCADE'), nullable=False),
        sa.Column('signal_type', sa.String(length=50), nullable=False),
        sa.Column('score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=False),
        sa.Column('metadata_json', sa.JSON(), nullable=True)
    )
    op.create_index('idx_evidence_detection', 'detection_evidence', ['detection_id'])

def downgrade() -> None:
    op.drop_table('detection_evidence')
    op.drop_table('detections')
    op.drop_table('official_apps')
    op.drop_table('official_social_accounts')
    op.drop_table('brands')
    op.drop_table('users')
