const perm = [0, 1, 2, 3, 4, 5, 6, 7];

var column_list = ['check',
    'Symbol',
    'Graph',
    'Edit',
    'Calc',
    'Historic',
    'links',
    'Stock Name',
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
    'Date',
    'Aggregated',

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

    'Incremental Roe 3yr',
    'Incremental Roe 5yr',
    'Incremental Roe 10yr',

    'Incremental Roic 3yr',
    'Incremental Roic 5yr',
    'Incremental Roic 10yr',

    'Incremental JDVROIC 3yr',
    'Incremental JDVROIC 5yr',
    'Incremental JDVROIC 10yr',
    
    'CF Re-investment Rate',

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

    'Price',
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

    'CF Re-Investment Rate',

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
    hide_loop(column_list.indexOf('Current Price'),
        column_list.indexOf('Aggregated'));
    $table.columns.adjust().draw(false);
}

function returnOnCapital() {
    hide_loop(column_list.indexOf('FCFROIC%'),
        column_list.indexOf('FCFROCE% SD 10yr'));
    $table.columns.adjust().draw(false);
}

function incrementalReturnOnCapital() {
    hide_loop(column_list.indexOf('Incremental Roe 3yr'),
        column_list.indexOf('CF Re-investment Rate'));
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