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
                location.reload();
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

function show_selected(){
    $("#table #db_stocks input:checked").each(function() {
        var sym = $(this).parents('tr:first').data('val')
        rm_list.push(sym.toString());
        $(this).prop("checked", false);
    });
    console.log(rm_list)

    $("#table #db_stocks input:not(checked)").each(function(){
        der = $(this).parents('tr:first').data('val').toString()
        if(rm_list.indexOf(der) == -1){
            $(this).parents('tr:first').hide();
        }
    })

    rm_list = [];
}

const editNote = (id) => {
    let div = document.getElementById(`note${id}`)
    let parent = div.parentNode
    parent.innerHTML = `<input id="noteInput${id}" value="${div.innerHTML}" maxlength="250" /">`
    inputDiv = document.getElementById(`noteInput${id}`)
    inputDiv.addEventListener("keydown", (e) => {
        if (e.keyCode == 13) {
            fetch('/editNote', {
                method: 'post',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({note: inputDiv.value, stock_id: id})
            }).then(() => {parent.innerHTML = `<div id="note${id}">${inputDiv.value}</div><button type="button" onclick='editNote(${id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`})
        }
    })
}

const editMoat = (id) => {
    let div = document.getElementById(`moat${id}`);
    let parent = div.parentNode;
    swal.fire({
        title: "Select Moat",
        input: "select",
        inputOptions: {
            'No Moat': 'No Moat',
            'Wide': 'Wide',
            'Narrow': 'Narrow',
        },
        inputPlaceholder: 'Select a moat',
        showCancelButton: true,
        preConfirm: (inputText) => {
            ajax_edit("moat", id, inputText)
            .then((resolved) => {
                return resolved
            })
        }
    }).then((result) => {
        if(!result.dismiss){
            parent.innerHTML = `<div id="moat${id}">${result.value}</div><button type="button" onclick='editMoat(${id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
    })
}

const editEmoticon = (id) => {
    let div = document.getElementById(`emoticon${id}`);
    let parent = div.parentNode;
    swal.fire({
        title: "Select Emote",
        input: "select",
        inputOptions: {
            '😃': '😃',
            '🤑':'🤑',
            '😫':'😫',
            '💩': '💩',
        },
        inputPlaceholder: 'Select an emote',
        showCancelButton: true,
        preConfirm: (inputText) => {
            ajax_edit("emote", id, inputText)
            .then((resolved) => {
                return resolved
            })
        }
    }).then((result) => {
        if(!result.dismiss){
            parent.innerHTML = `<div style="font-size: 30px" id="emoticon${id}">${result.value}</div><button type="button" onclick='editEmoticon(${id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        }
    })
}

const editPrice = (id, action) => {
    let div = document.getElementById(`${action}${id}`);
    let parent = div.parentNode;
    //parent.innerHTML=`<input id="priceInput${id}" value="${div.innerHTML}" maxlength="250/">`
    swal.fire({
        title: "Edit The Price",
        input: 'text',
        showConfirmButton: true,
        showCancelButton: true,
        preConfirm: (inputText) => {
            ajax_edit(action, id, inputText).then((resolved) => {
                return resolved
            })
        }
    }).then((result) => {
        if(!result.dismiss){
            if(Number.isNaN(parseFloat(result.value)) === false && action != 'jdv') {
                parent.innerHTML = `<div id="${action}${id}">$${result.value}</div><button type="button" onclick='editPrice(${id}, ${action})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
            }
            if(Number.isNaN(parseFloat(result.value)) === false && action == 'jdv') {
                parent.innerHTML = `<div id="${action}${id}">${result.value}</div><button type="button" onclick='editPrice(${id}, ${action})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
            }
            if(Number.isNaN(parseFloat(result.value)) === true) {
                Swal.fire({
                    title: "INVALID INPUT",
                    text: 'Please enter in a valid number',
                    type: 'error',
                })
            }
        }
    })
}

function ajax_edit(action, id, userInput){
    return new Promise ((resolve, reject) => {
        var data = {};
        data.action = action;
        data.edit = userInput;
        data.id = id;
        $.ajax({
            type: "POST",
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: "/edit",
        }).done(function(returned_data){
            resolve(returned_data);
        })
    })
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
            resolve("returned_data")
        })
    })
}   

function currencysorter(a, b) {
    if(a == 'Infinity%' || a == 'NaN%' || a == '-Infinity'){
        a = '100000.0%'
    }
    if(b == 'Infinity%' || b == 'NaN%' || b == '-Infinity'){
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