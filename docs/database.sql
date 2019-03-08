/* schema for constructing database */

CREATE TABLE IF NOT EXISTS "users"
(
    "username" varchar(32) PRIMARY KEY,
    "password" char(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS "playbooks"
(
    "playbook_id" serial PRIMARY KEY,
    "username" varchar(32) REFERENCES users(username),
    "playbook_title" varchar(80),
    "date_created" timestamp with time zone,
    "date_modified" timestamp with time zone
);


CREATE TABLE IF NOT EXISTS "stocks"
(
    "symbol" varchar(10) PRIMARY KEY,
    "stock_name" varchar(50)
);

CREATE TABLE IF NOT EXISTS "pbstock"
(
    "symbol" varchar(10) REFERENCES stocks(symbol) ON DELETE CASCADE,
    "playbook_id" int REFERENCES playbooks(playbook_id) ON DELETE CASCADE,
    PRIMARY KEY(symbol, playbook_id)
);


CREATE TABLE IF NOT EXISTS "stockdata"
(
    "stockdata_id" serial PRIMARY KEY,
    "symbol" varchar(10) REFERENCES stocks(symbol) ON DELETE CASCADE,
    "date" date,
    "notes" varchar(250),
    "dividend" numeric,
    "yield" numeric,
    "price" numeric,
    "sales_order" numeric,
    "market_cap" numeric,
    "net_debt" numeric,
    "enterprise_value" numeric,
    "nd_aebitda" numeric,
    "revenue" numeric,
    "aebitda" numeric,
    "aebitda_percent" numeric,
    "asset_turnover" numeric,
    "aebitda_at" numeric,
    "roe" numeric,
    "effective_tax" numeric,
    "ev_aebitda" numeric,
    "spice" numeric,
    "roe_mult" numeric
);
