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
async function show_financials(symbol, stock_id) {
    swal.fire({
        type: 'question',
        title: 'Loading Data...',
    })
    let response = await fetch(`/historic?id=${stock_id}`);
    let json = await response.json();
    console.log(json)
    if (json.error !== true) {
        let historicData = json.data;
        let configString = json.test.split(',');
        let headers = "";
        let financials = "";
        for (let i of configString) headers += `<th>${i.split('|')[0]}</th>`;
        for (let i = 0; i <= historicData.length; i++) {
            let rowString = '';
            for (let y in historicData[i]) {
                try {
                    rowString += `<td>${historicData[i][y]}</td>`
                }
                catch (e) {
                    break;
                }
            }
            financials += `<tr>${rowString}</tr>`
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
                            ${headers}
                        </tr>
                    </thead>
                    ${financials}
                </table>
                <button class="btn btn-secondary" onClick="historicalCustomization('${json.test.replaceAll('\n', '')}', '${json.id}', '${json.name}', ${json.fallback})">Customize</button>
                <button class="btn btn-secondary" onClick="switch_config()">Switch</button>
                `
        });
    }
    else {
        historicalCustomization('');
    }
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
    swal.fire({
        title: 'Saving to CommonDB',
        type: 'question',
        showConfirmButton:false,
    })
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(to_share)
    })
        .then(response => response.json())
        .then(data => {
            swal.update({
                title: 'Saving Complete',
                type:'success',
                showConfirmButton:true,
            })
        })
}

async function setSpecial() {
    swal.fire({
        title: 'Saving to SharedDB',
        type: 'question',
        showConfirmButton:false,
    })
    to_set = [];
    let selected = $table.rows('.selected').data();
    for (let i in selected) {
        if (selected[i].symbol) {
            to_set.push(selected[i].stock_id);
        }
        else {
            break;
        }
    }
    fetch('/setSpecial', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(to_set)
    })
        .then(response => response.json())
        .then(data => {
            swal.update({
                title: 'Saving Complete',
                type:'success',
                showConfirmButton:true,
            })
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

var update_counter = 0;
var to_update = [];

/**
 * Opens a sweetalert and adds all stocks user inputs
 */
function add() {
    let stocks;
    let SpecialDB;
    let shared;
    Swal.fire({
        title: 'Add Stocks',
        html: `
        <div>
            <p>Formats: American Stocks: [SYMBOL], Canadian stocks: [EXCHANGE:SYMBOL]</p>
            <div class="row">
                <input id="symbolsInput" type="text" class="form-control">
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="specialdb">
                <label class="form-check-label" for="checkbox1" style="width: 6em">
                    SpecialDB
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="commondb">
                <label class="form-check-label" for="checkbox2" style="width: 6em">
                    CommonDB
                </label>
            </div>
        </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add Stocks',
        preConfirm: (result) => {
            let stockstring = document.getElementById('symbolsInput').value.replace(/\s/g, "");
            stocks = stockstring.split(',');
            SpecialDB = document.getElementById('specialdb').checked;
            shared = document.getElementById('commondb').checked;
        }
    }).then(async (result) => {
        if (!result.dismiss) {
            Swal.fire({
                type: 'question',
                title: 'Currently Saving stocks to Database!',
                text: `progress: 0/${stocks.length}`,
                allowOutsideClick: false,
                showConfirmButton: false
            });
            for (let i in stocks) {
                swal.update({
                    text: `Progress: ${Number(i) + 1}/${stocks.length} - Current: ${stocks[i].toUpperCase()}`
                })
                await ajax_request(stocks[i].toUpperCase(), `/append?share=${shared}&special=${SpecialDB}`)
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

    function ajax_request(symbol, link) {
        return $.ajax({
            type: 'POST',
            url: link,
            data: { action: [{ 'symbol': symbol, 'comment': '', 'company': '', 'exchange': '' }] },
            success: function (stockinfo) {
                try {
                    // $table.row(document.getElementById(stockinfo.data[0].stock_id)).remove().draw();
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
function remove(link) {
    let to_remove = [];
    let ids = [];
    let selected = $table.rows('.selected').data();
    for (let i in selected) {
        if (window.location.href.includes('shared') && selected[i].symbol) {
            if (selected[i].username == $('#username').attr('user')) {
                to_remove.push(selected[i].symbol);
                ids.push(selected[i].stock_id);
            }
        }
        else if (selected[i].symbol) {
            to_remove.push(selected[i].symbol);
            ids.push(selected[i].stock_id);
        }
        else {
            break;
        }
    }
    ajax_Call(to_remove, link).then((resolved) => {
        for (let i in to_remove) {
            $table.row(document.getElementById(`${ids[i]}`)).remove().draw();
        }
    });
}

/**
 * Updates All selected stocks
 */
async function update(link) {
    to_update = [];
    let selected = $table.rows('.selected').data();
    for (let i in selected) {
        if (selected[i].symbol) {
            to_update.push({
                stock_id: shareConf ? selected[i].username : selected[i].stock_id,
                symbol: selected[i].symbol
            })
        }
        else {
            break;
        }
    }

    Swal.fire({
        position: 'center',
        type: 'question',
        title: 'The selected stocks are currently being updated!',
        text: `Progress: ${update_counter}/${to_update.length}`,
        footer: 'This might take a while, you might want to do something else',
        showConfirmButton: false,
    });
    for (let i = 0; i < to_update.length; i++) {
        swal.update({ text: `Progress: ${i + 1}/${to_update.length} - Current: ${to_update[i].symbol}` });
        await ajax_request(to_update[i], link)
    }
    Swal.update({
        type: 'success',
        text: 'Update Complete'
    });
    if (to_update.length >= 50) {
        $table.destroy();
        $('tbody').empty();
        Initialize_table();
    }
    setTimeout(function () {
        Swal.close();
    }, 3000);
    return;

    function ajax_request(updateDict, link) {
        return $.ajax({
            type: 'POST',
            url: link,
            data: { action: [updateDict] },
            success: function (resolved) {
                try {
                    $table.row(document.getElementById(`${resolved.data[0].stock_id}`)).data(resolved.data[0]).invalidate();
                }
                catch (e) {
                    console.log(e)
                }
            }
        });
    }
}

/**
 * Used to edit configurations or create new configurations
 * @param {String} configString - Configuration String
 * @param {String} action - Determines what happens on the backend
 * @param {String} name - Name of the configuration
 * @param {Boolean} fallback - Determines if the configuration is editable
 */
function historicalCustomization(configString, id = '', name = '', fallback = false) {
    let toSend = {};
    swal.fire({
        title: `${(fallback) ? "This Is a Default Example And Cannot Be Edited" : "Historical Edit"}`,
        showConfirmButton: true,
        showCancelButton: true,
        width: '80vw',
        html: `
        <div class="form-group">
        <label for="configName">${(fallback) ? "Create a New Configuration From [Databases > CustomDB] or Switch to a different Configuration" : "Configuration Name"}</label>
        <input ${(fallback) ? "ReadOnly" : ""} type="text" class="form-control" id="configName" value="${name}">
        <label for="historicalDataConfig">Format:Header|column, Header(Sign)|Column Column| A + B</label>
        <textarea
            style="height:25em;"
            id="historicalDataConfig"
            spellcheck="false" 
            type="text" 
            class="form-control"
            ${(fallback) ? "ReadOnly" : ""}
            >${configString.replaceAll(',', ',\r\n')}</textarea>
        <div>
        `
    }).then((result) => {
        console.log($('#historicalDataConfig').val().replaceAll(',\n', ','))
        console.log(result)
        if (result.value) {
            if (fallback) {
                swal.fire({
                    type: "error",
                    title: "Default Table Cannot be Edited",
                    text: "Please Create a New Configuration In The Custom Table Or Switch To a different Configuration"
                })
                return
            }
            fetch('/tableconfig', {
                method: 'POST',
                body: JSON.stringify({
                    action: "edit",
                    table: "historic",
                    configString: $('#historicalDataConfig').val().replaceAll(',\n', ','),
                    configName: $("#configName").val(),
                    id: id
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                }
            })
                .then(response => response.json())
                .then(Json => console.log(json))
        }
    })
}

/**
 * Used to switch configurations for the table
 */
const switch_config = async () => {
    let configList = await fetchConfigs({ action: "getConfigs" });
    const { value: config } = await Swal.fire({
        title: "Config Selection",
        input: "select",
        inputOptions: configList,
        showCancelButton: true,
        inputPlaceholder: "Select a Configuration"
    })
    if (config) {
        let returned = await fetchConfigs({
            action: "switchHistoric",
            id: config
        })
        if (returned.success === true) {
            swal.fire({
                type: 'success',
                title: "Success",
                text: "Config Has been changed",
                showConfirmButton: false
            });
        }
    }

    /**
     * Fetches Configs
     * @param {Object} data - Object that gets sent to the backend
     */
    async function fetchConfigs(data) {
        return new Promise(resolve => {
            fetch("/tableconfig", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                }
            }).then(response => response.json())
                .then(data => { resolve(data) })
        })
    }
}