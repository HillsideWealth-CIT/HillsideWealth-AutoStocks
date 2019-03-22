/* schema for constructing database */

CREATE TABLE IF NOT EXISTS "users"
(
    "username" varchar(32) PRIMARY KEY,
    "password" char(60) NOT NULL
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
    "stockdata_id" serial PRIMARY KEY,
    "stock_id" serial REFERENCES stocks(stock_id) ON DELETE CASCADE,
    "stock_name" varchar(50),
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
    "effective_tax" numeric
);
