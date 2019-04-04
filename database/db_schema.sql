/* schema for constructing database */

DROP TABLE "codes";
DROP TABLE "stockdata";
DROP TABLE "stocks";
DROP TABLE "users";


CREATE TABLE IF NOT EXISTS "users"
(
    "username" varchar(32) PRIMARY KEY,
    "password" char(60) NOT NULL,
    "status" char(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS "stocks"
(
    "stock_id" serial PRIMARY KEY,
    "username" varchar(32) REFERENCES users(username) ON DELETE CASCADE,
    "symbol" varchar(10),
    "stock_name" varchar(50),
    CONSTRAINT unique_stocks UNIQUE (username, symbol)
);

CREATE TABLE IF NOT EXISTS "stockdata"
(
    "stock_id" serial REFERENCES stocks(stock_id) ON DELETE CASCADE,
    "date" date,
    "notes" varchar(250),
    "dividend" numeric,
    "yield" numeric,
    "price" numeric,
    "shares_outstanding" numeric,
    "market_cap" numeric,
    "net_debt" numeric,
    "enterprise_value" numeric,
    "revenue" numeric,
    "aebitda" numeric,
    "asset_turnover" numeric,
    "roe" numeric,
    "effective_tax" numeric,
    "ttm" boolean,
    PRIMARY KEY(stock_id, date)
);

CREATE TABLE IF NOT EXISTS "codes"
(
    "code_id" serial PRIMARY KEY,
    "code" varchar(32) UNIQUE,
    "type" varchar(32),
);

INSERT INTO codes (code, type) VALUES ('admin', 'admin'), ('user', 'user');
