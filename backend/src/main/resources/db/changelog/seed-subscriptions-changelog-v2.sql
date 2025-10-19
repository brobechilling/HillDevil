-- liquibase formatted sql

-- changeset hoahtm:1760876715853-1
ALTER TABLE subscription DROP COLUMN status;

-- changeset hoahtm:1760876715853-2
ALTER TABLE subscription
    ADD status VARCHAR(255) NOT NULL;

-- changeset hoahtm:1760876715853-3
ALTER TABLE subscription
    ALTER COLUMN status SET NOT NULL;

-- changeset hoahtm:1760876715853-4
-- Seed sample subscriptions (PENDING_PAYMENT, no payment yet)
INSERT INTO subscription (
    subscription_id,
    restaurant_id,
    package_id,
    status,
    created_at,
    updated_at,
    start_date,
    end_date
) VALUES
      (
          'b1111111-aaaa-4bbb-cccc-111111111111', -- Sunny Cafe
          'e1111111-1111-1111-1111-111111111111',
          '69eba7c7-3390-4b84-9e14-3c2bf38c08ad', -- Basic
          'PENDING_PAYMENT',
          NOW(),
          NOW(),
          NULL,
          NULL
      ),
      (
          'b2222222-bbbb-4ccc-dddd-222222222222', -- Gongcha Milktea
          'e2222222-2222-2222-2222-222222222222',
          'a940d829-5a1d-4ac6-844a-49a8131232fd', -- Premium
          'PENDING_PAYMENT',
          NOW(),
          NOW(),
          NULL,
          NULL
      );



