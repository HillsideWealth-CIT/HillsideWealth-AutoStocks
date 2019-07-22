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

/**
 * Selected stocks get removed from the database
 */
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

/**
 * Updates All selected stocks
 * @param {String} link 
 */
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

function createAggregation(){
    console.log("creating aggregation")
    let to_send = {};
    Swal.fire({
        title: 'Create Aggregation',
        showCancelButton: true,
        html:
            `
                <div class="row">
                    <div class="col">
                        <label for="nameform">Name</label>
                        <input id="nameForm" type="text" class="form-control">
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <label>Columns</label>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <label>Add [!] At The End For Descending</label>
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="col">
                        <input id="columnForm1" type="text" list="columnList" class="form-control">
                    </div>
                    <div class="col">
                        <input id="columnForm2" type="text" list="columnList" class="form-control">
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col">
                        <input id="columnForm3" type="text" list="columnList" class="form-control">
                    </div>
                    <div class="col">
                        <input id="columnForm4" type="text" list="columnList" class="form-control">
                    </div>
                </div>
            
            <div class="row mt-3">
                <div class="col">
                    <input id="columnForm5" type="text" list="columnList" class="form-control">
                </div>
                <div class="col">
                    <input id="columnForm6" type="text" list="columnList" class="form-control">
                </div>
            </div>
        
        
            <div class="row mt-3">
                <div class="col">
                    <input id="columnForm7" type="text" list="columnList" class="form-control">
                </div>
                <div class="col">
                    <input id="columnForm8" type="text" list="columnList" class="form-control">
                </div>
            </div>
        
        
            <div class="row mt-3">
                <div class="col">
                    <input id="columnForm9" type="text" list="columnList" class="form-control">
                </div>
                <div class="col">
                    <input id="columnForm10" type="text" list="columnList" class="form-control">
                </div>
            </div>

        ${createColumnList()}
            `,
    }).then((result) => {
        if (!result.dismiss) {
            to_send.name = document.getElementById('nameForm').value
            to_send.columns = []
            for(i of 10){
                if(document.getElementById(`columnForm${i+1}`).value != ""){
                to_send.columns.push(document.getElementById(`columnForm${i+1}`).value)
                }
            }
            fetch('/aggregation/create', {
                method: 'POST',
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(to_send)
            }).then(response => response.json())
            .then(data => {
                console.log(data)
            })
        }
    })
}

function createColumnList(){
    let optionString = '<datalist id="columnList">'
    let tableList = document.getElementById('headerRow').childNodes
    for (let i = 0; i < tableList.length; i++){
        if (tableList[i].innerHTML != ''){
            optionString += `<option value="${tableList[i].innerHTML}">`
        }
    }
    return `${optionString}</datalist>`
}

function settingAggregation(){
    console.log('setting Aggregation')
}