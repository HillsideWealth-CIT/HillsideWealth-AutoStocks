const perm = [0, 1, 2, 3];

var column_list = ['check',
    'Symbol',
    'Edit Buttons',
    'Stock Name',
    'Date',
    'Aggregated',
    'Current Price',

    'FCF Spice',
    'FCF Spice 3yr',
    'FCF Spice 5yr',
    'FCF Spice 10yr',
    'FCF Spice TTM/5yr',
    'FCF Spice TTM/10yr',
    'FCF Spice SD 5yr',
    'FCF Spice SD 10yr',

    'FCF Yield',
    'FCF Yield 3yr',
    'FCF Yield 5yr',
    'FCF Yield 10yr',
    'FCF Yield TTM/5yr',
    'FCF Yield TTM/10yr',
    'FCF Yield SD 5yr',
    'FCF Yield SD 10yr',

    'Yield%',
    'Enterprise Value (M)',
    'Categories',

    'FCFROIC%',
    'FCFROIC% 3yr',
    'FCFROIC% 5yr',
    'FCFROIC% 10yr',
    'FCFROIC% TTM/5yr',
    'FCFROIC% TTM/10yr',
    'FCFROIC% SD 5yr',
    'FCFROIC% SD 10yr',

    'FCFROA%',
    'FCFROA% 3yr',
    'FCFROA% 5yr',
    'FCFROA% 10yr',
    'FCFROA% TTM/5yr',
    'FCFROA% TTM/10yr',
    'FCFROA% SD 5yr',
    'FCFROA% SD 10yr',
    
    'FCFROE%',
    'FCFROE% 3yr',
    'FCFROE% 5yr',
    'FCFROE% 10yr',
    'FCFROE% TTM/5yr',
    'FCFROE% TTM/10yr',
    'FCFROE% SD 5yr',
    'FCFROE% SD 10yr',
    
    'FCFROCE%',
    'FCFROCE% 3yr',
    'FCFROCE% 5yr',
    'FCFROCE% 10yr',
    'FCFROCE% TTM/5yr',
    'FCFROCE% TTM/10yr',
    'FCFROCE% SD 5yr',
    'FCFROCE% SD 10yr',

    'FCFROTA%',
    'FCFROTA% 3yr',
    'FCFROTA% 5yr',
    'FCFROTA% 10yr',
    'FCFROTA% TTM/5yr',
    'FCFROTA% TTM/10yr',
    'FCFROTA% SD 5yr',
    'FCFROTA% SD 10yr',

    'iROiE% 1yr',
    'iROiE% 3yr',
    'iROiE% 5yr',
    'iROiE% 10yr',

    'iFCFROiIC% 1yr',
    'iFCFROiIC% 3yr',
    'iFCFROiIC% 5yr',
    'iFCFROiIC% 10yr',

    'JDViFCFROiIC% 1yr',
    'JDViFCFROiIC% 3yr',
    'JDViFCFROiIC% 5yr',
    'JDViFCFROiIC% 10yr',
    
    'CF Re-investment Rate',
    'CF Re-investment Rate 3yr',
    'CF Re-investment Rate 5yr',
    'CF Re-investment Rate 10yr',
    'CF Re-investment Rate TTM/5yr',
    'CF Re-investment Rate TTM/10yr',
    'CF Re-investment Rate SD 5yr',
    'CF Re-investment Rate SD 10yr',

    'Gross Margin%',
    'Gross Margin% 3yr',
    'Gross Margin% 5yr',
    'Gross Margin% 10yr',
    'Gross Margin% TTM/5yr',
    'Gross Margin% TTM/10yr',
    'Gross Margin% SD 5yr',
    'Gross Margin% SD 10yr',

    'Operating Margin%',
    'Operating Margin% 3yr',
    'Operating Margin% 5yr',
    'Operating Margin% 10yr',
    'Operating Margin% TTM/5yr',
    'Operating Margin% TTM/10yr',
    'Operating Margin% SD 5yr',
    'Operating Margin% SD 10yr',

    'fcf Margin%',
    'fcf Margin% 3yr',
    'fcf Margin% 5yr',
    'fcf Margin% 10yr',
    'fcf Margin% TTM/5yr',
    'fcf Margin% TTM/10yr',
    'fcf Margin% SD 5yr',
    'fcf Margin% SD 10yr',

    'NetDebt/aEBITDA',
    'NetDebt/aEBITDA 3yr',
    'NetDebt/aEBITDA 5yr',
    'NetDebt/aEBITDA 10yr',
    'NetDebt/aEBITDA TTM/5yr',
    'NetDebt/aEBITDA TTM/10yr',
    'NetDebt/aEBITDA SD 5yr',
    'NetDebt/aEBITDA SD 10yr',

    'NetDebt/FCF',
    'NetDebt/FCF 3yr',
    'NetDebt/FCF 5yr',
    'NetDebt/FCF 10yr',
    'NetDebt/FCF TTM/5yr',
    'NetDebt/FCF TTM/10yr',
    'NetDebt/FCF SD 5yr',
    'NetDebt/FCF SD 10yr',
    'CapitalLeases/Debt',

    'CAPEX/Sales%',
    'CAPEX/Sales% 3yr',
    'CAPEX/Sales% 5yr',
    'CAPEX/Sales% 10yr',
    'CAPEX/Sales% TTM/5yr',
    'CAPEX/Sales% TTM/10yr',
    'CAPEX/Sales% SD 5yr',
    'CAPEX/Sales% SD 10yr',

    'CAPEX/OwnerEarnings%',
    'CAPEX/OwnerEarnings% 3yr',
    'CAPEX/OwnerEarnings% 5yr',
    'CAPEX/OwnerEarnings% 10yr',
    'CAPEX/OwnerEarnings% TTM/5yr',
    'CAPEX/OwnerEarnings% TTM/10yr',
    'CAPEX/OwnerEarnings% SD 5yr',
    'CAPEX/OwnerEarnings% SD 10yr',

    'CAPEX/FCF%',
    'CAPEX/FCF% 3yr',
    'CAPEX/FCF% 5yr',
    'CAPEX/FCF% 10yr',
    'CAPEX/FCF% TTM/5yr',
    'CAPEX/FCF% TTM/10yr',
    'CAPEX/FCF% SD 5yr',
    'CAPEX/FCF% SD 10yr',

    'FCF/Net Income%',
    'FCF/Net Income% 3yr',
    'FCF/Net Income% 5yr',
    'FCF/Net Income% 10yr',
    'FCF/Net Income% TTM/5yr',
    'FCF/Net Income% TTM/10yr',
    'FCF/Net Income% SD 5yr',
    'FCF/Net Income% SD 10yr',

    'FCF/OwnerEarning%',
    'FCF/OwnerEarning% 3yr',
    'FCF/OwnerEarning% 5yr',
    'FCF/OwnerEarning% 10yr',
    'FCF/OwnerEarning% TTM/5yr',
    'FCF/OwnerEarning% TTM/10yr',
    'FCF/OwnerEarning% SD 5yr',
    'FCF/OwnerEarning% SD 10yr',

    'Cash Conversion Cycle',
    'Cash Conversion Cycle 3yr',
    'Cash Conversion Cycle 5yr',
    'Cash Conversion Cycle 10yr',
    'Cash Conversion Cycle TTM/5yr',
    'Cash Conversion Cycle TTM/10yr',
    'Cash Conversion Cycle SD 5yr',
    'Cash Conversion Cycle SD 10yr',
    
    'Predictability Ranking',
    'Financial Strength',

    'Sales 1yr G',
    'Sales 3yr G',
    'Sales 5yr G',
    'Sales 10yr G',

    'Sales/Share G',
    'Sales/Share 3yr G',
    'Sales/Share 5yr G',
    'Sales/Share 10yr G',

    'OwnerEarnings/Share G',
    'OwnerEarnings/Share 3yr G',
    'OwnerEarnings/Share 5yr G',
    'OwnerEarnings/Share 10yr G',

    'FCF/Share G',
    'FCF/Share 3yr G',
    'FCF/Share 5yr G',
    'FCF/Share 10yr G',

    'aEBITDA/Share G',
    'aEBITDA/Share 3yr G',
    'aEBITDA/Share 5yr G',
    'aEBITDA/Share 10yr G',

    'Dividend/Share G',
    'Dividend/Share 3yr G',
    'Dividend/Share 5yr G',
    'Dividend/Share 10yr G',

    'Price 1yr G',
    'Price 3yr G',
    'Price 5yr G',
    'Price 10yr G',

    'SGR',
    'SGR 3yr',
    'SGR 5yr',
    'SGR 10yr',
    'SGR TTM/5yr',
    'SGR TTM/10yr',
    'SGR SD 5yr',
    'SGR SD 10yr',

    'Forward ROR(Yacktman)%',
    'Expected Annual TR',

    'BVPS in yr 10',
    'FCF/Share in yr 10',
    'Stock Price yr 10',
    'Avg Div Yield 10yr',
    'Projected 10 yr ROR',
    'Total Projected 10 yr ROR',

    'Shares Outstanding',
    'S/O Change (1Y)(%)',
    'S/O Change (3Y)(%)',
    'S/O Change (5Y)(%)',
    'S/O Change (10Y)(%)',
    
    'Dividend Payout Ratio%',
    'Dividend Payout Ratio% 3yr',
    'Dividend Payout Ratio% 5yr',
    'Dividend Payout Ratio% 10yr',
    'Dividend Payout Ratio% TTM/5yr',
    'Dividend Payout Ratio% TTM/10yr',
    'Dividend Payout Ratio% SD 5yr',
    'Dividend Payout Ratio% SD 10yr',

    'CF Re-Investment Rate 5yr',

    'EV/FCF',
    'EV/FCF 3yr',
    'EV/FCF 5yr',
    'EV/FCF 10yr',
    'EV/FCF TTM/5yr',
    'EV/FCF TTM/10yr',
    'EV/FCF SD 5yr',
    'EV/FCF SD 10yr',

    'FCF Yield',
    'FCF Yield 3yr',
    'FCF Yield 5yr',
    'FCF Yield 10yr',
    'FCF Yield TTM/5yr',
    'FCF Yield TTM/10yr',
    'FCF Yield SD 5yr',
    'FCF Yield SD 10yr',

    'Rule of 40',

    'FCF Spice',
    'FCF Spice 3yr',
    'FCF Spice 5yr',
    'FCF Spice 10yr',
    'FCF Spice TTM/5yr',
    'FCF Spice TTM/10yr',
    'FCF Spice SD 5yr',
    'FCF Spice SD 10yr',

    'aEBITDA Spice',
    'ROE Spice',

    ,'URBEM VALUE',
    ,'URBEM VALUE 3y',
    ,'URBEM VALUE 5y',

    'FCF/Employees',
    'FCF/Employees 3yr',
    'FCF/Employees 5yr',
    'FCF/Employees 10yr',

    'Purchase of Business',
    'Purchase of Business 3yr',
    'Purchase of Business 5yr',
    'Purchase of Business 10yr',
];

if(shareConf) {
    column_list.splice(2, 0, 'Owner')
    perm.push(8)
}
/**
 * Loops through columns and hides the undesired columns
 * @param {Integer} start 
 * @param {Integer} end 
 * @param {Integer} count 
 */
function hide_loop(start, end, count = 0) {
    $table.colReorder.reset();
    start -= 1;
    end += 1;
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

function keyStats() {
    hide_loop(0,0);
    $table.column(column_list.indexOf('Current Price')).visible(true, false);
    $table.column(column_list.indexOf('Aggregated')).visible(true, false);
    $table.column(column_list.indexOf('Categories')).visible(true, false);
    $table.column(column_list.indexOf('Enterprise Value (M)')).visible(true, false);
    $table.column(column_list.indexOf('Yield%')).visible(true, false);
    $table.column(column_list.indexOf('FCF Spice')).visible(true, false);
    $table.column(column_list.indexOf('FCF Yield')).visible(true, false);
    $table.column(column_list.indexOf('FCFROIC% 3yr')).visible(true, false);
    $table.column(column_list.indexOf('fcf Margin%')).visible(true, false);
    $table.column(column_list.indexOf('FCF/Share 5yr G')).visible(true, false);
    $table.column(column_list.indexOf('NetDebt/FCF')).visible(true, false);
    $table.column(column_list.indexOf('CAPEX/Sales% 3yr')).visible(true, false);
    $table.column(column_list.indexOf('FCF/Net Income% 3yr')).visible(true, false);
    $table.column(column_list.indexOf('S/O Change (5Y)(%)')).visible(true, false);
    $table.column(column_list.indexOf('Date')).visible(true, false);
    $table.column(column_list.indexOf('aEBITDA Spice')).visible(true, false);

    $table.colReorder.move(column_list.indexOf('Categories'), column_list.indexOf('Stock Name')+1)
    $table.colReorder.move(column_list.indexOf('Aggregated'), column_list.indexOf('Stock Name')+1)
    $table.colReorder.move(column_list.indexOf('aEBITDA Spice'), column_list.indexOf('FCF Spice')+2)

    $table.columns.adjust().draw(false);
}

function keyStats_Rest() {
    hide_loop(column_list.indexOf('Current Price'),
        column_list.indexOf('Aggregated'));
    $table.columns.adjust().draw(false);
}

function returnOnCapital() {
    hide_loop(column_list.indexOf('FCFROIC%'),
        column_list.indexOf('FCFROTA% SD 10yr'));
    $table.columns.adjust().draw(false);
}

function incrementalReturnOnCapital() {
    hide_loop(column_list.indexOf('iROiE% 3yr'),
        column_list.indexOf('CF Re-investment Rate SD 10yr'));
    $table.columns.adjust().draw(false);
}

function margins() {
    hide_loop(column_list.indexOf('Gross Margin%'),
        column_list.indexOf('fcf Margin% SD 10yr'));
    $table.columns.adjust().draw(false);
}

function financialHealth() {
    hide_loop(column_list.indexOf('NetDebt/aEBITDA'),
        column_list.indexOf('CapitalLeases/Debt'));
    $table.columns.adjust().draw(false);
}

function capitalIntensity() {
    hide_loop(column_list.indexOf('CAPEX/Sales%'),
        column_list.indexOf('CAPEX/FCF% SD 10yr'));
    $table.columns.adjust().draw(false);
}

function cashGeneration() {
    hide_loop(column_list.indexOf('FCF/Net Income%'),
        column_list.indexOf('Cash Conversion Cycle SD 10yr'));
    $table.columns.adjust().draw(false);
}

function guru() {
    hide_loop(column_list.indexOf('Predictability Ranking'),
        column_list.indexOf('Financial Strength'));
    $table.columns.adjust().draw(false);
}

function growth() {
    hide_loop(column_list.indexOf('Sales 1yr G'),
        column_list.indexOf('Price 10yr G'));
    $table.columns.adjust().draw(false);
}

function futureGrowth() {
    hide_loop(column_list.indexOf('SGR'),
        column_list.indexOf('Expected Annual TR'));
    $table.columns.adjust().draw(false);
}

function projectedRor() {
    hide_loop(column_list.indexOf('BVPS in yr 10'),
        column_list.indexOf('Total Projected 10 yr ROR'));
    $table.columns.adjust().draw(false);
}

function capitalAllocation() {
    hide_loop(column_list.indexOf('Shares Outstanding'),
        column_list.indexOf('CF Re-Investment Rate'));
    $table.columns.adjust().draw(false);
}

function valuation() {
    hide_loop(column_list.indexOf('EV/FCF'),
        column_list.indexOf('ROE Spice'));
    $table.columns.adjust().draw(false);
}

function random() {
    hide_loop(column_list.indexOf('FCF/Employees'),
        column_list.indexOf('Purchase of Business 10yr'));
    $table.columns.adjust().draw(false);
}