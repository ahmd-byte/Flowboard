"""add labels column to cards

Revision ID: ba0c86bc10a1
Revises: 4bc6ad32f0c9
Create Date: 2025-12-10 02:23:13.086048

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa  # type: ignore


# revision identifiers, used by Alembic.
revision: str = 'ba0c86bc10a1'
down_revision: Union[str, None] = '4bc6ad32f0c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add labels column to cards table
    op.add_column('cards', sa.Column('labels', sa.String(length=500), nullable=True))


def downgrade() -> None:
    # Remove labels column from cards table
    op.drop_column('cards', 'labels')

