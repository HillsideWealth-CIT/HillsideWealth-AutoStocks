const perm = [0,1,2,3,4,5,6]

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
    hide_loop(7, 28)
    $table.columns.adjust().draw(false)
}

function basic_info(){
    hide_loop(7, 14)
    $table.columns.adjust().draw(false)
}

function financials(){
    hide_loop(14, 28)
    $table.columns.adjust().draw(false)
}

function show_dcf(){
    hide_loop(27, 45)
    $table.columns.adjust().draw(false)
}

function all_growth(){
    hide_loop(44, 51)
    hide_loop(57, 74, 50)
    $table.columns.adjust().draw(false)
}

function fcf_growth(){
    hide_loop(44,55)
    hide_loop(56,58, 50)
    $table.columns.adjust().draw(false)
}

function price_growth(){
    hide_loop(57,62)
    $table.columns.adjust().draw(false)
}

function so_growth(){
    hide_loop(61,66)
    $table.columns.adjust().draw(false)
}

function rev_growth(){
    hide_loop(65,70)
    $table.columns.adjust().draw(false)
}

function ae_growth(){
    hide_loop(69,74)
    $table.columns.adjust().draw(false)
}

function asset_light(){
    hide_loop(50,58)
    $table.columns.adjust().draw(false)
}

function capex(){
    hide_loop(50,57)
    $table.columns.adjust().draw(false)
}

function profitability(){
    hide_loop(73, total_columns)
    $table.columns.adjust().draw(false)
}

