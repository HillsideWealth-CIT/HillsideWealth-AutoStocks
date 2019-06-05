/**Dispays and stores any edits made to the stock note
 * @param {string} id - The Stock id of the selected row
 */
const editNote = (id) => {
    let div = document.getElementById(`note${id}`)
    let parent = div.parentElement
    let index = parent.parentElement.getAttribute('data-index')
    parent.innerHTML = `<input id="noteInput${id}" value="${div.innerHTML}" maxlength="250" /">`
    inputDiv = document.getElementById(`noteInput${id}`)
    inputDiv.addEventListener("keydown", (e) => {
        if (e.keyCode == 13) {
            fetch('/editNote', {
                method: 'post',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: inputDiv.value, stock_id: id })
            }).then(() => { 
                let input_string = `<div id="note${id}">${inputDiv.value}</div><button type="button" onclick='editNote(${id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
                $table.bootstrapTable('updateRow', {index: index, row: {comment:input_string}}) 
            })
        }
    })
}


/**Displays and stores any edits made to the moat rating column
 * @param {string} id - The Stock id of the selected row
 */
const editMoat = (id) => {
    let index = document.getElementById(`moat${id}`).parentElement.parentElement.getAttribute('data-index')
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
        if (!result.dismiss) {
            let input_string = `<div id="moat${id}">${result.value}</div><button type="button" onclick='editMoat(${id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
            $table.bootstrapTable('updateRow', {index: index, row: {moat:input_string}}) 
        }
    })
}
/**
 * Creates a custom alert that allows for user input
 * @param {String} eps - earnings per share
 * @param {String} gr - growth rate
 * @param {String} tgr - terminal growth rate
 * @param {String} dr - discount rate
 * @param {String} gy - growth years
 * @param {String} ty - terminal years
 * @returns {JSON} - formatted json data
 */
function dcf_calc(eps, gr, tgr, dr, gy, ty) {
    return new Promise((resolve, reject) => {
        let user_input = {};
        swal.fire({
            title: 'DCF INPUTS',
            showConfirmButton: true,
            showCancelButton: true,
            html:
                `<div class="row">
                    <div class="col">
                        <label for="eps_form">EPS ($)</label>
                        <input id="eps_form" type="text" class="form-control" value="${eps.text()}">
                    </div>
                    <div class="col">
                        <label for="gr_form">Growth Rate (%)</label>
                        <input id="gr_form" type="text" class="form-control" value="${gr.text()}">
                    </div>        
                </div>
                <div class="row">
                    <div class="col">
                        <label for="tgr_form">Terminal Growth Rate (%)</label>
                        <input id="tgr_form" type="text" class="form-control" value="${tgr.text()}">
                    </div>
                    <div class="col">
                        <label for="dr_form">Discount Rate(%)</label>
                        <input id="dr_form" type="text" class="form-control" value="${dr.text()}">
                    </div>        
                </div>
                <div class="row">
                    <div class="col">
                        <label for="gy_form">Growth Years</label>
                        <input id="gy_form" id="eps_form" type="text" class="form-control" value="${gy.text()}">
                    </div>
                    <div class="col">
                        <label for="ty_form">Terminal Years</label>
                        <input id="ty_form" type="text" class="form-control" value="${ty.text()}">
                    </div>        
                </div>
                `,
        }).then((result) => {
            if (result.value == true) {
                user_input.eps = $('#eps_form').val();
                user_input.gr = $('#gr_form').val()/100;
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
 * Displays alerts that accept user input
 * sends input data to the server for calculations and updates database
 * updates the table cell with info from the response
 * 
 * @param {string} id - The Stock id of the selected row
 */
const edit_dcf = (id, years) => {
    let index = $(`#dcf_fair_5y${id}`).parent().parent().attr('data-index');
    let div = document.getElementById(`dcf_fair_5y${id}`);
    let eps = $(`#dcf_eps_basic${id}`)
    let gr = $(`#dcf_growth_rate_${years}y${id}`)
    let gy = $(`#dcf_gy${id}`)
    let ty = $(`#dcf_ty${id}`)
    let tgr = $(`#dcf_tgr${id}`)
    let dr = $(`#dcf_dr${id}`)
    let gv = $(`#dcf_growth_val_${years}y${id}`)
    let tv = $(`#dcf_terminal_val_${years}y${id}`)

    $(`#dcf_terminal_val_5y${id}`).text()
    dcf_calc(eps, gr, tgr, dr, gy, ty).then((resolve1) => {
        console.log(resolve1)
        ajax_edit("Calculate", id, resolve1).then((resolve2) => {
            console.log(resolve2)

            $table.bootstrapTable('updateRow', {index: index, row: {
                eps_without_nri_format: `<div id="dcf_eps_basic${id}">${resolve1.eps}</div>`,
                growth_years_format: `<div id="dcf_gy${id}">${resolve1.gy}</div>`,
                terminal_years_format: `<div id="dcf_ty${id}">${resolve1.ty}</div>`,
                terminal_growth_rate_format: `<div id="dcf_tgr${id}">${resolve1.tgr}</div>`,
                discount_rate_format: `<div id="dcf_dr${id}">${resolve1.dr}</div>`,
                dcf_growth: `<div id="">${Math.round((resolve2.growth_value) * 100) / 100}</div>`,
                dcf_terminal: `<div id="">${Math.round((resolve2.terminal_value) * 100) / 100}</div>`,
            }})
            if(years == 5){
                $table.bootstrapTable('updateRow', {index: index, row:{
                    eps_growth_rate: `<div id="dcf_growth_rate${id}">${resolve1.gr * 100}</div>`,
                    dcf_fair_5y: `<div id="dcf_fair_5y${id}">$${resolve2.fair_value}</div><button type="button" onclick='edit_dcf(${id}, 5)' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`,
                }})
            }
            else if(years == 10){
                $table.bootstrapTable('updateRow', {index: index, row:{
                    eps_growth_rate_10y: `<div id="dcf_growth_rate_10y${id}">${resolve1.gr * 100}</div>`,
                    dcf_fair_10y: `<div id="dcf_fair_10y${id}">$${resolve2.fair_value}</div><button type="button" onclick='edit_dcf(${id}, 10)' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`,
                }})
            }
            else if(years == 15){
                $table.bootstrapTable('updateRow', {index: index, row:{
                    eps_growth_rate_15y: `<div id="dcf_growth_rate_15y${id}">${resolve1.gr * 100}</div>`,
                    dcf_fair_15y: `<div id="dcf_fair_15y${id}">$${resolve2.fair_value}</div><button type="button" onclick='edit_dcf(${id}, 15)' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`,
                }})
            }
        })
    })
}

/**Creates a sweet alert with a drop down
 * updates database and table cell with user input
 * @param {string} id - The Stock id of the selected row
 */
const editEmoticon = (id) => {
    let index = document.getElementById(`moat${id}`).parentElement.parentElement.getAttribute('data-index')
    console.log()
    swal.fire({
        title: "Select Emote",
        input: "select",
        inputOptions: {
            '😃': '😃',
            '🤑': '🤑',
            '😫': '😫',
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
        if (!result.dismiss) {
            input_string = `<div style="font-size: 30px" id="emoticon${id}">${result.value}</div><button type="button" onclick='editEmoticon(${id})' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
            $table.bootstrapTable('updateRow', {index: index, row: {emoticon:input_string}}) 
        }
    })
}

/**
 * Used to update either the price, jdv, ms 5star and ms1star price
 * @param {string} id - The Stock id of the selected row
 * @param {string} action - What happens to the request on the server
 */
const editPrice = (id, action) => {
    let row_edit = {};
    let index = document.getElementById(`moat${id}`).parentElement.parentElement.getAttribute('data-index')
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
        if (!result.dismiss) {
            if (Number.isNaN(parseFloat(result.value)) === false && action != 'jdv') {
                let input_string = `<div id="${action}${id}">$${result.value}</div><button type="button" onclick='editPrice("${id}", "${action}")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
                row_edit[`${action}`] = input_string;
                console.log(row_edit)
                $table.bootstrapTable('updateRow', {index: index, row: row_edit}) 
            }
            if (Number.isNaN(parseFloat(result.value)) === false && action == 'jdv') {
                let input_string = `<div id="${action}${id}">${result.value}</div><button type="button" onclick='editPrice("${id}", "${action}")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
                $table.bootstrapTable('updateRow', {index: index, row: {jdv:input_string}})     
            }
            if (Number.isNaN(parseFloat(result.value)) === true) {
                Swal.fire({
                    title: "INVALID INPUT",
                    text: 'Please enter in a valid number',
                    type: 'error',
                })
            }
        }
    })
}

/**
 * The ajax function used to send info to the server and accept responses
 * @param {String} action - What the server will do with the request
 * @param {String} id - The Primary key of the stock for the database
 * @param {JSON} userInput - What the user inputs into the app
 */
function ajax_edit(action, id, userInput) {
    return new Promise((resolve, reject) => {
        var data = {};
        data.action = action;
        data.edit = userInput;
        data.id = id;
        $.ajax({
            type: "POST",
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: "/edit",
        }).done(function (returned_data) {
            resolve(returned_data);
        })
    })
}