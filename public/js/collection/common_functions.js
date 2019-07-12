/**
 * Opens a page that navigates to the gurufocus graph
 * @param {String} symbol - The Stock Symbol
 */
function open_chart(symbol){
    window.open(`https://www.gurufocus.com/chart/${symbol}`, `_blank`)
    return
};

/**
 * Determines if a field is null and fills it with 0
 * @param {String} field
 * @returns {String}
 */
function fill_0(field){
    if(field == 'null'){
        return 0
    }
    
    else{
        return field
    }
}

/**
 * Opens a sweet alert for editing certain parameters for a stock
 * @param {Float} symbol 
 * @param {Float} id 
 * @param {Float} comment 
 * @param {Float} emote 
 * @param {Float} ms_1_star 
 * @param {Float} ms_5_star 
 * @param {Float} ms_fv 
 * @param {Float} moat 
 * @param {Float} jdv 
 * @param {Float} price 
 * @param {Float} gf_rating 
 */
function edit_menu(symbol, id, comment, emote, ms_1_star, ms_5_star, ms_fv, moat, jdv, price, gf_rating){
    //console.log(`${id} ${comment} ${emote} ${ms_1_star} ${ms_5_star} ${ms_fv} ${ms_moat} ${jdv} `)
    // console.log(fill_0(ms_1_star))
    let edits = {};
    return new Promise ((resolve, reject) => {
    swal.fire({
        title: symbol,
        showConfirmButton: true,
        confirmButtonText: 'Save Changes',
        showCancelButton: true,
        cancelButtonText: 'Back',
        html:
            `<div class="row">
                <div class="col">
                    <label for="jdv">JDV</label>
                    <select id="jdv" class="form-control">
                    <option selected hidden>${fill_0(jdv)}</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </select>
                </div>
                <div class="col">
                    <label for="emoticon">Emoticon</label>
                    <select id="emote" class="form-control">
                        <option selected hidden>${emote}</option>
                        <option value="😃">😃</option>
                        <option value="🤑">🤑</option>
                        <option value="😫">😫</option>
                        <option value="💩">💩</option>
                    </select>
                </div>        
            </div>
            <div class="row">
                <div class="col">
                    <label for="ms_1_star">MS 1 Star</label>
                    <input id="ms_1_star" type="text" class="form-control" value="${fill_0(ms_1_star)}">
                </div>
                <div class="col">
                    <label for="ms_5_star">MS 5 Star</label>
                    <input id="ms_5_star" type="text" class="form-control" value="${fill_0(ms_5_star)}">
                </div>        
            </div>
            <div class="row">
                <div class="col">
                    <label for="ms_fair_value">MS Fair Value</label>
                    <input id="ms_fair_value" type="text" class="form-control" value="${fill_0(ms_fv)}">
                </div>
                <div class="col">
                    <label for="ms_moat">MS Moat</label>
                    <select id="ms_moat" type="text" class="form-control">
                        <option selected hidden>${moat}</option>
                        <option value="No Moat">No Moat</option>
                        <option value="Narrow">Narrow</option>
                        <option value="Wide">Wide</option>
                    </select>
                </div>        
            </div>
            <div class="row">
                <div class="col">
                    <label for="gfrating">GuruFocus Rating</label>
                    <input id="gfrating" type="text" class="form-control" value="${gf_rating}" readonly>
                </div>
                <div class="col">
                    <label for="cur_price">Current Price</label>
                    <input id="cur_price" type="text" class="form-control" value="${price}">
                </div>
            </div>
            <div class="row>
                <div class="col">
                    <label for="Comment">Comment</label>
                    <input id="Comment" type="text" class="form-control" value="${comment}">
                </div>
            </div>
            `,
    }
    ).then((result) => {
        if (!result.dismiss) {
            edits.id = id;
            edits.comment = $('#Comment').val();
            edits.ms_moat = $('#ms_moat').val();
            edits.ms_fair_value = $('#ms_fair_value').val().replace(/[^a-z0-9,. ]/gi, '');
            edits.ms_5_star = $('#ms_5_star').val().replace(/[^a-z0-9,. ]/gi, '');
            edits.ms_1_star = $('#ms_1_star').val().replace(/[^a-z0-9,. ]/gi, '');
            edits.emoticon = $('#emote').val();
            edits.jdv = $('#jdv').val();
            edits.price = $('#cur_price').val().replace(/[^a-z0-9,. ]/gi, '');
            resolve(edits)
            }
        })
    })
};

/**
 * Opens the edit menu then passes data to the server
 * @param {String} symbol 
 * @param {String} id 
 * @param {String} comment 
 * @param {String} emote 
 * @param {String} ms_1_star 
 * @param {String} ms_5_star 
 * @param {String} ms_fv 
 * @param {String} moat 
 * @param {String} jdv 
 * @param {String} price 
 * @param {String} gf_rating 
 */
function open_edit(symbol, id, comment, emote, ms_1_star, ms_5_star, ms_fv, moat, jdv, price, gf_rating){
    edit_menu(symbol, id, comment, emote, ms_1_star, ms_5_star, ms_fv, moat, jdv, price, gf_rating).then((resolve) => {
        ajax_Call(resolve, '/edits').then((server_resolve) => {
            $table.row(document.getElementById(`${symbol}`)).data(server_resolve.data[0]).invalidate();
        })
    })
};

/**
 * Opens a menu that calculates dfc's
 * @param {Float} eps 
 * @param {Float} gr5 
 * @param {Float} gr10 
 * @param {Float} gr15 
 * @param {Float} tgr 
 * @param {Float} dr 
 * @param {Float} gy 
 * @param {Float} ty 
 * @param {Float} fv 
 */
function calc_menu(eps, gr5, gr10, gr15, tgr, dr, gy, ty, fv) {
    return new Promise((resolve, reject) => {
        let user_input = {};
        swal.fire({
            title: 'DCF INPUTS',
            showConfirmButton: true,
            html:
                `<div class="row">
                    <div class="col">
                        <label for="eps_form">EPS ($)</label>
                        <input id="eps_form" type="text" class="form-control" value="${eps}" oninput="eps_onchange()">
                    </div>
                    <div class="col">
                        <label for="gr_form">Growth Rate (%)</label>
                        <input id="gr_form" list="gr_list" type="text" class="form-control" placeholder="press y for years" oninput="eps_onchange(${gr5}, ${gr10}, ${gr15})">
                        <datalist id="gr_list">
                            <option value="years 5">
                            <option value="years 10">
                            <option value="years 15">
                        </datalist>
                        
                    </div>        
                </div>
                <div class="row">
                    <div class="col">
                        <label for="tgr_form">Terminal Growth Rate (%)</label>
                        <input id="tgr_form" type="text" class="form-control" value="${tgr * 100}" oninput="eps_onchange()">
                    </div>
                    <div class="col">
                        <label for="dr_form">Discount Rate(%)</label>
                        <input id="dr_form" type="text" class="form-control" value="${dr * 100}" oninput="eps_onchange()">
                    </div>        
                </div>
                <div class="row">
                    <div class="col">
                        <label for="gy_form">Growth Years</label>
                        <input id="gy_form" id="eps_form" type="text" class="form-control" value="${gy}" oninput="eps_onchange()">
                    </div>
                    <div class="col">
                        <label for="ty_form">Terminal Years</label>
                        <input id="ty_form" type="text" class="form-control" value="${ty}" oninput="eps_onchange()">
                    </div>        
                </div>

                <div class="row">
                    <div class="col">
                        <label for="gv_form">Growth Value</label>
                        <input id="gv_form" type="text" class="form-control" value="${fv.growth_value}" readonly>
                    </div>
                    <div class="col">
                        <label for="tv_form">Terminal Value</label>
                        <input id="tv_form" type="text" class="form-control" value="${fv.terminal_value}" readonly>
                    </div>
                    <div class="col">
                        <label for="fv_form">Fair Value</label>
                        <input id="fv_form" type="text" class="form-control" value="${fv.fair_value}" readonly>
                    </div>           
                </div>

                <div class="row">
                    <div class="col">
                        <label for="gv_form">Average</label>
                        <input id="gv_form" type="text" class="form-control" value="${dfcAverage([gr5, gr10, gr15])}" readonly>
                    </div>
            </div>
                `,
        })
    })
};

function dfcAverage(arrList){
    let total = 0;
    let counter = 0;
    let finalString = '';
    for(i in arrList){
        if(arrList[i] != 'null'){
            total += parseFloat(arrList[i])
            counter ++
            finalString = `${finalString} + ${arrList[i]}`
        }
    }
    return `${finalString.substr(2)} / ${counter} = ${Math.round((total) * 100) / 100}`
}

/**
 * Calculates initial dfc's 
 * @param {String} eps 
 * @param {String} gr5 
 * @param {String} gr10 
 * @param {String} gr15 
 * @param {String} tgr 
 * @param {String} dr 
 * @param {String} gy 
 * @param {String} ty 
 */
function open_calc(eps, gr5, gr10, gr15, tgr, dr, gy, ty){
    //console.log(`${eps} ${gr} ${tgr} ${dr} ${gy} ${ty} `)
    let fv = dcf(eps, Math.round((gr5/100) * 100000)/100000, tgr, dr, gy, ty)
    // console.log(fv)
    calc_menu(eps, gr5, gr10, gr15, tgr, dr, gy, ty, fv)
};

/**
 * calculates on input change
 * @param {String} gr5 
 * @param {String} gr10 
 * @param {String} gr15 
 */
function eps_onchange(gr5, gr10, gr15){
    if(isNaN($('#gr_form').val()) == true){
        if($('#gr_form').val() == 'years 5'){
            $('#gr_form').val(gr5)
        }
        else if ($('#gr_form').val() == 'years 10'){
            $('#gr_form').val(gr10) 
        }
        else if ($('#gr_form').val() == 'years 15'){
            $('#gr_form').val(gr15)
        }

    }
        dcf_results = dcf(
            $('#eps_form').val(),
            Math.round(($('#gr_form').val()/100)*10000)/10000,
            $('#tgr_form').val()/100,
            $('#dr_form').val()/100,
            $('#gy_form').val(),
            $('#ty_form').val(),
        )
        $('#gv_form').val(dcf_results.growth_value)
        $('#tv_form').val(dcf_results.terminal_value)
        $('#fv_form').val(dcf_results.fair_value)
};

/**
 * Sends changes for the dfc options to the server
 */
function calc_edit(){

    let stock_id_list = [];
    let selected = $table.rows('.selected').data()
    for( i in selected ){
        if(selected[i].symbol){
        stock_id_list.push(selected[i].stock_id)
        }   
        else{
            break;
        }
    }
    if(stock_id_list.length != 0){
        calc_edit_menu().then((values) => {
            let to_send = {stock_id_list: stock_id_list, values: values}
            console.log(values)
            ajax_Call(to_send, '/calc_edit').then((res) => {
                console.log(res)
                if (res == "OK"){
                    location.reload();
                }
            })
        })
    }
    else{
        alert("NO ROWS SELECTED")
    }
}

/**
 * Opens the calc edit menu
 */
function calc_edit_menu(){
    let values = {};
    let arr = ['tgr', 'dr', 'gy', 'ty'];
    return new Promise ((resolve) => {
    swal.fire({
        title: 'DCF INPUTS',
        showConfirmButton: true,
        showCancelButton: true,
        html:
            `
            <div class="row">
                <p class="col">*EMPTY FIELDS WILL BE TREATED AS 5</p>
            </div>
            <div class="row">
                <div class="col">
                    <label for="tgr_form">Terminal Growth Rate (%)</label>
                    <input id="tgr_form" type="text" class="form-control" value="4">
                </div>
                <div class="col">
                    <label for="dr_form">Discount Rate(%)</label>
                    <input id="dr_form" type="text" class="form-control" value="12">
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
        if (!result.dismiss) {
                // values.tgr = document.getElementById('tgr_form').value / 100;
                // values.dr = document.getElementById('dr_form').value / 100;
                // values.gy = document.getElementById('gy_form').value;
                // values.ty = document.getElementById('ty_form').value;
                for( i in arr ){
                    if (document.getElementById(`${arr[i]}_form`).value.length != 0){
                        values[arr[i]] = document.getElementById(`${arr[i]}_form`).value
                    }
                    else{
                        values[arr[i]] = 5;
                    }
                }
                resolve(values)
            }
        })
    })
}

function dcf( eps, growth_rate, terminal_growth, discount_rate, g_years=10, t_years=10){
    // console.log(`${eps} ${growth_rate} ${terminal_growth} ${discount_rate} ${g_years} ${t_years}`)
    let results = {};
    let x = (1+parseFloat(growth_rate))/(1+parseFloat(discount_rate));
    let y = (1+parseFloat(terminal_growth))/(1+parseFloat(discount_rate));
    results['growth_value'] = dfc_growth(x, parseFloat(eps), g_years);
    results['terminal_value'] = dcf_terminal(x, y, parseFloat(eps), g_years,t_years);
    results['fair_value'] = Math.round((results.growth_value + results.terminal_value) * 100)/100;
    results['growth_value'] = Math.round((results.growth_value) * 100 ) / 100;
    results['terminal_value'] = Math.round((results.terminal_value) * 100 ) / 100 ;
    return results;
};

/**
 * calculates the growth value
 * @param {float} x - growth rate devided by discount rate
 * @param {float} eps - earnings per share
 * @param {Integer} years 
 * @returns {float} growth_value
 */
function dfc_growth(x, eps, years){
    let growth_value = 0;
    //console.log(`X: ${x} ; Y: ${y}`)
    for(let i = 1; i <= years; i ++){
        let pow = Math.pow(x,i)
        growth_value += pow * eps
    }
    return growth_value;
};

/**
 * @param {float} x - growth rate devided by discount rate
 * @param {float} y - terminal growth rate devided by discount rate
 * @param {float} eps - earning per share
 * @param {float} g_years - growth years
 * @param {float} t_years - terminal growth years
 * @returns {float} terminal_value
 */
function dcf_terminal(x, y, eps, g_years ,t_years){
    let terminal_value = 0;
    for (let i = 1; i <= t_years; i ++){
        part1 = Math.pow(x,g_years)
        part2 = Math.pow(y,i)
        terminal_value += part1 * part2 * eps
        //console.log(part1*part2*eps)
    }
    return terminal_value
};

/**
 * displays historical data in a sweet alert
 * @param {String} symbol 
 * @param {JSON} stockdata 
 * @param {Integer} years 
 */
function show_financials(symbol, stockdata, years){
    // console.log(stockdata)
    let financials = ""
    for(let i = 1; i <= years; i++){
        try{
        financials +=  `<tr>
            <td>${stockdata[i].datestring}</td>
            <td>${stockdata[i].price_format}</td>
            <td>${stockdata[i].aebitda_spice}</td>
            <td>${stockdata[i].shares_outstanding_format}</td>
            <td>${stockdata[i].enterprise_value_format}</td>
            <td>${stockdata[i].revenue_format}</td>
            <td>${stockdata[i].aebitda_format}</td>
            <td>${stockdata[i].aeXsho_format}</td>
            <td>${stockdata[i].aebitda_percent}</td>
            <td>${stockdata[i].asset_turnover}</td>
            <td>${stockdata[i].aebitda_at}</td>
            <td>${stockdata[i].ev_aebitda}</td>
            <td>${stockdata[i].net_debt_format}</td>
            <td>${stockdata[i].nd_aebitda}</td>
            <td>${stockdata[i].roe_format}</td>
            <td>${stockdata[i].fcf_format}</td>
            <td>${stockdata[i].fcfXae_format}</td>
            <td>${stockdata[i].fcf_yield}</td>
            <td>${stockdata[i].capex}</td>
            <td>${stockdata[i].capeXae_format}</td>
            <td>${stockdata[i].datestring}</td>
            </tr>
            `
        }
        catch{
            break;
        }
    }
    swal.fire({
        title: `${symbol} Historical Data`,
        showConfirmButton: true,
        width:'90vw',
        html:
            `
            <table class="table table-sm table-bordered table-light table-responsive">
                <thead class="thead-dark">
                    <tr>
                        <th>Date</th>
                        <th>Price</th>
                        <th>aEBITDA Spice</th>
                        <th>Share Outstanding</th>
                        <th>Enterprise Value</th>
                        <th>Revenue</th>
                        <th>aEBITDA</th>
                        <th>aEBITDA/Share</th>
                        <th>aEBITDA%</th>
                        <th>Asset Turn</th>
                        <th>aEBITDA AT</th>
                        <th>EV/aEBITDA</th>
                        <th>Net Debt</th>
                        <th>ND/aEBITDA</th>
                        <th>ROE</th>
                        <th>FCF</th>
                        <th>FCF/aEBITDA</th>
                        <th>FCF Yield</th>
                        <th>Capex</th>
                        <th>Capex/aEBITDA</th>
                        <th>Date</th>
                    </tr>
                </thead>
                ${financials}
            </table>
            `
    })
};

/**
 * Hides all rows in the table but the selected ones
 */
function show_selected(){
    to_show = [];
    let selected = $table.rows('.selected').data()
    for( i in selected ){
        if(selected[i].symbol){
        to_show.push(selected[i].symbol)
        }   
        else{
            break;
        }
    }
    console.log(to_show)
    let mergedVal = to_show.join('|')
    $table.column(1).search(mergedVal, true).draw();
    // $table.column(1).search("GOOGL|MSFT", true).draw();
}

/**
 * Enables selected stocks to be accessed on the shared database
 */
function share(){
    to_share = [];
    let selected = $table.rows('.selected').data()
    for( i in selected ){
        if(selected[i].symbol){
        to_share.push(selected[i].stock_id)
        }   
        else{
            break;
        }
    }

    ajax_Call(to_share, '/share')
}

/**
 * Recusively sends data to the server
 * @param {Integer} active_num 
 * @param {Integer} end_num 
 * @param {String} symbols 
 * @param {Integer} ids 
 * @param {String} link 
 */
function counter_ajax(active_num, end_num, symbols, ids, link){
    // console.log(`${active_num} ${end_num}`)
    // console.log(arr[active_num])
    Swal.update({text: `Progress: ${active_num}/${end_num}`})
    if (active_num == end_num){ 
        Swal.update({
            type:'success',
            text: 'Update Complete'
        })
        setTimeout(function(){
            Swal.close();
        }, 3000)
        return
    };
    $.ajax({
        type: 'POST',
        url: link,
        data: {action: [{symbol: symbols[active_num], stock_id: ids[active_num]}]},
        success: function(resolved){
            // alert(JSON.stringify(data))
            console.log(resolved.data)
            try{
                // console.log(resolved.data[0])
            $table.row(document.getElementById(`${resolved.data[0].symbol}`)).data(resolved.data[0]).invalidate();
            }
            catch(e){
                // console.log(e)
            }
            counter_ajax(active_num + 1, end_num, symbols, ids, link)
        }
    })
}

/**
 * Recursively adds symbols
 * @param {Integer} active_num 
 * @param {Integer} end_num 
 * @param {Array} list 
 * @param {String} link 
 */
function adder_ajax(active_num, end_num, list, link){
    swal.update({text: `Progress: ${active_num}/${end_num}`})
    if (active_num == end_num){
        Swal.update({
            type:'success',
            text: 'Update Complete'
        })
        setTimeout(function(){
            Swal.close();
        }, 3000)
        return
    };
    $.ajax({
        type: 'POST',
        url: link,
        data: {action: [{'symbol': list[active_num].toUpperCase(), 'comment': '', 'company':'', 'exchange': ''}]},
        success: function(stockinfo){
            console.log(stockinfo)
            try{
                $table.row.add(stockinfo.data[0]).draw();
            }
            catch(e){
                console.log(e)
            }
            adder_ajax(active_num + 1, end_num, list, link)
        }
    })
}

/**
 * Sets the categories for selected stocks
 */
function set_categories(){
    to_set = [];
    categories = [];
    symbols = [];
    let selected = $table.rows('.selected').data()
    console.log(selected)
    for( i in selected ){
        if(selected[i].symbol){
        to_set.push(selected[i].stock_id)
        symbols.push(selected[i].symbol)
        }   
        else{
            break;
        }
    }
    if(to_set.length == 0){
        alert('MUST SELECT AT LEAST ONE!')
    }
    else{
    Swal.fire({
        title: 'Set Categories',
        text: 'Format: [category], [category]',
        input: 'text',
        showCancelButton: 'true',
        showConfirmButton: 'true',
        preConfirm: (user_input) => {
            // console.log(user_input)
            fetch('/categories/set', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({stocks_list: to_set, categories: user_input.toUpperCase(), symbols: symbols})
            })
            .then(response => response.json())
            .then(data => {
                console.log( data )
                for (i in data){
                    $table.row(document.getElementById(`${data[i][0].symbol}`)).data(data[i][0]).invalidate();
                }
                $table.columns.adjust().draw(false)
            })

        }
    })
}
    console.log(to_set)
}

/**
 * Determines if a price is under, over, or in expected regions
 * @param {Integer} val 
 * @param {Integer} price 
 * @returns {String}
 */
function value_calculator(val, price){
    // console.log(`${val} ${price}`)
    if(val != 'null'  && price != 'null'){
        if(price <= val * 1.10 && price >= val * 0.9){
            return 'Expected'
        }
        else if(price >= val * 1.10){
            return 'OverValued'
        }
        else{
            return 'UnderValued'
        }
    }
    else{
        return 'Missing Values'
    }
}