const perm = [0,1,2,3,4,5,6,7]

var column_list = [  'check',
            'symbol',
            'owner',
            'graph',
            'edit',
            'calc',
            'historic',
            'stockname',
            'marketcap',
            'sector',
            'aebitdaspice',
            'currentprice',
            'yield',
            
            'comment',
            'emoticon',

            'date',
            'sharesoutstanding',
            'enterprisevalue',
            'Revenue',
            'aebitda',
            'aebitda/share',
            'aebitda%',
            'assetturn',
            'aebitaat',
            'ev/aebitda',
            'netdebt',
            'nd/aebitda',
            'roe',
            'roespice',
            'effectivetaxrate',

            'gururating',
            'jdvrating',
            'msmoatrating',
            'msfvest',
            'ms5*price',
            'ms51price',
            
            'eps',
            'growthyears',
            'growth%5y',
            'growth%10y',
            'growth%15y',
            'terminalyears',
            'terminalgrowth%',
            'discountrate',
            'growthvalue5y',
            'terminalvalue5y',
            'dcffairvalue5y',
            'growthvalue10y',
            'terminalvalue10y',
            'dcffairvalue10y',
            'growthvalue15y',
            'terminalvalue15y',
            'dcffairvalue15y',
            
            'fcf', 
            'fcfyield', 
            'fcfgrowth1y', 
            'fcfgrowth3y', 
            'fcfgrowth5y', 
            'fcfgrowth10y', 
            'capex', 
            'capex/fcf5y', 
            'capex/fcf10y', 
            'capex/aebitda', 
            'capex/aebitda5y', 
            'capex/aebitda10y', 
            
            'fcf/aebitda', 
            'pricegrowth1y', 
            'pricegrowth3y', 
            'pricegrowth5y', 
            'pricegrowth10y', 
            's/ochange1y', 
            's/ochange3y', 
            's/ochange5y', 
            's/ochange10y', 
            'revenuegrowth1y', 
            'revenuegrowth3y', 
            'revenuegrowth5y', 
            'revenuegrowth10y', 
            'aebitdagrowth1y', 
            'aebitdagrowth3y', 
            'aebitdagrowth5y', 
            'aebitdagrowth10y', 
            'roic%', 
            'wacc%', 
            'roic-wacc', 
            ]

            console.log(column_list.length)

function hide_loop(start, end, count=0){
    for (let i = count; i < total_columns; i++){
        if(i >= end || i <= start){
            if(perm.indexOf(i)==-1){
                $table.column(i).visible(false, false)
            }
        }

        else{
            $table.column(i).visible(true, false)
        }
    }
}

function show_all(){
    hide_loop(0,total_columns)
    $table.columns.adjust().draw(false)
}

function basic_stats(){
    hide_loop(column_list.indexOf('marketcap')-1, 
        column_list.indexOf('effectivetaxrate')+1)
    $table.columns.adjust().draw(false)
}

function basic_info(){
    hide_loop(column_list.indexOf('marketcap')-1,
         column_list.indexOf('date') +1)
    $table.columns.adjust().draw(false)
}

function financials(){
    hide_loop(column_list.indexOf('enterprisevalue')-1,
        column_list.indexOf('effectivetaxrate') +1)
    $table.columns.adjust().draw(false)
}

function show_dcf(){
    hide_loop(column_list.indexOf('eps')-1,
    column_list.indexOf('dcffairvalue15y') +1)
    $table.columns.adjust().draw(false)
}

function all_growth(){
    hide_loop(column_list.indexOf('fcf')-1,
    column_list.indexOf('fcfgrowth10y') +1)
    hide_loop(column_list.indexOf('pricegrowth1y')-1,
    column_list.indexOf('aebitdagrowth10y') +1, 50)
    $table.columns.adjust().draw(false)
}

function fcf_growth(){
    hide_loop(column_list.indexOf('fcf')-1,
    column_list.indexOf('fcfgrowth10y') +1)
    hide_loop(column_list.indexOf('fcf/aebitda')-1,
    column_list.indexOf('fcf/aebitda') +1, 50)
    $table.columns.adjust().draw(false)
}

function price_growth(){
    hide_loop(column_list.indexOf('pricegrowth1y')-1,
    column_list.indexOf('pricegrowth10y') +1)
    $table.columns.adjust().draw(false)
}

function so_growth(){
    hide_loop(column_list.indexOf('s/ochange1y')-1,
    column_list.indexOf('s/ochange10y') +1)
    $table.columns.adjust().draw(false)
}

function rev_growth(){
    hide_loop(column_list.indexOf('revenuegrowth1y')-1,
    column_list.indexOf('revenuegrowth10y') +1)
    $table.columns.adjust().draw(false)
}

function ae_growth(){
    hide_loop(column_list.indexOf('aebitdagrowth1y')-1,
    column_list.indexOf('aebitdagrowth10y') +1)
    $table.columns.adjust().draw(false)
}

function asset_light(){
    hide_loop(column_list.indexOf('capex')-1,
    column_list.indexOf('fcf/aebitda') +1)
    $table.columns.adjust().draw(false)
}

function capex(){
    hide_loop(column_list.indexOf('capex')-1,
    column_list.indexOf('capex/aebitda10y') +1)
    $table.columns.adjust().draw(false)
}

function profitability(){
    hide_loop(column_list.indexOf('roic%')-1,
    total_columns)
    $table.columns.adjust().draw(false)
}

