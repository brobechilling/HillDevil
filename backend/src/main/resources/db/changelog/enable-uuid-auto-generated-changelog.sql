-- liquibase formatted sql

-- changeset quoc:enable-uuid-auto-generated-extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- changeset quoc:enable-uuid-auto-generated-1
ALTER TABLE public.area ALTER COLUMN area_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-2
ALTER TABLE public.area_table ALTER COLUMN area_table_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-3
ALTER TABLE public.bill ALTER COLUMN bill_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-4
ALTER TABLE public.branch ALTER COLUMN branch_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-5
ALTER TABLE public.branch_menu_item ALTER COLUMN branch_menu_item_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-6
ALTER TABLE public.branch_report ALTER COLUMN branch_report_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-7
ALTER TABLE public.category ALTER COLUMN category_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-8
ALTER TABLE public.customization ALTER COLUMN customization_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-9
ALTER TABLE public.feature ALTER COLUMN feature_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-10
ALTER TABLE public.media ALTER COLUMN media_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-11
ALTER TABLE public.menu_item ALTER COLUMN menu_item_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-12
ALTER TABLE public.order_item ALTER COLUMN order_item_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-13
ALTER TABLE public.order_item_customization ALTER COLUMN order_item_customization_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-14
ALTER TABLE public.order_line ALTER COLUMN order_line_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-15
ALTER TABLE public.orders ALTER COLUMN order_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-16
ALTER TABLE public.packages ALTER COLUMN package_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-17
ALTER TABLE public.reservation ALTER COLUMN reservation_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-18
ALTER TABLE public.restaurant ALTER COLUMN restaurant_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-19
ALTER TABLE public.restaurant_report ALTER COLUMN restaurant_report_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-20
ALTER TABLE public.role ALTER COLUMN role_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-21
ALTER TABLE public.staff_account ALTER COLUMN staff_account_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-22
ALTER TABLE public.subscription ALTER COLUMN subscription_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-23
ALTER TABLE public.subscription_payment ALTER COLUMN subscription_payment_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-24
ALTER TABLE public.target_type ALTER COLUMN target_type_id SET DEFAULT gen_random_uuid();

-- changeset quoc:enable-uuid-auto-generated-25
ALTER TABLE public.users ALTER COLUMN user_id SET DEFAULT gen_random_uuid();
