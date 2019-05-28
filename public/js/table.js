var columns = ['checkbox', 'hide', 'eps', 'gy', 'gp', 'ty', 'tg', 'dp', 'dcf_growth', 'dcf_terminal', 'dcf_fair', 'symbol', 'spice', 'comment', 'emoji', 'rating', 'sector', 'curprice', 'msfv', 'msfive', 'msone', 'moat', 'jdv', 'roic', 'wacc', 'roicwacc', 'yield', 'price', 'shares', 'cap', 'capex', 'capXfcf', 'capXae', 'aEXshar', 'netdebt', 'enterp', 'nd', 'revenue', 'aebitda', 'aebitdapercent', 'asset', 'at', 'roe', 'tax', 'ev', 'roespice', 'fcf', 'fcfyield', 'fcfone', 'fcfthree', 'fcffive', 'fcften', 'pgone', 'pgthree', 'pgfive', 'pgten', 'soone', 'sothree', 'sofive', 'soten', 'rgone', 'rgthree', 'rgfive', 'rgten', 'agone', 'agthree', 'agfive', 'agten', 'date']
var permanent_col = ['checkbox', 'hide', 'symbol', 'date']
var $table = $('#table')
var hidden_id = [];
var hide = false;

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
    let to_show = ['spice', 'sector', 'price', 'yield', 'cap', 'jdv', 'emoji']
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function msguru() {
    reset();
    let to_show = ['rating', 'moat', 'msfv', 'msfive', 'msone'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function curoic() {
    reset();
    let to_show = ['curprice', 'roic', 'wacc', 'roicwacc'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function financials() {
    reset();
    let to_show = ['shares', 'revenue', 'enterp', 'nd', 'aebitda', 'aebitdapercent', 'asset', 'at', 'roe', 'capXfcf', 'roespice', 'capex', 'fcf', 'fcfyield', 'tax'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function fcf() {
    reset();
    let to_show = ['fcf', 'capXfcf', 'fcfyield', 'fcfone', 'fcfthree', 'fcffive', 'fcften'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function priceg() {
    reset();
    let to_show = ['price', 'pgone', 'pgthree', 'pgfive', 'pgten'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function revg() {
    reset();
    let to_show = ['revenue', 'rgone', 'rgthree', 'rgfive', 'rgten'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function aebitdag() {
    reset();
    let to_show = ['aebitda', 'agone', 'agthree', 'agfive', 'agten'];
    loopthrough(to_show)
}

/**
 * Configuration that hides all columns but the columns in to show
 */
function select_dcf() {
    reset();
    let to_show = ['eps', 'gy', 'gp', 'ty', 'tg', 'dp', 'dcf_growth', 'dcf_terminal', 'dcf_fair'];
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

