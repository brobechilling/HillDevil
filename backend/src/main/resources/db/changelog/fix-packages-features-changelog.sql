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

-- changeset khoi:update-limit-menu-items-value-to-5
UPDATE public.package_feature
SET value = 5
WHERE feature_id = (
    SELECT feature_id FROM public.feature WHERE code = 'LIMIT_MENU_ITEMS'
);

-- changeset hoahtm:add-purpose-to-subscription-payment

ALTER TABLE subscription_payment
    ADD COLUMN purpose VARCHAR(50);

UPDATE subscription_payment
SET purpose = 'NEW_SUBSCRIPTION'
WHERE purpose IS NULL;

-- changeset hoahtm:add-targetPackage-and-proratedAmount-to-subscriptionPayment
ALTER TABLE subscription_payment
    ADD COLUMN target_package_id UUID;

ALTER TABLE subscription_payment
    ADD COLUMN prorated_amount INTEGER;

ALTER TABLE subscription_payment
    ADD CONSTRAINT fk_subscriptionPayment_targetPackage
        FOREIGN KEY (target_package_id) REFERENCES packages(package_id);

UPDATE packages
SET price = 4000
WHERE package_id = 'a940d829-5a1d-4ac6-844a-49a8131232fd'



