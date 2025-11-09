-- liquibase formatted sql

-- changeset quoc:update-bill
ALTER TABLE public.bill DROP CONSTRAINT IF EXISTS fk_bill_on_order;
ALTER TABLE public.bill ALTER COLUMN order_id DROP NOT NULL;
ALTER TABLE public.bill ADD CONSTRAINT uq_bill_order UNIQUE (order_id);
ALTER TABLE public.bill
    ADD CONSTRAINT fk_bill_on_order FOREIGN KEY (order_id)
    REFERENCES public.orders (order_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

-- changeset quoc:update-orderline
ALTER TABLE public.order_line ADD COLUMN total_price DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE public.order_line ALTER COLUMN total_price SET NOT NULL;
