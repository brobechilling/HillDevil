-- liquibase formatted sql

-- changeset THTN0:1762155491471-1
ALTER TABLE reservation
    ALTER COLUMN area_table_id DROP NOT NULL;

-- changeset THTN0:1762155491471-2
ALTER TABLE menu_item ALTER COLUMN status TYPE VARCHAR(255) USING (status::VARCHAR(255));

