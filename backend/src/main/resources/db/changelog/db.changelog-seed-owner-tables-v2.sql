-- liquibase formatted sql
-- Seed data for Owner Tables API testing (v2 – fixed UUIDs)

-- changeset nguyen:seed-owner-tables-v2

-- 1) ROLE
INSERT INTO public.role (role_id, name, description, created_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'OWNER', 'Owner role (demo)', CURRENT_TIMESTAMP)
ON CONFLICT (role_id) DO NOTHING;

-- 2) USERS
INSERT INTO public.users (user_id, email, password, username, created_at, role_id)
VALUES ('22222222-2222-2222-2222-222222222222', 'owner@example.com', 'hashed-password', 'demo_owner',
        CURRENT_TIMESTAMP, '11111111-1111-1111-1111-111111111111')
ON CONFLICT (email) DO NOTHING;

-- 3) RESTAURANT
INSERT INTO public.restaurant (restaurant_id, user_id, name, email, status, created_at)
VALUES ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
        'Demo Resto', 'demo@resto.local', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (restaurant_id) DO NOTHING;

-- 4) BRANCH  (dùng ID này để gọi API)
INSERT INTO public.branch (branch_id, restaurant_id, address, mail, is_active, created_at, updated_at)
VALUES ('ba111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
        '123 Demo Street', 'branch@demo.local', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (branch_id) DO NOTHING;

-- 5) AREA
INSERT INTO public.area (area_id, branch_id, name, status, created_at, updated_at)
VALUES
('aa111111-1111-1111-1111-111111111111', 'ba111111-1111-1111-1111-111111111111', 'Ground Floor', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aa222222-2222-2222-2222-222222222222', 'ba111111-1111-1111-1111-111111111111', 'Mezzanine',    TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (area_id) DO NOTHING;

-- 6) AREA_TABLE
INSERT INTO public.area_table (area_table_id, area_id, tag, capacity, status, qr, created_at, updated_at)
VALUES
('a1111111-1111-4111-8111-111111111111', 'aa111111-1111-1111-1111-111111111111', 'T1', 4, 'FREE',     NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a2222222-2222-4222-8222-222222222222', 'aa111111-1111-1111-1111-111111111111', 'T2', 6, 'OCCUPIED', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a3333333-3333-4333-8333-333333333333', 'aa222222-2222-2222-2222-222222222222', 'T3', 2, 'FREE',     NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a4444444-4444-4444-8444-444444444444', 'aa222222-2222-2222-2222-222222222222', 'T4', 8, 'FREE',     NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (area_table_id) DO NOTHING;
