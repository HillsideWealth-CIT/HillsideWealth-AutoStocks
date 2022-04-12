const perm = [0, 1, 2, 3, 4, 5];

var column_list = ['check',
    'owner',
    'Symbol',
    'Edit Buttons',
    'Stock Name',
    'Date',
    'Aggregated',
    'Current Price',
    'Premium/Discount To FV',

    'FCFROIC% 5yr',
    'FCFROTA% 5yr',
    'iROiE% 1yr',
    'iROiE% 3yr',
    'iROiE% 5yr',
    'iROiE% 10yr',
    'iROiE% 3yr 1',
    'iROiE% 3yr 2',
    'iROiE% 3yr 3',
    'iROiE% 3yr 4',
    'iROiE% 3yr 5',
    'iROiE% 5yr 1',
    'iROiE% 5yr 2',
    'iROiE% 5yr 3',

    'CF Re-investment Rate 3yr',
    'CF Re-investment Rate 5yr',
    'S/O Change (5Y)(%)',
    'Dividend Payout Ratio% 5yr',

    'Gross Margin% 5yr',
    'Operating Margin% 5yr',
    'FCF Margin% 5yr',

    'CAPEX/Sales% 5yr',
    'D/E (LFY)',
    'CapitalLeases/Debt',
    'Goodwill% TTM',

    'Flow Ratio TTM',
    'Flow Ratio 5Yr',
    'FCF/Net Income% 5yr',
    'Cash Conversion Cycle 5yr',

    'OwnerCashEarnings (LFY)',
    'OwnerCashEarnings Yield',
    'FCF Yield',
    'FCF Multiple TTM',
    'FV FCF Multiple',
    'FCF Yield Min',
    'FCF Yield Max',
    'FCF Yield 10yr',
    
    'Sales/Share 3yr G',
    'Sales/Share 5yr G',
    'FCF/Share 3yr G',
    'FCF/Share 5yr G',
];
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

function returns() {
    hide_loop(column_list.indexOf('FCFROIC% 5yr'),
        column_list.indexOf('iROiE% 5yr 3'));
    $table.columns.adjust().draw(false);
}

function capitalAllocation() {
    hide_loop(column_list.indexOf('CF Re-investment Rate 3yr'),
        column_list.indexOf('Dividend Payout Ratio% 5yr'));
    $table.columns.adjust().draw(false);
}

function margins() {
    hide_loop(column_list.indexOf('Gross Margin% 5yr'),
        column_list.indexOf('FCF Margin% 5yr'));
    $table.columns.adjust().draw(false);
}

function financialHealth() {
    hide_loop(column_list.indexOf('CAPEX/Sales% 5yr'),
        column_list.indexOf('Goodwill% TTM'));
    $table.columns.adjust().draw(false);
}

function cashGeneration() {
    hide_loop(column_list.indexOf('Flow Ratio TTM'),
        column_list.indexOf('Cash Conversion Cycle 5yr'));
    $table.columns.adjust().draw(false);
}

function valuation(){
    hide_loop(column_list.indexOf('FCF Yield'),
        column_list.indexOf('FCF Yield 10yr'));
    $table.columns.adjust().draw(false);
}

function growth() {
    hide_loop(column_list.indexOf('Sales/Share 3yr G'),
        column_list.indexOf('FCF/Share 5yr G'));
    $table.columns.adjust().draw(false);
}

function renameIroe() {
    for(let i = 1; i <= 5; i ++){
        $(`#iRoie3yr${i}`).text(`iROiE% ${date.getFullYear() - i}-${date.getFullYear() - (3 + i)}`) 
    }
    for(let i = 1; i <= 3; i++){
        $(`#iRoie5yr${i}`).text(`iROiE% ${date.getFullYear() - i}-${date.getFullYear() - (5 + i)}`)
    }
    $table.columns.adjust().draw(false);
}