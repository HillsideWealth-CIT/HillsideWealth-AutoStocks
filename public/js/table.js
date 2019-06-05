var columns = ["checkbox","hide","symbol","3","aebitda_spice","comment","emoticon","gfrating","stocksector","stock_current_price","fairvalue","fivestar","onestar","moat","jdv","roic_format","wacc_format","roicwacc_format","eps_without_nri_format","eps_growth_rate","eps_growth_rate_10y","eps_growth_rate_15y","terminal_growth_rate_format","discount_rate_format","terminal_years_format","growth_years_format","dcf_growth_5y","dcf_terminal_5y","dcf_fair_5y","dcf_growth_10y","dcf_terminal_10y","dcf_fair_10y","dcf_growth_15y","dcf_terminal_15y","dcf_fair_15y","yield_format","price_format","shares_outstanding_format","market_cap_format","capex_format","capeXfcf_format","capXfcf5","capXfcf10","capeXae_format","capXae5","capXae10","aeXsho_format","fcfXae_format","net_debt_format","enterprise_value_format","nd_aebitda","revenue_format","aebitda_format","aebitda_percent","asset_turnover","aebitda_at","roe_format","effective_tax_format","ev_aebitda","roe_spice","fcf_format","fcf_yield","fcf_growth_1","fcf_growth_3","fcf_growth_5","fcf_growth_10","price_growth_1","price_growth_3","price_growth_5","price_growth_10","so_change_1","so_change_3","so_change_5","so_change_10","revenue_growth_1","revenue_growth_3","revenue_growth_5","revenue_growth_10","aebitda_growth_1","aebitda_growth_3","aebitda_growth_5","aebitda_growth_10","datestring"]
var permanent_col = ['checkbox', 'hide', 'symbol', "datestring"]
var $table = $('#table')
var hidden_id = [];
var hide = false;

$( document ).ready(function(){
    select_dcf();
}) 

/**
 * Creates a sweetalert2 popup that displays table column options
 */
function config() {
    Swal.fire({
        title: 'Select a configuration',
        input: 'select',
        showCancelButton: true,
        inputOptions: {
            'Show All': 'Show All',
            'Basic Info': 'Basic Info',
            'MS/Guru': 'MS/Guru',
            'Current Price/ MS FV Est': 'Current Price/ MS FV Est',
            'Financials': 'Financials',
            'FCF & FCF Growth': 'FCF & FCF Growth',
            'Price Growth': 'Price Growth',
            'Revenue Growth': 'Revenue Growth',
            'aEBITDA Growth': 'aEBITDA Growth',
            'DCF': 'DCF',
        },
        preConfirm: (inputText) => {
            config_man(inputText);
        }
    })
}

/**
 * Reads user input and gets the correct function to display the correct columns
 * @param {String} input_text - what the user inputs
 */
function config_man(input_text) {
    console.log(input_text)
    switch (input_text) {
        case 'Show All':
            show_all();
            break;
        case 'Basic Info':
            basic();
            break;
        case 'MS/Guru':
            msguru();
            break;
        case 'Current Price/ MS FV Est':
            curoic();
            break;
        case 'Financials':
            financials();
            break;
        case 'FCF & FCF Growth':
            fcf();
            break;
        case 'Price Growth':
            priceg();
            break;
        case 'Revenue Growth':
            revg();
            break;
        case 'aEBITDA Growth':
            aebitdag();
            break;
        case 'DCF':
            select_dcf();
            break;
    }
    if(hide == true){
        hiderows();
    }

}

/**
 * Loops through the list of all headers and hides any that arent on col_list
 * @param {Array} col_list - list of column names
 */
function loopthrough(col_list) {
    for (i in columns) {
        if (col_list.indexOf(columns[i]) != -1 || permanent_col.indexOf(columns[i]) != -1) {
            $table.bootstrapTable('showColumn', `${columns[i]}`)
        }
    }
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function basic() {
    reset();
    let to_show = ['aebitda_spice', '3','stocksector', 'stock_current_price', 'yield_format', 'market_cap_format', 'jdv', 'emoticon']
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function msguru() {
    reset();
    let to_show = ['gfrating', 'moat', 'fairvalue', 'fivestar', 'onestar'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function curoic() {
    reset();
    let to_show = ['stock_current_price', 'roic_format', 'wacc_format', 'roicwacc_format'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function financials() {
    reset();
    let to_show = ['shares_outstanding_format', 'revenue_format', 'enterprise_value_format', 'nd_aebitda', 'aebitda_format', 'aebitda_percent', 'asset_turnover', 'aebitda_at', 'roe_format', 'capeXfcf_format', 'capXfcf5', 'capXfcf10', 'capeXae_format', 'capXae5', 'capXae10', 'roe_format', 'capex_format', 'fcf_format', 'fcf_yield', 'effective_tax_format'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function fcf() {
    reset();
    let to_show = ['fcf_format', 'capXfcf_format', 'fcf_yield', 'fcf_growth_1', 'fcf_growth_3', 'fcf_growth_5', 'fcf_growth_10'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function priceg() {
    reset();
    let to_show = ['price_format', 'price_growth_1', 'price_growth_3', 'price_growth_5', 'price_growth_10'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function revg() {
    reset();
    let to_show = ['revenue_format', 'revenue_growth_1', 'revenue_growth_3', 'revenue_growth_5', 'revenue_growth_10'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function aebitdag() {
    reset();
    let to_show = ['aebitda_format', 'aebitda_growth_1', 'aebitda_growth_3', 'aebitda_growth_5', 'aebitda_growth_10'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function select_dcf() {
    reset();
    let to_show = ['eps_growth_rate', 'eps_growth_rate_10y', 'eps_growth_rate_15y', 'growth_years_format', 'eps_without_nri_format', 'terminal_years_format', 'terminal_growth_rate_format', 'discount_rate_format', 'dcf_growth_5y', , 'dcf_terminal_5y', 'dcf_fair_5y', 'dcf_growth_10y', 'dcf_terminal_10y', 'dcf_fair_10y', 'dcf_growth_15y', 'dcf_termainl_15y', 'dcf_fair_15y'];
    loopthrough(to_show)
}

/**
 * Configuration that displays all avaialble table columns
 */
function show_all() {
    $table.bootstrapTable('showAllColumns')
}
/**
 * Hides all columns once a configuration column is called
 */
function reset() {
    $table.bootstrapTable('hideAllColumns')
}

/**
 * Hides rows that the user selects
 */
function hiderows() {
    $("#table #db_stocks input:checked").each(function() {
        var sym = $(this).parents('tr:first').attr('id')
        rm_list.push(sym.toString());
        $(this).prop("checked", false);
    });
    console.log(rm_list)

    $("#table #db_stocks input:not(checked)").each(function(){
        der = $(this).parents('tr:first').attr('id')
        console.log(der)
        if(rm_list.indexOf(der) == -1){
            hidden_id.push(der)
            $(this).parents('tr:first').hide();
        }
    })
    hide = true;
    rm_list = [];
}

/**
 * Shows all hidden rows
 */
function showrows(){
    for(id in hidden_id){
        $(`#${hidden_id[id]}`).show();
    }
    hide = false;
}

/**
 * selects which function would be ran
 */
function show_selected(){
    if(hide == false){
        hiderows();
    }
    else{
        showrows();
    }
}


function makecolumn_arr(){
    let list = [];
    $("#table th").each(function(head){
        list.push($(this).attr('data-field'))
    })
    alert(JSON.stringify(list))
}

