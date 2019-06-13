const perm = [0,1,2,3,4,5]

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
    hide_loop(6, 27)
    $table.columns.adjust().draw(false)
}

function basic_info(){
    hide_loop(6, 13)
    $table.columns.adjust().draw(false)
}

function financials(){
    hide_loop(13, 27)
    $table.columns.adjust().draw(false)
}

function show_dcf(){
    hide_loop(26, 44)
    $table.columns.adjust().draw(false)
}

function all_growth(){
    hide_loop(43, 50)
    hide_loop(56, 73, 50)
    $table.columns.adjust().draw(false)
}

function fcf_growth(){
    hide_loop(43,50)
    hide_loop(55,57, 50)
    $table.columns.adjust().draw(false)
}

function price_growth(){
    hide_loop(56,61)
    $table.columns.adjust().draw(false)
}

function so_growth(){
    hide_loop(60,65)
    $table.columns.adjust().draw(false)
}

function rev_growth(){
    hide_loop(64,69)
    $table.columns.adjust().draw(false)
}

function ae_growth(){
    hide_loop(68,73)
    $table.columns.adjust().draw(false)
}

function asset_light(){
    hide_loop(49,57)
    $table.columns.adjust().draw(false)
}

function test(){
hide_loop(49,57)
$table.columns.adjust().draw(false)
}