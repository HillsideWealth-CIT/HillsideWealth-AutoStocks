const perm = [0, 1, 2, 3, 4, 5, 6, 7];

var column_list = ['check',
    'Symbol',
    'Graph',
    'Edit',
    'Calc',
    'Historic',
    'Aggregated',
    'Stock Name',
    'Market Cap (M)',
    'Sector',
    'aEBITDA Spice',
    'Current Price',
    'Value Conditions',
    'Yield',

    'Comment',
    'Ownership',
    'Emoticon',
    'Categories',

    'Date',
    'Shares Outstanding',
    'Enterprise Value',
    'Revenue',
    'aEBITDA(M)',
    'aEBITDA/Share',
    'aEBITDA%',
    'Asset Turn',
    'aEBITDA AT',
    'EV/aEBITDA',
    'Net Debt',
    'ND/aEBITDA',
    'ROE',
    'ROE Spice',
    'Effective Tax Rate',

    'Guru Rating',
    'JDV Rating',
    'MS Exchange',
    'MS Moat Rating',
    'MS FV Est',
    'MS 5* Price',
    'MS 1* Price',

    'EPS',
    'Growth Years',
    'Growth % 5Y',
    'Growth % 10Y',
    'Growth % 15Y',
    'terminalyears',
    'Terminal Growth %',
    'Discount Rate',
    'Growth Value 5Y',
    'Terminal Value 5Y',
    'DCF Fair Value 5Y',
    'Growth Value 10Y',
    'Terminal Value 10Y',
    'DCF Fair Value 10Y',
    'Growth Value 15Y',
    'Terminal Value 15Y',
    'DCF Fair Value 15Y',

    'FCF (M)',
    'FCF Yield',
    'FCF Growth(1Y)',
    'FCF Growth(3Y)',
    'FCF Growth(5Y)',
    'FCF Growth(10Y)',
    'Capex (M)',
    'Capex/FCF 5Y',
    'Capex/FCF 10Y',
    'Capex/aEBITDA',
    'Capex/aEBITDA 5Y',
    'Capex/aEBITDA 10Y',

    'FCF/aBITDA',
    'Price Growth (1y)',
    'Price Growth (3y)',
    'Price Growth (5y)',
    'Price Growth (10y)',
    'S/O Change (1Y)(M)',
    'S/O Change (3Y)(M)',
    'S/O Change (5Y)(M)',
    'S/O Change (10Y)(M)',
    'S/O Change (1Y)(%)',
    'S/O Change (3Y)(%)',
    'S/O Change (5Y)(%)',
    'S/O Change (10Y)(%)',
    'Revenue Growth (1Y)',
    'Revenue Growth (3Y)',
    'Revenue Growth (5Y)',
    'Revenue Growth (10Y)',
    'aEBITDA Growth(1Y)',
    'aEBITDA Growth(3Y)',
    'aEBITDA Growth(5Y)',
    'aEBITDA Growth(10Y)',
    'ROIC %',
    'WACC %',
    'ROIC-WACC',
];

/**
 * Loops through columns and hides the undesired columns
 * @param {Integer} start 
 * @param {Integer} end 
 * @param {Integer} count 
 */
function hide_loop(start, end, count = 0) {
    for (let i = count; i < total_columns; i++) {
        if (i >= end || i <= start) {
            if (perm.indexOf(i) == -1) {
                $table.column(i).visible(false, false);
            }
        }

        else {
            $table.column(i).visible(true, false);
        }
    }
}

function show_all() {
    hide_loop(0, total_columns);
    $table.columns.adjust().draw(false);
}

function basic_stats() {
    hide_loop(column_list.indexOf('Market Cap (M)') - 1,
        column_list.indexOf('Effective Tax Rate') + 1);
    $table.columns.adjust().draw(false);
}

function basic_info() {
    hide_loop(column_list.indexOf('Market Cap (M)') - 1,
        column_list.indexOf('Date') + 1);
    $table.columns.adjust().draw(false);
}

function financials() {
    hide_loop(column_list.indexOf('Enterprise Value') - 1,
        column_list.indexOf('Effective Tax Rate') + 1);
    $table.columns.adjust().draw(false);
}

function show_values() {
    hide_loop(column_list.indexOf('Guru Rating') - 1,
        column_list.indexOf('DCF Fair Value 15Y') + 1);
    $table.columns.adjust().draw(false);
}

function show_msguru() {
    hide_loop(column_list.indexOf('Guru Rating') - 1,
        column_list.indexOf('MS 1* Price') + 1);
    $table.columns.adjust().draw(false);
}

function show_dcf() {
    hide_loop(column_list.indexOf('EPS') - 1,
        column_list.indexOf('DCF Fair Value 15Y') + 1);
    $table.columns.adjust().draw(false);
}

function all_growth() {
    hide_loop(column_list.indexOf('FCF (M)') - 1,
        column_list.indexOf('FCF Growth(10Y)') + 1);
    hide_loop(column_list.indexOf('Price Growth (1y)') - 1,
        column_list.indexOf('Price Growth (10y)') + 1, 65);
    $table.columns.adjust().draw(false);
}

function fcf_growth() {
    hide_loop(column_list.indexOf('FCF (M)') - 1,
        column_list.indexOf('FCF Growth(10Y)') + 1);
    hide_loop(column_list.indexOf('FCF/aBITDA') - 1,
        column_list.indexOf('FCF/aBITDA') + 1, 65);
    $table.columns.adjust().draw(false);
}

function price_growth() {
    hide_loop(column_list.indexOf('Price Growth (1y)') - 1,
        column_list.indexOf('Price Growth (10y)') + 1);
    $table.columns.adjust().draw(false);
}

function so_growth() {
    hide_loop(column_list.indexOf('S/O Change (1Y)(M)') - 1,
        column_list.indexOf('S/O Change (10Y)(%)') + 1);
    $table.columns.adjust().draw(false);
}

function rev_growth() {
    hide_loop(column_list.indexOf('Revenue Growth (1Y)') - 1,
        column_list.indexOf('Revenue Growth (10Y)') + 1);
    $table.columns.adjust().draw(false);
}

function ae_growth() {
    hide_loop(column_list.indexOf('aEBITDA Growth(1Y)') - 1,
        column_list.indexOf('aEBITDA Growth(10Y)') + 1);
    $table.columns.adjust().draw(false);
}

function asset_light() {
    hide_loop(column_list.indexOf('Capex (M)') - 1,
        column_list.indexOf('FCF/aBITDA') + 1);
    $table.columns.adjust().draw(false);
}

function capex() {
    hide_loop(column_list.indexOf('Capex (M)') - 1,
        column_list.indexOf('Capex/aEBITDA 10Y') + 1);
    $table.columns.adjust().draw(false);
}

function profitability() {
    hide_loop(column_list.indexOf('ROIC %') - 1,
        total_columns);
    $table.columns.adjust().draw(false);
}
