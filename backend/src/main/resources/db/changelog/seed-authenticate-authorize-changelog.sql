-- liquibase formatted sql

-- changeset quoc:seed-role-data
INSERT INTO public.role (role_id, name, description, created_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'ADMIN', 'System administrator with full access', NOW()),
    ('22222222-2222-2222-2222-222222222222', 'RESTAURANT_OWNER', 'Owner of the restaurant', NOW()),
    ('33333333-3333-3333-3333-333333333333', 'BRANCH_MANAGER', 'Manager of a restaurant branch', NOW()),
    ('44444444-4444-4444-4444-444444444444', 'WAITER', 'Waiter responsible for serving customers', NOW()),
    ('55555555-5555-5555-5555-555555555555', 'RECEPTIONIST', 'Receptionist handling reservations and guests', NOW());


-- changeset quoc:seed-user-data
INSERT INTO public.users 
(user_id, email, password, username, created_at, updated_at, status, role_id)
VALUES
    ('a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@example.com', 'admin', 'superadmin', NOW(), NOW(), TRUE, '11111111-1111-1111-1111-111111111111'),
    ('b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'owner1@example.com', 'owner', 'rest_owner1', NOW(), NOW(), TRUE, '22222222-2222-2222-2222-222222222222'),
    ('c3333333-cccc-cccc-cccc-cccccccccccc', 'owner2@example.com', 'owner', 'rest_owner2', NOW(), NOW(), TRUE, '22222222-2222-2222-2222-222222222222'),
    ('d4444444-dddd-dddd-dddd-dddddddddddd', 'owner3@example.com', 'owner', 'rest_owner3', NOW(), NOW(), TRUE, '22222222-2222-2222-2222-222222222222');


