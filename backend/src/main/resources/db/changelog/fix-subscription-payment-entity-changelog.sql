-- liquibase formatted sql

-- changeset hoahtm:1761290403765-5
ALTER TABLE subscription_payment
    ADD account_name VARCHAR(255);
ALTER TABLE subscription_payment
    ADD account_number VARCHAR(255);
ALTER TABLE subscription_payment
    ADD description VARCHAR(255);
ALTER TABLE subscription_payment
    ADD expired_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE subscription_payment
    ADD qr_code_url VARCHAR(255);
ALTER TABLE subscription_payment
    ADD subscription_payment_status VARCHAR(255);

-- changeset hoahtm:1761290403765-11
ALTER TABLE subscription_payment DROP COLUMN checkout_url;
ALTER TABLE subscription_payment DROP COLUMN payment_status;
ALTER TABLE subscription_payment DROP COLUMN amount;

-- changeset hoahtm:1761290403765-2
ALTER TABLE subscription_payment
    ADD amount INTEGER NOT NULL;

-- changeset hoahtm:1761290403765-3
ALTER TABLE packages
ALTER COLUMN price TYPE INTEGER
USING price::integer;

