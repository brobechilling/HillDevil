-- liquibase formatted sql

-- changeset hoahtm:1761837092977-1
ALTER TABLE category
    ALTER COLUMN restaurant_id DROP NOT NULL;

-- changeset hoahtm:1761837092977-2
ALTER TABLE category
    ADD status BOOLEAN;

-- changeset hoahtm:1761837092977-3
ALTER TABLE customization
    ADD status BOOLEAN;

-- changeset hoahtm:1761837092977-4
-- SEED DATA for Category
INSERT INTO category (category_id, restaurant_id, name, status, created_at, updated_at)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'Pizza', TRUE, NOW(), NOW()),
    ('c2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'Drink', TRUE, NOW(), NOW()),
    ('c3333333-3333-3333-3333-333333333333', NULL, 'Default Category', TRUE, NOW(), NOW());

-- changeset hoahtm:1761837092977-5
-- SEED DATA for Customization
INSERT INTO customization (customization_id, restaurant_id, name, price, status, created_at, updated_at)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'Extra Cheese', 10000, TRUE, NOW(), NOW()),
    ('c2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'Large Size', 15000, TRUE, NOW(), NOW());

-- changeset hoahtm:1761837092977-6
-- SEED DATA for MenuItem
INSERT INTO menu_item (menu_item_id, restaurant_id, category_id, has_customization, name, description, price, status, is_bestseller, created_at, updated_at)
VALUES
    ('f1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', TRUE, 'Pepperoni Pizza', 'Classic Pepperoni Pizza', 120000, TRUE, TRUE, NOW(), NOW()),
    ('f2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', FALSE, 'Cheese Pizza', 'Extra Cheese', 110000, TRUE, FALSE, NOW(), NOW()),
    ('f3333333-3333-3333-3333-333333333333', 'e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', FALSE, 'Coke', 'Chilled Coca-Cola', 25000, TRUE, FALSE, NOW(), NOW());

-- changeset hoahtm:1761837092977-7
-- SEED DATA for MenuItem_Customization relation
INSERT INTO menuitem_customization (menu_item_id, customization_id)
VALUES ('f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111');

-- changeset hoahtm:1761837092977-8
-- SEED DATA for BranchMenuItem
INSERT INTO branch_menu_item (branch_menu_item_id, branch_id, menu_item_id, is_available, updated_at)
VALUES
    ('b1111111-1111-1111-1111-111111111111', 'ba333333-3333-3333-3333-333333333333', 'f1111111-1111-1111-1111-111111111111', TRUE, NOW()),
    ('b2222222-2222-2222-2222-222222222222', 'ba333333-3333-3333-3333-333333333333', 'f2222222-2222-2222-2222-222222222222', FALSE, NOW()),
    ('b3333333-3333-3333-3333-333333333333', 'ba444444-4444-4444-4444-444444444444', 'f3333333-3333-3333-3333-333333333333', TRUE, NOW());

-- changeset hoahtm:1761837092977-9
ALTER TABLE menu_item
ALTER COLUMN status TYPE VARCHAR(20)
    USING CASE
        WHEN status = TRUE THEN 'ACTIVE'
        WHEN status = FALSE THEN 'INACTIVE'
        ELSE 'DELETED'
END;

ALTER TABLE menu_item
    ALTER COLUMN status SET NOT NULL;
