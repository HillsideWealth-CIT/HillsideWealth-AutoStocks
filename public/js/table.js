var columns = ['checkbox', 'hide', 'eps','gy','gp','ty','tg','dp','dcf_growth','dcf_terminal','dcf_fair','symbol', 'spice', 'comment', 'emoji','rating','sector','curprice','msfv','msfive','msone','moat','jdv','roic','wacc','roicwacc','yield','price','shares','cap', 'capex', 'capXfcf','capXae', 'aEXshar','netdebt','enterp','nd','revenue','aebitda','aebitdapercent','asset','at','roe','tax','ev','roespice','fcf','fcfyield','fcfone','fcfthree','fcffive', 'fcften','pgone','pgthree', 'pgfive', 'pgten', 'soone', 'sothree', 'sofive', 'soten','rgone','rgthree','rgfive','rgten','agone','agthree','agfive','agten', 'date']
var permanent_col = ['checkbox', 'hide', 'symbol', 'date']
var $table = $('#table')

$( document ).ready(function() {
    select_dcf();
})

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
            'Financials':'Financials',
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

function config_man(input_text){
    console.log(input_text)
    switch(input_text){
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
    
}

function loopthrough(col_list){
    for (i in columns){
        if (col_list.indexOf(columns[i]) != -1 || permanent_col.indexOf(columns[i]) != -1){
            $table.bootstrapTable('showColumn', `${columns[i]}`)
        }
    }
}

function basic(){
    reset();
    let to_show = ['spice', 'sector','price', 'yield','cap', 'jdv', 'emoji']
    loopthrough(to_show)
}

function msguru(){
    reset();
    let to_show = ['rating','moat','msfv','msfive','msone'];
    loopthrough(to_show)
}

function curoic(){
    reset();
    let to_show = ['curprice', 'roic','wacc','roicwacc'];
    loopthrough(to_show)
}

function financials(){
    reset();
    let to_show = ['shares','revenue', 'enterp', 'nd','aebitda','aebitdapercent','asset','at','roe','capXfcf','roespice','capex','fcf','fcfyield','tax'];
    loopthrough(to_show)
}

function fcf(){
    reset();
    let to_show = ['fcf','capXfcf','fcfyield','fcfone','fcfthree','fcffive','fcften'];
    loopthrough(to_show)
}

function priceg(){
    reset();
    let to_show = ['price','pgone','pgthree','pgfive','pgten'];
    loopthrough(to_show)
}

function revg(){
    reset();
    let to_show = ['revenue','rgone','rgthree','rgfive','rgten'];
    loopthrough(to_show)
}

function aebitdag(){
    reset();
    let to_show = ['aebitda','agone','agthree','agfive','agten'];
    loopthrough(to_show)
}

function select_dcf(){
    reset();
    let to_show = ['eps','gy','gp','ty','tg','dp','dcf_growth','dcf_terminal','dcf_fair'];
    loopthrough(to_show)
}





function show_all(){
    $table.bootstrapTable('showAllColumns')
}

function reset(){
        $table.bootstrapTable('hideAllColumns')
}