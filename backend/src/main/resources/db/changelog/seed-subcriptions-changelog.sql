-- liquibase formatted sql

-- ======================================
-- changeset khoi:seed-feature-data
-- ======================================
INSERT INTO public.feature (feature_id, name, description)
VALUES
    ('19b88c03-6d4b-4bcc-86b4-bc2b0cf317cf', 'Upload Photos', 'Allows users to upload photos.'),
    ('6575c48f-3569-4156-879e-3483beab0767', 'Analytics', 'Provides view and engagement statistics.'),
    ('c4e3fb51-372e-4cf0-8fbd-2059c5f56495', 'AI Chat Support', 'AI-powered chat support.'),
    ('9df22bfe-7ad4-4058-b568-c58f691c3f8b', 'Branch Landing Customization', 'Allows customizing branch landing pages.'),
    ('8c485d29-48c9-4330-8873-aba830ca4dbb', 'Limited Branch Creation', 'Allows creating up to 3 branches.'),
    ('6529f7e4-8267-4b95-ac5c-e3c3eb0a5885', 'Unlimited Branch Creation', 'Allows creating unlimited branches.');

-- ======================================
-- changeset khoi:seed-package-data
-- ======================================
INSERT INTO public.packages (package_id, name, price, description, is_available, created_at, updated_at, billing_period)
VALUES
    ('69eba7c7-3390-4b84-9e14-3c2bf38c08ad', 'Basic', 0.99, 'Free basic plan with limited features.', TRUE, NOW(), NOW(), 1),
    ('a940d829-5a1d-4ac6-844a-49a8131232fd', 'Premium', 9.99, 'Premium plan with all advanced features.', TRUE, NOW(), NOW(), 1);

-- ======================================
-- changeset khoi:seed-package-feature-data
-- ======================================
-- Basic package includes: Upload Photos, Analytics, Limited Branch Creation
INSERT INTO public.package_feature (package_id, feature_id, value)
VALUES
    ('69eba7c7-3390-4b84-9e14-3c2bf38c08ad', '19b88c03-6d4b-4bcc-86b4-bc2b0cf317cf', NULL),
    ('69eba7c7-3390-4b84-9e14-3c2bf38c08ad', '6575c48f-3569-4156-879e-3483beab0767', NULL),
    ('69eba7c7-3390-4b84-9e14-3c2bf38c08ad', '8c485d29-48c9-4330-8873-aba830ca4dbb', 3);

-- Premium package includes: All features
INSERT INTO public.package_feature (package_id, feature_id, value)
VALUES
    ('a940d829-5a1d-4ac6-844a-49a8131232fd', '19b88c03-6d4b-4bcc-86b4-bc2b0cf317cf', NULL),
    ('a940d829-5a1d-4ac6-844a-49a8131232fd', '6575c48f-3569-4156-879e-3483beab0767', NULL),
    ('a940d829-5a1d-4ac6-844a-49a8131232fd', 'c4e3fb51-372e-4cf0-8fbd-2059c5f56495', NULL),
    ('a940d829-5a1d-4ac6-844a-49a8131232fd', '9df22bfe-7ad4-4058-b568-c58f691c3f8b', NULL),
    ('a940d829-5a1d-4ac6-844a-49a8131232fd', '6529f7e4-8267-4b95-ac5c-e3c3eb0a5885', NULL);


