var update_counter = 0;
var to_update = [];

/**
 * Opens a sweetalert and adds all stocks user inputs
 */
function add(){
    let stocks;
    Swal.fire({
        title: 'Add Stocks',
        text: 'Formats: American Stocks: [SYMBOL], Canadian stocks: [EXCHANGE:SYMBOL]',
        input: 'text',
        showCancelButton: true,
        confirmButtonText: 'Add Stocks',
        preConfirm: (result) => {
            let stockstring = result.replace(/\s/g, "");
            stocks = stockstring.split(',');
        }
    }).then(async (result) => {
        if(!result.dismiss){
            Swal.fire({
            type: 'question',
            title: 'Currently Saving Stocks To Database!',
            text: `progress: 0/${stocks.length}`,
            showConfirmButton: false
        });
        for(let i in stocks){
            swal.update({
                text: `Progress: ${Number(i)+1}/${stocks.length} - Current: ${stocks[i].toUpperCase()}`
            })
            await ajax_request(stocks[i].toUpperCase())
        }
        Swal.update({
            type: 'success',
            text: 'Update Complete'
        });
        setTimeout(function () {
            Swal.close();
        }, 3000);
        return
        }
    });

    function ajax_request(symbol){
        return $.ajax({
            type: 'POST',
            url: '/append?table=shared',
            data: { action: [{ 'symbol': symbol, 'comment': '', 'company': '', 'exchange': '' }] },
            success: function (stockinfo) {
                console.log(stockinfo);
                try {
                    $table.row.add(stockinfo.data[0]).draw();
                }
                catch (e) {
                    console.log(e);
                }
            }
        });
    }
}

/**
 * Selected stocks get removed from the database
 */
function remove(){
    let to_remove = [];
    let row = [];
    let selected = $table.rows('.selected').data();
    for(let i in selected ){
        if(selected[i].symbol){
            console.log(selected[i])
            if(selected[i].username == $('#username').attr('user')){
                to_remove.push(selected[i].symbol);
                row.push(selected[i].stock_id)
            }
        }   
        else{
            break;
        }
    }
    ajax_Call(to_remove, '/remove?table=shared').then((resolved) => {
            for(let i in to_remove){
                console.log(i);
                $table.row(document.getElementById(`${row[0]}`)).remove().draw();
            }
    });
}

/**
 * Updates All selected stocks
 * @param {String} link 
 */
async function update(link){
    to_update = [];
    let selected = $table.rows('.selected').data();
    for(let i in selected ){
        if(selected[i].symbol){
        to_update.push({
            stock_id: selected[i].username,
            symbol: selected[i].symbol})
        }     
        else{
            break;
        }
    }

    Swal.fire({
        position:'center',
        type: 'question',
        title: 'The selected stocks are currently being updated!',
        text: `Progress: ${update_counter}/${to_update.length}`,
        footer: 'This might take a while, you might want to do something else',
        showConfirmButton: false,
    });

    for(let i = 0; i < to_update.length; i++){
        swal.update({ text: `Progress: ${i+1}/${to_update.length} - Current: ${to_update[i].symbol}` });
        await ajax_request(to_update[i], link)
    }
    Swal.update({
        type: 'success',
        text: 'Update Complete'
    });
    if(to_update.length >= 50){
        $table.destroy();
        $('tbody').empty();
        Initialize_table();
    }
    setTimeout(function () {
        Swal.close();
    }, 3000);
    return;

    function ajax_request(updateDict, link){
        return $.ajax({
            type: 'POST',
            url: link,
            data: { action: [updateDict] },
            success: function (resolved) {
                try {
                    $table.row(document.getElementById(`${resolved.data[0].symbol}`)).data(resolved.data[0]).invalidate();
                }
                catch (e) {
                    console.log(e)
                }
            }
        });
    }

}