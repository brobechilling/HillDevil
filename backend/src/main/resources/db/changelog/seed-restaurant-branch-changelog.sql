-- liquibase formatted sql

-- changeset nguyen:seed-restaurant-data-v2
INSERT INTO public.restaurant 
(restaurant_id, user_id, name, email, status, restaurant_phone, created_at, updated_at, public_url, description)
VALUES
('e1111111-1111-1111-1111-111111111111', 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sunny Cafe', 'contact@sunnycafe.com', true, '0902222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'sunnycafe', 'A cozy coffee shop'),
('e2222222-2222-2222-2222-222222222222', 'f5555555-ffff-ffff-ffff-ffffffffffff', 'Gongcha Milktea', 'contact@gongcha.com', true, '0903333333', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'gongcha', 'A shop'),
('e3333333-3333-3333-3333-333333333333', 'f5555555-ffff-ffff-ffff-ffffffffffff', 'Rainy Restaurant', 'contact@rainy.com', true, '0903333333', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'rainy', 'A rainy restaurant shop');

-- changeset nguyen:seed-branch-data-v2
INSERT INTO public.branch 
(branch_id, restaurant_id, address, branch_phone, opening_time, closing_time, created_at, updated_at, is_active, mail)
VALUES
('ba111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', '123 Le Loi, District 1, HCMC', '0903333222', '07:00:00', '22:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 'haha@sunnycafe.com'),
('ba222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', '345 Hung Vuong, District 2, DNC', '0904444333', '07:00:00', '22:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 'hihi@gongchahungvuong.com'),
('ba333333-3333-3333-3333-333333333333', 'e3333333-3333-3333-3333-333333333333', '678 Tran Duy Hung, District 9, HCMC', '0903456789', '07:00:00', '22:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 'huhu@rainytranduyhung.com'),
('ba444444-4444-4444-4444-444444444444', 'e3333333-3333-3333-3333-333333333333', '567 Chau Thi Vinh Te, District 4, HC', '0909876543', '07:00:00', '22:00:00', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true, 'hehe@rainyctvt.com');
