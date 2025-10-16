-- liquibase formatted sql

-- changeset khoi:update-package-feature-default-value
UPDATE public.package_feature
SET value = 0
WHERE value IS NULL;