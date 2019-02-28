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
    "symbol" varchar(10) REFERENCES stocks(symbol),
    "playbook_id" int REFERENCES playbooks(playbook_id),
    PRIMARY KEY(symbol, playbook_id)
);


CREATE TABLE IF NOT EXISTS "stockdata"
(
    "stockdata_id" serial PRIMARY KEY,
    "symbol" varchar(10) REFERENCES stocks(symbol) ON DELETE CASCADE,
    "date" timestamp with time zone,
    "notes" varchar(250),
    "dividend" float(2),
    "yield" float(2),
    "price" float(2),
    "sales_order" float(2),
    "market_cap" int,
    "net_debt" float(2),
    "enterpise_value" float(2),
    "nd_aebitda" float(2),
    "revenue" int,
    "aebitda" float(2),
    "aebitda_percent" float(1),
    "asset_turnover" float(2),
    "aebitda_at" float(1),
    "roe" float(1),
    "effective_tax" float(2),
    "ev_aebitda" float(2),
    "spice" float(2),
    "roe_mult" float(2)
);
