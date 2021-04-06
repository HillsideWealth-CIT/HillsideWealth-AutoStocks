var $table;
var stockdb;
var total_columns;

$(document).ready(function(){
Initialize_table();
});

let date = new Date();

/**
 * Initializes table
 */
function Initialize_table(){
    ajax_Call(action, "/init_table").then((resolve) => {
        stockdb = resolve.data;
        console.log(stockdb);
        $table = fill_table(resolve.data);
        total_columns = $table.columns().header().length;
        $table.scroller.toPosition(stockdb.length,false);
        $table.scroller.toPosition(0);
        renameIroe();
    });
}
/**
 * Creates a datatable then Fills the table with JSON data
 * Link to Library: Datatables.net
 * @param {JSON} data 
 * @returns {object} Datatable
 */
function fill_table(data){
    var datatable = $('#datatable').DataTable({
        processing : true,
        data : data,
        dom : 'Bfrtip',
        buttons : button_builder(),
        rowId : `stock_id`,
        select : { selector: 'td:first-child', style : 'multi' },
        columns : column_builder(),
        fixedColumns: { leftColumns: 2 },
        scrollX : true,
        scrollY : '69vh',
        deferRender : true,
        scroller: true,
        order : [[shareConf ? 1 : 1, 'desc']],
        colReorder:{realtime: false},
        columnDefs: {
            type: 'any-number', targets: '_all'
        }
    });
    return datatable;
}

/**
 * Builds the button array for the table
 * @returns {list}
 */
function button_builder(){
    let buttons = [
        {text: 'Selection', className:"btn-sm", extend: 'collection',
        buttons: [
            {text: '<span class="fas fa-eye"></span> Show Selected', className:"", action: function(){show_selected();}},
            'selectAll',
            'selectNone',
        ]},
        {text: 'Edit Table', className:"btn-sm", extend: 'collection',
        buttons: [
            {text: '<span class="fas fa-plus"></span> Add', className:"btn-sm", action: function(){add();}},
            {text: '<span class="fas fa-trash-alt"></span> Delete', className:"btn-sm", action: function(){remove(removeLink);}},
            {text: '<span class="fas fa-sync-alt"></span> Refresh', className: "btn-sm", action: function(){update(updateLink);}},
            {text: `<span class="fas fa-calculator"></span> DCF`, className: "btn-sm", action: function(){calc_edit();}},
        ]},
        {text: '<span class="fas fa-share"></span> Save', className:"btn-sm", extend: 'collection',
        buttons: [
            {text: 'Set Special', className:"btn-sm", action: function(){setSpecial();}},
            {text: 'Share', className:"btn-sm", action: function(){share();}},
        ]},
        {text: '<span class="fas fa-users-cog"></span> Catagorize', className:"btn-sm", extend: 'collection',
        buttons: [
            {text: '<span class="fas fa-users-cog"></span> Set Categories', className:"btn-sm", action: function(){set_categories();}},
            {text: '<span class="fas fa-plus"></span> Select Filtered', className:"btn-sm", action: function(){$table.rows({search: 'applied'}).select();}},
        ]},
        {text: '<span class="fas fa-layer-group"></span> Aggregate', className:"btn-sm", extend: 'collection',
        buttons: [
            { text:'<b>Set</b>', action: function(){settingAggregation(7, 'set');} },
            { text:'Create', action: function(){createAggregation();} },
            { text:'Edit', action: function(){settingAggregation(0,'edit');} },
            { text:'Delete', action: function(){settingAggregation(0, 'delete');} },
        ]},
        {text: '<span class="fas fa-columns"></span> Table Config', className:"btn-sm", extend: 'collection',
            buttons: [
                { text:'<b>Show All</b>', action: function(){show_all();}},
                { text:'Returns', action: function(){returns();}},
                { text:'Capital Allocation', action: function(){capitalAllocation();}},
                { text:'Margins', action: function(){margins();}},
                { text:'Financial Health', action: function(){financialHealth();}},
                { text:'Cash Generation', action: function(){cashGeneration();}},
                { text:'Valuation', action: function(){valuation();}},
                { text:'Growth', action: function(){growth();}},
            ]
        },
        {text: 'Go To Custom', className:"btn-sm", action: function(){goToCustom();}},
        'colvis',
        'excel',
    ];
    return buttons;
}

/**
 * Builds the column array for the table
 * @returns {List}
 */
function column_builder(){
    let columns = [
        { data : null , defaultContent: '', checkboxes : { selectRow : true } ,orderable: false, targets:0, className: 'select-checkbox'},
        { data : "symbol" },
        // { data : "username"},
        {   data : null,
            orderable : false,
            className: 'setting_cell',
            render: function( data, type, row, meta){
                // Edit Buttons: 
                // 1: Saves comments and links
                // 2: View Key Stats
                // 3: Open Gurufocus Chart
                // 4: Opens DFC calculator
                // 5: 15 Year historical Financial Data
                let keystats = {
                    stockName: row.stock_name,
                    symbol: row.symbol,
                    current_price: row.stock_current_price,
                    entVal: row.stockdata[0].enterprise_value_format,
                    fcfSpice: row.stockdata[0].fcfSpice,
                    aebitdaSpice: row.stockdata[0].aebitda_spice,
                    capFcf: row.stockdata[0].capFcf,
                    fcfYield: row.stockdata[0].fcfYield,
                    dividendYield: row.stockdata[0].dividend_yield,
                    fcfRoic: row.stockdata[0].fcfroic,
                    fcfRoa: row.stockdata[0].fcfroa,
                    jdv: row.calculations.incrementalJDVROIC3yr,
                    cfRe: row.setup.cashflow_reinvestment_rate["3yrAvg"],
                    grossMargin: row.setup.grossmargin["3yrAvg"],
                    fcfMargin: row.setup.fcfmargin["3yrAvg"],
                    ndFcf: row.setup.ndFcf["3yrAvg"],
                    capexSales: row.setup.capex_sales["3yrAvg"],
                    capexFcf: row.setup.capex_fcf["3yrAvg"],
                    fcfNI: row.setup.fcfNetIncome["3yrAvg"],
                    fcfShare: row.setup.fcfShare["3yrAvg"],
                    yackt: row.stockdata[0].fror,
                    proj: row.calculations.projected10ror,
                    
                }
                
                return `
                <div>
                    <button type="button" onclick='openNotes("${row.stock_id}", "${row.symbol}")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>
                    <button type="button" onclick='open_stats(${JSON.stringify(keystats)})' class="btn btn-link btn-sm"><span class="fas fa-external-link-alt"></span></button>
                    <button type="button" onclick='open_chart("${row.symbol}")' class="btn btn-link btn-sm"><span class="fas fa-chart-line"></span></button>
                    <button type="button" onclick='open_calc(("${row.stock_id}"))' class="btn btn-link btn-sm"><span class="fas fa-calculator"></span></button>
                    <button type="button" onclick='show_financials("${row.symbol}", "${row.stock_id}")' class="btn btn-link btn-sm"><span class="fas fa-history"></span></button>
                </div>
                `;
            }    
        },
        { data : "stock_name"},
        { data : "stockdata.0.datestring" },
        { defaultContent: 0 },
        { data : "stock_current_price" },

        { data : "setup.fcfroic.5yrAvg", type : "any-number" },

        { data : "setup.fcfRota.5yrAvg", type : "any-number" },

        { data : "calculations.incrementalRoe1yr", type : "any-number"},
        { data : "calculations.incrementalRoe3yr", type : "any-number"},
        { data : "calculations.incrementalRoe5yr", type : "any-number"},
        { data : "calculations.incrementalRoe10yr", type : "any-number"},

        { data : "calculations.iroe3yr1", type : "any-number" },
        { data : "calculations.iroe3yr2", type : "any-number" },
        { data : "calculations.iroe3yr3", type : "any-number" },
        { data : "calculations.iroe3yr4", type : "any-number" },
        { data : "calculations.iroe3yr5", type : "any-number" },

        { data : "calculations.iroe5yr1", type : "any-number" },
        { data : "calculations.iroe5yr2", type : "any-number" },
        { data : "calculations.iroe5yr3", type : "any-number" },

        { data : "setup.cashflow_reinvestment_rate.3yrAvg", type : "any-number"},
        { data : "setup.cashflow_reinvestment_rate.5yrAvg", type : "any-number"},
        
        { data : "soChangePercent_5", type : "any-number" },

        { data : "setup.dividendPayoutRatio.5yrAvg", type : "any-number" },

        { data : "setup.grossmargin.5yrAvg", type : "any-number" },

        { data : "setup.operatingmargin.5yrAvg", type : "any-number" },
        
        { data : "setup.fcfmargin.5yrAvg", type : "any-number" },

        { data : "setup.capex_sales.5yrAvg", type : "any-number" },

        { data : "stockdata.0.cap_lease_debt" },

        { data : "stockdata.0.goodwill" },

        { data : "stockdata.0.flow_ratio" },
        { data : "setup.flow_ratio.5yrAvg" },

        { data : "setup.fcfNetIncome.5yrAvg", type : "any-number" },

        { data : "setup.cash_conversion_cycle.5yrAvg", type : "any-number" },

        { data : "stockdata.0.fcfYield", type : "any-number" },
        { data : "stockdata.0.fcfMultiple", type : "any-number" },
        { data : "npvoutput.fvMultiple", type : "any-number" },
        { data : "npvoutput.PdFvCur", type : "any-number" },

        { data : "fcfYield.min", type : "any-number" },
        { data : "fcfYield.max", type : "any-number" },
        { data : "setup.fcfYield.10yrAvg", type : "any-number" },

        { data : "setup.salesshare.compGrowth3yr", type : "any-number" },
        { data : "setup.salesshare.compGrowth5yr", type : "any-number" },

        { data : "setup.fcfShare.compGrowth3yr", type : "any-number"}, 
        { data : "setup.fcfShare.compGrowth5yr", type : "any-number"}, 
    ];
    if(shareConf) columns.splice(2, 0, { data : "username"})
    return columns;
}

/**
 * The ajax function used to send info to the server and accept responses
 * @param {String} action - What the server will do with the request
 * @param {String} id - The Primary key of the stock for the database
 * @param {JSON} userInput - What the user inputs into the app
 * @returns {Promise} JSON data
 */
function ajax_Call(action, link) {
    return new Promise((resolve, reject) => {
        var data = {};
        data.action = action;
        $.ajax({
            type: "POST",
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: link,
            timeout: 300000,
        }).done(function (returned_data) {
            resolve(returned_data);
        })
    });
}
