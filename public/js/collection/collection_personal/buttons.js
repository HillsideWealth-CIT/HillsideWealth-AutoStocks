var update_counter = 0;
var to_update = [];

function add(){
    let stocks;
    Swal.fire({
        title: 'Add Stocks',
        text: 'Formats: American Stocks: [SYMBOL], Canadian stocks: [EXCHANGE:SYMBOL]',
        input: 'text',
        showCancelButton: true,
        confirmButtonText: 'Add Stocks',
        preConfirm: (result) => {
            let promises = []
            let stockstring = result.replace(/\s/g, "");
            stocks = stockstring.split(',')
        }
    }).then((result) => {
        if(!result.dismiss){
            Swal.fire({
            type: 'success',
            title: 'Currently Saving To Database!',
            showConfirmButton: false
        })
        adder_ajax(0, stocks.length, stocks, '/append')
        }
    })
};


function remove(){
    let to_remove = [];
    let selected = $table.rows('.selected').data()
    for( i in selected ){
        if(selected[i].symbol){
        to_remove.push(selected[i].symbol)
        }   
        else{
            break;
        }
    }
    ajax_Call(to_remove, '/remove').then((resolved) => {
        console.log(resolved)
            for(i in to_remove){
                console.log(i)
                $table.row(document.getElementById(`${to_remove[i]}`)).remove().draw()
            }
    })
};

function update(link){
    to_update = [];
    to_stock_id = []
    let selected = $table.rows('.selected').data()
    for( i in selected ){
        if(selected[i].symbol){
        to_update.push(selected[i].symbol)
        to_stock_id.push(selected[i].stock_id)

        }   
        else{
            break;
        }
    }

    console.log(to_update)
    console.log(to_stock_id)

    Swal.fire({
        position:'center',
        type: 'question',
        title: 'The selected stocks are currently being updated!',
        text: `Progress: ${update_counter}/${to_update.length}`,
        footer: 'This might take a while, you might want to do something else',
        showConfirmButton: false,
    });

    counter_ajax(0, to_update.length, to_update, to_stock_id, link)

};




