var update_counter = 0;
var rm_list = [];
/** Send stocks to server using ajax and displays sweet alerts*/
function add(){
    Swal.fire({
        title: 'Add Stocks',
        text: 'Formats: American Stocks: [SYMBOL], Canadian stocks: [EXCHANGE:SYMBOL]',
        input: 'text',
        showCancelButton: true,
        confirmButtonText: 'Add Stocks',
        preConfirm: (result) => {
            let send = []
            let stockstring = result.replace(/\s/g, "");
            let stocks = stockstring.split(',')
            for(let i in stocks){
                send.push({'symbol': stocks[i].toUpperCase(), 'comment': '', 'company':'', 'exchange': ''})
            }
            ajax_func(send, 'Append').then((resolved) => {
                console.log(format_returned(resolved))
                
                //location.reload();
            })
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

/** Send stocks to server using ajax, removes stocks from database and displays sweet alerts*/
function remove() {
    $("#table #db_stocks input:checked").each(function() {
        var sym = $(this).parents('tr:first').data('val')
        rm_list.push({"symbol" : sym.toString()});
        //$(`#${sym.toString()}`).remove();
    });
    Swal.fire({
        position:'center',
        type: 'success',
        title: 'The selected stocks are currently being removed!',
        text: 'The page will reload shortly.',
        showConfirmButton: false,
    });
    ajax_func(rm_list, 'Remove').then((resolved) => {
        location.reload()
    })
    rm_list = [];
};
/** Send stocks to server using ajax and updates the database entries, shows sweet alerts*/
function update() {
    update_counter = 0;
    $("#table #db_stocks input:checked").each(function() {
        var sym = $(this).parents('tr:first').data('val')
        rm_list.push({"symbol" : sym.toString()});
    });
    let promises = [];

    Swal.fire({
        position:'center',
        type: 'question',
        title: 'The selected stocks are currently being updated!',
        text: 'Progress will be shown here',
        footer: 'This might take a while, you might want to do something else',
        showConfirmButton: false,
    });

    for(sym in rm_list){
        promises.push(ajax_func([rm_list[sym]], 'Update', false))
    }

    Promise.all(promises)
    .then((resolve) => {
        swal.update({
            type: 'success',
            title: 'Refresh Completed',
            text: 'This page will reload in three seconds'
        });
        rm_list = [];
        setTimeout(function(){
            location.reload();
                }, 3000);
    })
    
    //ajax_func(rm_list, 'Update');
};

function share() {
    update_counter = 0;
    $("#table #db_stocks input:checked").each(function() {
        var sym = $(this).parents('tr:first').data('val')
        rm_list.push({"symbol" : sym.toString()});
    });
    let promises = [];

    Swal.fire({
        position:'center',
        type: 'question',
        title: 'The selected stocks are currently being shared!',
        text: 'Progress will be shown here',
        showConfirmButton: false,
    });

    for(sym in rm_list){
        promises.push(ajax_func(rm_list[sym], 'Share', false))
    }

    Promise.all(promises)
    .then((resolve) => {
        swal.update({
            type: 'success',
            title: 'Sharing Completed',
            text: 'This page will reload in three seconds'
        });
        rm_list = [];
        setTimeout(function(){
            location.reload();
                }, 3000);
    })
    
    //ajax_func(rm_list, 'Update');
};

/**
 * Refreshes the following columns
 * [current price, gurufocus rating]
 */
function refresh_prices(){
    update_counter = 0;
    $("#table #db_stocks input:checked").each(function() {
        var sym = $(this).parents('tr:first').data('val')
        rm_list.push({"symbol" : sym.toString()});
    });
    Swal.fire({
        position:'center',
        type: 'question',
        title: 'The selected stocks are currently being updated!',
        text: 'Progress will be shown here',
        footer: 'This might take a while, you might want to do something else',
        showConfirmButton: false,
    });
    //console.log(rm_list)
    let promises = [];
    for (sym in rm_list){
        //console.log(rm_list[sym])
        promises.push(ajax_func([rm_list[sym]],'Update_Prices',false))
    }

    Promise.all(promises)
    .then((resolve) => {
        swal.update({
            type: 'success',
            title: 'Refresh Completed',
            text: 'This page will reload in two seconds'
        });
        rm_list = [];
        setTimeout(function(){
            location.reload();
        }, 2000)
    })

}


/**
 * alter all selected dfc columns and calculations
 * sends formatted json to server
 */
function multi_dfc() {
    let dfc_list = [];
    let send = {};
    $("#table #db_stocks input:checked").each(function() {
        var sym = $(this).parents('tr:first').attr('id')
        dfc_list.push(sym.toString());
    });
    if(dfc_list.length != 0){
        multi_dfc_calc().then((result) => {
            ajax_func({list: dfc_list, values: result}, 'DFC', false).then((resolve) => {
                location.reload();
            })
        })
    }
    else {
        alert("Requires at least one row selected")
    }
}
/**
 * Creates an alert with input fields
 * @returns {JSON} formatted json data of all inputs
 */
function multi_dfc_calc(){
    return new Promise ((resolve, reject) => {
    let user_input = {};
    swal.fire({
        title: 'DCF INPUTS',
        showConfirmButton: true,
        showCancelButton: true,
        html:
            `<div class="row">
                <div class="col">
                    <label for="eps_form">EPS ($)</label>
                    <input id="eps_form" type="text" class="form-control" value = "1">
                </div>
                <div class="col">
                    <label for="gr_form">Growth Rate (%)</label>
                    <input id="gr_form" type="text" class="form-control" value="0.095">
                </div>        
            </div>
            <div class="row">
                <div class="col">
                    <label for="tgr_form">Terminal Growth Rate (%)</label>
                    <input id="tgr_form" type="text" class="form-control" value="0.04">
                </div>
                <div class="col">
                    <label for="dr_form">Discount Rate(%)</label>
                    <input id="dr_form" type="text" class="form-control" value="0.12">
                </div>        
            </div>
            <div class="row">
                <div class="col">
                    <label for="gy_form">Growth Years</label>
                    <input id="gy_form" id="eps_form" type="text" class="form-control" value="10">
                </div>
                <div class="col">
                    <label for="ty_form">Terminal Years</label>
                    <input id="ty_form" type="text" class="form-control" value="10">
                </div>        
            </div>
            `,
        }).then((result) => {
            if(result.value == true){
                user_input.eps = $('#eps_form').val();
                user_input.gr = $('#gr_form').val();
                user_input.tgr = $('#tgr_form').val();
                user_input.dr = $('#dr_form').val();
                user_input.gy = $('#gy_form').val();
                user_input.ty = $('#ty_form').val();
                resolve(user_input);
            }
        })
    })
}

/**
 * Remotes extra characters in a string and leavs the numbers to be used to compare
 * @param {String} a 
 * @param {String} b 
 * @returns {int} deterines if a is bigger than b or not
 */
function currencysorter(a, b) {
    if(a == 'Infinity%' || a == 'NaN%' || a == '-Infinity' || a=='Missing Required information to format'){
        a = '100000.0%'
    }
    if(b == 'Infinity%' || b == 'NaN%' || b == '-Infinity' || b=='Missing Required information to format'){
        b = '100000.0%'
    }
    a = parseFloat(a.replace(/[^\d.-]/g, ''));
    b = parseFloat(b.replace(/[^\d.-]/g, ''));
    if(a > b) return -1
    if(a < b) return 1
    return 0
}


var hiddenList = []
var showList = []
/**Toggles if hidden stocks are displayed or not */
const toggleHidden = () => {
    let box = document.getElementById('toggleCheck')
    let disabledStocks = document.getElementsByClassName('disabledStock')
    if (box.checked) {
        for (el of disabledStocks) {
            el.style.display = ""
            el.style.backgroundColor = "lightgrey"
        }
        for (id of hiddenList) {
            document.getElementById(id).style.display = ""
            document.getElementById(id).style.backgroundColor = "lightgrey"
        }
        for (id of showList) {
            document.getElementById(id).style.display = ""
            document.getElementById(id).style.backgroundColor = ""
        }
    } else {
        for (el of disabledStocks){
            el.style.display = "none"
            el.style.backgroundColor = "lightgrey"
        }
        for (id of hiddenList) {
            document.getElementById(id).style.display = "none"
            document.getElementById(id).style.backgroundColor = "lightgrey"
        }
        for (id of showList) {
            document.getElementById(id).style.display = ""
            document.getElementById(id).style.backgroundColor = ""
        }
    }
}

/**
 * Sends data to the server when a stock gets hidden
 * @param {String} id - id of the stock 
 */
const toggleStock = (id) => {
    fetch('/toggleStock', {
        method: 'post',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({stock_id: id})
    })
    .then(res => res.json())
    .then((res) => {
        document.getElementById(id).className = res ? '' : 'disabledStock'
        if (res){
            showList.push(id)
            hiddenlist.splice( list.indexOf(id), 1 );
            document.getElementById(id).style.display = ''
            document.getElementById(id).style.backgroundColor = ''
        } else {
            hiddenList.push(id)
            showList.splice( list.indexOf(id), 1 );
        }

        toggleHidden()


    })
}
$(window).bind("load", function() {
    toggleHidden()
    setInterval(() => {toggleHidden()},200)
});

function format_returned(data){
    let row = {};
    //console.log(data)
    for(i in columns){

        if (columns[i] == "capXfcf5"){
            row[columns[i]] = calculate_averages(data[0].stockdata, 'capeXfcf_format', 5)
        }
        else if (columns[i] == "capXfcf10"){
            row[columns[i]] = calculate_averages(data[0].stockdata, 'capeXfcf_format', 10)
        }
        else if (columns[i] == "capXae5"){
            row[columns[i]] = calculate_averages(data[0].stockdata, 'capeXfcf_format', 5)
        }
        else if (columns[i] == "capXae10"){
            row[columns[i]] = calculate_averages(data[0].stockdata, 'capeXfcf_format', 10)
        }
        else if(columns[i] == "3"){
            row[columns[i]] = data[0].stock_name
        }
        else if (columns[i] == 'comment'){
            row[columns[i]] = `<div id="note${data[0].stock_id}">${data[0].note}</div><button type="button" onclick='editNote(${data[0].stock_id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
        else if (columns[i] == "emoticon"){
            row[columns[i]] = `<div style="font-size: 30px" id="emoticon${data[0].stock_id}">${data[0].emoticon}</div><button type="button" onclick='editEmoticon(${data[0].stock_id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
        else if (columns[i] == "stock_current_price"){
            row[columns[i]] = `<div id="current_price${data[0].stock_id}">${data[0].stock_current_price}</div><button type="button" onclick='editPrice(${data[0]}, "stock_current_price")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
        else if (columns[i] == "fairvalue"){
            row[columns[i]] = `<div id="fairvalue${data[0].stock_id}">${data[0].fairvalue}</div><button type="button" onclick='editPrice(${data[0].stock_id}, "fairvalue")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
        else if (columns[i] == "fivestar"){
            row[columns[i]] = `<div id="fivestar${data[0].stock_id}">${data[0].fivestar}</div><button type="button" onclick='editPrice(${data[0].stock_id}, "fivestar")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
        else if (columns[i] == "onestar"){
            row[columns[i]] = `<div id="onestar${data[0].stock_id}">${data[0].onestar}</div><button type="button" onclick='editPrice(${data[0].stock_id}, "onestar")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
        else if (columns[i] == "moat"){
            row[columns[i]] = `<div id="moat${data[0].stock_id}">${data[0].moat}</div><button type="button" onclick='editMoat(${data[0].stock_id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
        else if (columns[i] == "jdv"){
            row[columns[i]] = `<div id="jdv${data[0].stock_id}">${data[0].jdv}</div><button type="button" onclick='editPrice(${data[0].stock_id}, "jdv")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
        else if (columns[i] == "dcf_fair"){
            row[columns[i]] = `<div id="dcf_fair${data[0].stock_id}">${data[0].stockdata[0].dcf_fair}</div><button type="button" onclick='edit_dcf(${this.stock_id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
        else if (data[0][columns[i]]){
           row[columns[i]] = data[0][columns[i]]
        }
        else{
            row[columns[i]] = data[0].stockdata[0][columns[i]]
        }

        // Needs to update stuff

        // try{
        //     console.log(`${columns[i]}: ${data[0][columns[i]]}`)
        // }
        // catch{
        //     console.log(`${columns[i]}: ${data[0].stockdata[0]}`)
        // }
    }
    console.log(row)
}

function calculate_averages(stockdata, column, years){
    //console.log(stockdata)
    let total = 0;
    try{
        for(let i = 0;i < years; i++ ){
            total += parseFloat(stockdata[i][column])
        }
        return Math.round((total/years)*1000)/1000
    }
    catch{
        return "required values Missing"
    }
}

/** Used to send data from the front end to the node server
*@param list - A list of stock information
*@param action - Used to determine what happens in the server
    */
   function ajax_func(list, action, asyncbool=true){
    return new Promise((resolve, reject) => {
        var data = {};
        data.stocks = list;
        data.action = action;
        //console.log(data)
        $.ajax({
            type: "POST",
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: "/collection",
            async: asyncbool,
        }).done(function(returned_data){
            if(action === "Update" || action === "Update_Prices"){
                update_counter += 1;
                let Ndata = JSON.parse(returned_data);
                //console.log(Ndata[0].symbol)
                Swal.update({
                    text: `Progress: (${update_counter}/${rm_list.length})`,
                });
            }		
            resolve(returned_data.data)
        })
    })
}