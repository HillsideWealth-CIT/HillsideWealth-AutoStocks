var update_counter = 0;
var to_update = [];

function add(){
    Swal.fire({
        title: 'Add Stocks',
        text: 'Formats: American Stocks: [SYMBOL], Canadian stocks: [EXCHANGE:SYMBOL]',
        input: 'text',
        showCancelButton: true,
        confirmButtonText: 'Add Stocks',
        preConfirm: (result) => {
            let promises = []
            let stockstring = result.replace(/\s/g, "");
            let stocks = stockstring.split(',')
            for(let i in stocks){
                if($(`#${stocks[i].toUpperCase()}`).length == 0) {
                    promises.push(ajax_Call([{'symbol': stocks[i].toUpperCase(), 'comment': '', 'company':'', 'exchange': ''}], '/append/shared'))
                }
            }
 
            Promise.all(promises).then((resolve) => {
                for(i in resolve){
                    $table.row.add(resolve[i].data[0]).draw();
                }
            })
            setTimeout(function(){
                swal.close()
            }, 5000)
            
        }
    }).then((result) => {
        if(!result.dismiss){
            Swal.fire({
            type: 'success',
            title: 'Currently Saving To Database!',
            showConfirmButton: false
        })
        }
    })
};

function remove(){
    let to_remove = [];
    let selected = $table.rows('.selected').data()
    for( i in selected ){
        if(selected[i].symbol){
            if(selected[i].username == $('#username').attr('user')){
                to_remove.push(selected[i].symbol)
            }
        }   
        else{
            break;
        }
    }
    console.log(to_remove)
    ajax_Call(to_remove, '/remove/shared').then((resolved) => {
        console.log(resolved)
            for(i in to_remove){
                console.log(i)
                $table.row(document.getElementById(`${to_remove[i]}`)).remove().draw()
            }
    })
};


