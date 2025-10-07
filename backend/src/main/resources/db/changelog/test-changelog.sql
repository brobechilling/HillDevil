-- liquibase formatted sql

-- changeset wave:create-table-author
CREATE TABLE author
(
    author_id UUID         NOT NULL,
    name      VARCHAR(255) NOT NULL,
    email     VARCHAR(255) NOT NULL,
    CONSTRAINT pk_author PRIMARY KEY (author_id)
);

-- changeset wave:creata-table-book
CREATE TABLE book
(
    book_id        UUID NOT NULL,
    title          VARCHAR(255),
    published_year INTEGER,
    author_id      UUID NOT NULL,
    CONSTRAINT pk_book PRIMARY KEY (book_id)
);

-- changeset wave:create-table-book-category
CREATE TABLE book_category
(
    book_id     UUID NOT NULL,
    category_id UUID NOT NULL,
    CONSTRAINT pk_book_category PRIMARY KEY (book_id, category_id)
);

-- changeset wave:create-table-category
CREATE TABLE category
(
    category_id UUID NOT NULL,
    name        VARCHAR(255),
    CONSTRAINT pk_category PRIMARY KEY (category_id)
);

-- changeset wave:1759818243434-5
ALTER TABLE author
    ADD CONSTRAINT uc_author_email UNIQUE (email);

-- changeset wave:1759818243434-6
ALTER TABLE author
    ADD CONSTRAINT uc_author_name UNIQUE (name);

-- changeset wave:1759818243434-7
ALTER TABLE book
    ADD CONSTRAINT FK_BOOK_ON_AUTHOR FOREIGN KEY (author_id) REFERENCES author (author_id);

-- changeset wave:1759818243434-8
ALTER TABLE book_category
    ADD CONSTRAINT fk_boocat_on_book FOREIGN KEY (book_id) REFERENCES book (book_id);

-- changeset wave:1759818243434-9
ALTER TABLE book_category
    ADD CONSTRAINT fk_boocat_on_category FOREIGN KEY (category_id) REFERENCES category (category_id);

