-- liquibase formatted sql

-- changeset quoc:refresh-token-1
CREATE TABLE refresh_token
(
    id         VARCHAR(255) NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    user_id    UUID         NOT NULL,
    issued_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    revoked    BOOLEAN      NOT NULL,
    client_ip  VARCHAR(255),
    user_agent VARCHAR(255),
    CONSTRAINT pk_refresh_token PRIMARY KEY (id)
);

-- changeset quoc:refresh-token-2
ALTER TABLE refresh_token
    ADD CONSTRAINT FK_REFRESH_TOKEN_ON_USER FOREIGN KEY (user_id) REFERENCES users (user_id);

-- changeset quoc:refresh-token-3
ALTER TABLE refresh_token
    ADD COLUMN parent_refresh_token_id VARCHAR(255),
    ADD CONSTRAINT fk_refresh_token_on_parent FOREIGN KEY (parent_refresh_token_id) REFERENCES refresh_token (id) ON DELETE SET NULL;

