-- liquibase formatted sql

-- changeset hoahtm:1762614578050-3
ALTER TABLE feature
    ADD code VARCHAR(100);

-- changeset hoahtm:1762614578050-4
ALTER TABLE feature
    ADD CONSTRAINT uc_feature_code UNIQUE (code);

-- changeset khoi:seed-feature-limit-basic-only

INSERT INTO public.feature (feature_id, name, description, code)
VALUES
    ('b006e477-4731-40b6-b9c3-31da7a67ca6d', 'Limit Customizations per Category', 'Limit the number of customizations allowed per menu category.', 'LIMIT_CUSTOMIZATION_PER_CATEGORY'),
    ('1050f487-d512-44f5-b4af-72eee963323d', 'Limit Menu Items', 'Limit the number of menu items allowed in the menu.', 'LIMIT_MENU_ITEMS');

INSERT INTO public.package_feature (package_id, feature_id, value)
VALUES
    ('69eba7c7-3390-4b84-9e14-3c2bf38c08ad', 'b006e477-4731-40b6-b9c3-31da7a67ca6d', 5),
    ('69eba7c7-3390-4b84-9e14-3c2bf38c08ad', '1050f487-d512-44f5-b4af-72eee963323d', 20);

-- changeset khoi:fix-featurecode
UPDATE public.feature
SET code = 'LIMIT_BRANCH_CREATION' WHERE feature_id = '8c485d29-48c9-4330-8873-aba830ca4dbb';


