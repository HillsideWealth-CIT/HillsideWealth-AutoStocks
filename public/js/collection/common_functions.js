/**
 * Opens a page that navigates to the gurufocus graph
 * @param {String} symbol - The Stock Symbol
 */
function open_chart(symbol) {
    window.open(`https://www.gurufocus.com/chart/${symbol}`, `_blank`);
    return;
}

/**
 * displays historical data in a sweet alert
 * @param {String} symbol 
 * @param {JSON} stockdata 
 * @param {Integer} years 
 */
function show_financials(symbol, stockdata, years) {
    let financials = "";
    for (let i = 0; i <= years; i++) {
        try {
            financials += `<tr>
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
            <td>${stockdata[i].purchase_of_business}</td>
            <td>${stockdata[i].capex_format}</td>
            <td>${stockdata[i].growth_capex_format}</td>
            <td>${stockdata[i].maintenance_capex_format}</td>
            <td>${stockdata[i].capeXae_format}</td>
            <td>${stockdata[i].datestring}</td>
            </tr>
            `;
        }
        catch(e){
            break;
        }
    }
    swal.fire({
        title: `${symbol} Historical Data`,
        showConfirmButton: true,
        width: '90vw',
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
                        <th>Purchase Of Business</th>
                        <th>Capex</th>
                        <th>Growth Capex</th>
                        <th>Maintenance Capex</th>
                        <th>Capex/aEBITDA</th>
                        <th>Date</th>
                    </tr>
                </thead>
                ${financials}
            </table>
            `
    });
}

/**
 * Hides all rows in the table but the selected ones
 */
function show_selected() {
    to_show = [];
    let selected = $table.rows('.selected').data();
    for (let i in selected) {
        if (selected[i].symbol) {
            to_show.push(selected[i].symbol);
        }
        else {
            break;
        }
    }
    let mergedVal = to_show.join('|');
    $table.column(1).search(mergedVal, true).draw();
}

/**
 * Enables selected stocks to be accessed on the shared database
 */
function share() {
    to_share = [];
    let selected = $table.rows('.selected').data();
    for (let i in selected) {
        if (selected[i].symbol) {
            to_share.push(selected[i].stock_id);
        }
        else {
            break;
        }
    }
    fetch('/share', {
        method: 'POST',
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify(to_share)
    })
    .then(response => response.json())
    .then(data => {
        console.log("OK")
    })
}

/**
 * Sets the categories for selected stocks
 */
function set_categories() {
    to_set = [];
    categories = [];
    symbols = [];
    let selected = $table.rows('.selected').data();
    console.log(selected);
    for (let i in selected) {
        if (selected[i].symbol) {
            to_set.push(selected[i].stock_id);
            symbols.push(selected[i].symbol);
        }
        else {
            break;
        }
    }
    if (to_set.length == 0) {
        alert('MUST SELECT AT LEAST ONE!');
    }
    else {
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stocks_list: to_set, categories: user_input.toUpperCase(), symbols: symbols })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    for (let i in data) {
                        $table.row(document.getElementById(`${data[i][0].symbol}`)).data(data[i][0]).invalidate();
                    }
                    $table.columns.adjust().draw(false);
                });
            }
        });
    }
}

/**
 * Determines if a price is under, over, or in expected regions
 * @param {Integer} val 
 * @param {Integer} price 
 * @returns {String}
 */
function value_calculator(val, price) {
    // console.log(`${val} ${price}`)
    if (val != 'null' && price != 'null') {
        if (price <= val * 1.10 && price >= val * 0.9) {
            return 'Expected';
        }
        else if (price >= val * 1.10) {
            return 'OverValued';
        }
        else {
            return 'UnderValued';
        }
    }
    else {
        return 'Missing Values';
    }
}