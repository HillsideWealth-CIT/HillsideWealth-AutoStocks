var update_counter = 0;
var to_update = [];

function open_chart(symbol){
    window.open(`https://www.gurufocus.com/chart/${symbol}`, `_blank`)
    return

    // console.log($table.row($('#LMT')).index())

    // console.log($('#BUTTS').length)
    // console.log($('#MSFT').length)
    // console.log(stockdb[1])
    // $table.row.add(row_columns()).draw();
};

function edit_menu(id, comment, emote, ms_1_star, ms_5_star, ms_fv, moat, jdv, price){
    //console.log(`${id} ${comment} ${emote} ${ms_1_star} ${ms_5_star} ${ms_fv} ${ms_moat} ${jdv} `)
    let edits = {};
    return new Promise ((resolve, reject) => {
    swal.fire({
        title: 'Inputs',
        showConfirmButton: true,
        confirmButtonText: 'Save Changes',
        showCancelButton: true,
        cancelButtonText: 'Back',
        html:
            `<div class="row">
                <div class="col">
                    <label for="jdv">JDV</label>
                    <input id="jdv" type="text" class="form-control" value="${jdv}">
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
                    <input id="ms_1_star" type="text" class="form-control" value="${ms_1_star}">
                </div>
                <div class="col">
                    <label for="ms_5_star">MS 5 Star</label>
                    <input id="ms_5_star" type="text" class="form-control" value="${ms_5_star}">
                </div>        
            </div>
            <div class="row">
                <div class="col">
                    <label for="ms_fair_value">MS Fair Value</label>
                    <input id="ms_fair_value" type="text" class="form-control" value="${ms_fv}">
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
                    <label for="Comment">Comment</label>
                    <input id="Comment" type="text" class="form-control" value="${comment}">
                </div>
                <div class="col">
                    <label for="cur_price">Current Price</label>
                    <input id="cur_price" type="text" class="form-control" value="${price}">
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

function open_edit(id, comment, emote, ms_1_star, ms_5_star, ms_fv, moat, jdv, price){
    let selected = $(`#edit${id}`).parent().parent()
    let test_selected = $(`#edit${id}`).parent()
    let row_index = $table.row(selected).index()
    edit_menu(id, comment, emote, ms_1_star, ms_5_star, ms_fv, moat, jdv, price).then((resolve) => {
        let setting_string = `<button type="button" id="edit${id}" onclick='open_edit("${id}", "${resolve.comment}", "${resolve.emoticon}", "${resolve.ms_1_star}" , "${resolve.ms_5_star}", "${resolve.ms_fair_value}","${resolve.ms_moat}", "${resolve.jdv}", "${resolve.price}" )' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
        ajax_Call(resolve, '/edits').then((server_resolve) => {
            if(server_resolve.status == "OK"){
                test_selected.html(setting_string)
                $table.cell({row:row_index, column: 3}).invalidate().draw()
                $table.cell({row:row_index, column: 8}).data(`$${resolve.price}`).invalidate();   
            }
            else{
                alert(`ERROR ${server_resolve.status}`)
            }
        })
    })
};

/** DCF CALCULATOR */
function calc_menu(eps, gr, tgr, dr, gy, ty, fv) {
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
                        <input id="gr_form" type="text" class="form-control" value="${gr}" oninput="eps_onchange()">
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
                `,
        })
    })
};

function open_calc(eps, gr, tgr, dr, gy, ty){
    //console.log(`${eps} ${gr} ${tgr} ${dr} ${gy} ${ty} `)
    let fv = dcf(eps, Math.round((gr/100) * 100000)/100000, tgr, dr, gy, ty)
    console.log(fv)
    calc_menu(eps, gr, tgr, dr, gy, ty, fv)
};

function eps_onchange(){
    dcf_results = dcf(
        $('#eps_form').val(),
        Math.round(($('#gr_form').val()/100)*10000)/10000,
        $('#tgr_form').val()/100,
        $('#dr_form').val()/100,
        $('#gy_form').val(),
        $('#ty_form').val(),
    )
    console.log(dcf_results)
    $('#gv_form').val(dcf_results.growth_value)
    $('#tv_form').val(dcf_results.terminal_value)
    $('#fv_form').val(dcf_results.fair_value)
};

dcf = ( eps, growth_rate, terminal_growth, discount_rate, g_years=10, t_years=10) => {
    console.log(`${eps} ${growth_rate} ${terminal_growth} ${discount_rate} ${g_years} ${t_years}`)
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

function show_financials(symbol, stockdata, years){
    console.log(stockdata)
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
                        <th></th>
                    </tr>
                </thead>
                ${financials}
            </table>
            `
    })
};

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

function update(link){
    to_update = [];
    let selected = $table.rows('.selected').data()
    for( i in selected ){
        if(selected[i].symbol){
        to_update.push(selected[i].symbol)
        }   
        else{
            break;
        }
    }
    let promises = [];

    Swal.fire({
        position:'center',
        type: 'question',
        title: 'The selected stocks are currently being updated!',
        text: `Progress: ${update_counter}/${to_update.length}`,
        footer: 'This might take a while, you might want to do something else',
        showConfirmButton: false,
    });

    for ( i in to_update ) {
        promises.push(counter_ajax(
            [{symbol: to_update[i]}],
            `/${link}`,
            false
        ))
    }

    Promise.all(promises).then((resolve) => {
        Swal.update({type: 'success'})
        for(i in resolve){
            //console.log(resolve[i].data[0])
            $table.row(document.getElementById(`${resolve[i].data[0].symbol}`)).data(resolve[i].data[0]).invalidate();
        }
        update_counter = 0;
        setTimeout(function(){
            Swal.close();
        }, 3000)
    })

};

function counter_ajax(action, link, async){
    return new Promise ((resolve, reject ) => {
        let data = {};
        data.action = action
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: link,
            async: async,
        }).done(function(returned_data){
            update_counter += 1;
            swal.update({
                text: `Progress: ${update_counter}/${to_update.length}`
            })
            resolve(returned_data)
        })
    })
}

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