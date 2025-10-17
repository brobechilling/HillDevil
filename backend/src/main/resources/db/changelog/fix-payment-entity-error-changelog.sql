-- liquibase formatted sql

-- changeset hoahtm:1760656158555-7
ALTER TABLE subscription_payment
    ADD webhook_status BOOLEAN;

-- changeset hoahtm:1760656158555-8
ALTER TABLE subscription_payment DROP COLUMN webhoock_status;
ALTER TABLE subscription_payment DROP COLUMN payos_order_code;
ALTER TABLE subscription_payment DROP COLUMN response_payload;
ALTER TABLE subscription_payment DROP COLUMN webhook_payload;

-- changeset hoahtm:1760656158555-2
ALTER TABLE subscription_payment
    ADD payos_order_code BIGINT;

-- changeset hoahtm:1760656158555-4
ALTER TABLE subscription_payment
    ADD response_payload OID;

-- changeset hoahtm:1760656158555-6
ALTER TABLE subscription_payment
    ADD webhook_payload OID;

