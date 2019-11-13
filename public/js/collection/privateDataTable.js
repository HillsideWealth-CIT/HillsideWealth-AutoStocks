var $table;
var stockdb;
var total_columns;

$(document).ready(function(){
Initialize_table();
});

/**
 * Initializes table
 */
function Initialize_table(){
    ajax_Call("init_user", "/init_table").then((resolve) => {
        stockdb = resolve.data;
        console.log(stockdb);
        $table = fill_table(resolve.data);
        total_columns = $table.columns().header().length;
        $table.scroller.toPosition(stockdb.length,false);
        $table.scroller.toPosition(0);
    });
}
/**
 * Creates a datatable then Fills the table with JSON data
 * Link to Library: Datatables.net
 * @param {JSON} data 
 * @returns {object} the datatable
 */
function fill_table(data){
    var datatable = $('#datatable').DataTable({
        processing : true,
        data : data,
        dom : 'Bfrtip',
        buttons : button_builder(),
        rowId : `symbol`,
        select : { selector: 'td:first-child', style : 'multi' },
        columns : column_builder(),
        fixedColumns: { leftColumns: 2 },
        scrollX : true,
        scrollY : '70vh',
        deferRender : true,
        scroller: true,
        order : [[8, 'desc']],
    });
    return datatable;
}

/**
 * Builds the button array for the table
 * @returns {List}
 */
function button_builder(){
    let buttons = [
        'selectAll', 'selectNone',
        {text: '<span class="fas fa-plus"></span> Add', className:"btn-sm", action: function(){add();}},
        {text: '<span class="fas fa-trash-alt"></span> Delete', className:"btn-sm", action: function(){remove();}},
        {text: '<span class="fas fa-sync-alt"></span> Refresh', className: "btn-sm", extend: 'collection',
        buttons:[
            {text: 'Prices', className:"btn-sm", action: function(){update('update_prices');}},
            {text: 'Financials', className:"btn-sm", action: function(){update('update_financials');}},
        ]},
        {text: `<span class="fas fa-calculator"></span> DCF`, className: "btn-sm", action: function(){calc_edit();}},
       
        {text: '<span class="fas fa-eye"></span> Show Selected', className:"btn-sm", action: function(){show_selected();}},
        {text: '<span class="fas fa-share"></span> Share', className:"btn-sm", action: function(){share();}},
        {text: '<span class="fas fa-users-cog"></span> Set Categories', className:"btn-sm", action: function(){set_categories();}},
        {text: '<span class="fas fa-layer-group"></span> Aggregate', className:"btn-sm", extend: 'collection',
        buttons: [
            { text:'<b>Set</b>', action: function(){settingAggregation(6, 'set');} },
            { text:'Create', action: function(){createAggregation();} },
            { text:'Edit', action: function(){settingAggregation(0,'edit');} },
            { text:'Delete', action: function(){settingAggregation(0, 'delete');} },
        ]},
        {text: '<span class="fas fa-columns"></span> Column Sets', className:"btn-sm", extend: 'collection',
            buttons: [
                { text:'<b>Show All</b>', action: function(){show_all();} },
                { text:'<b>Basic Stats</b>', action: function(){basic_stats();} },
                { text:'Basic Info', action: function(){basic_info();}},
                { text:'Financials', action: function(){financials();}},
                { text:'<b>Values</b>', action: function(){show_values();}},
                { text:'MS/GURU', action: function(){show_msguru();}},
                { text:'DCF', action: function(){show_dcf();}},
                { text:'<b>Growth</b>', action: function(){all_growth();}},
                { text:'FCF Growth', action: function(){fcf_growth();}},
                { text:'Price Growth', action: function(){price_growth();}},
                { text:'SO Growth', action: function(){so_growth();}},
                { text:'Rev Growth', action: function(){rev_growth();}},
                { text:'aEBITDA Growth', action: function(){ae_growth();}},
                { text:'CapEx', action: function(){capex();}},
                { text: '<b>Profitability</b>', action: function(){profitability();}},
            ]
        },
        'excel'
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
        {   data : null,
            orderable : false,
            className: 'setting_cell',
            render: function( data, type, row, meta){
                // button 1: takes user to gurufocus graph
                return `<button type="button" onclick='open_chart("${row.symbol}")' class="btn btn-link btn-sm"><span class="fas fa-chart-line"></span></button>`;
            }    
        },
        {   data : null,
            orderable : false,
            className: 'setting_cell',
            render: function( data, type, row, meta){
                // button 2: Comments, emoticon, morning star, guru rating, JDV
                // console.log(row.)
                return `<button type="button" id="edit${row.stock_id}" onclick='open_edit("${row.symbol}", "${row.stock_id}", "${row.note}", "${row.emoticon}", "${row.onestar}" , "${row.fivestar}", "${row.fairvalue}","${row.moat}", "${row.jdv}", "${row.stock_current_price}", "${row.gfrating}", "${row.ownership}", "${row.msse}", "${row.mCapAve_5}", "${row.mCapAve_10}", "${row.mCapAve_15}")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`.replace(/[\n\r]/g, "");
            }    
        },
        {   data : null,
            orderable : false,
            className: 'setting_cell',
            render: function( data, type, row, meta){
                // button 3: DCF calculator
                try{
                    return `<button type="button" onclick='open_calc("${row.stockdata[0].eps_without_nri}", "${row.growth_rate_5y}", "${row.growth_rate_10y}", "${row.growth_rate_15y}", "${row.stockdata[0].terminal_growth_rate}","${row.stockdata[0].discount_rate}","${row.stockdata[0].growth_years}","${row.stockdata[0].terminal_years}", )' class="btn btn-link btn-sm"><span class="fas fa-calculator"></span></button>`;
                }
                catch(e){
                    return `<button type="button" onclick='open_calc("${0}", "${row.growth_rate_5y}", "${row.growth_rate_10y}", "${row.growth_rate_15y}", "${0}","${0}","${0}","${0}", )' class="btn btn-link btn-sm"><span class="fas fa-calculator"></span></button>`
                }
               
            }    
        },
        {   defaultContent: 0.00,
            orderable : false,
            className: 'setting_cell',
            render: function( data, type, row, meta){
                // button 4: 15 Year historical Financial Data
                return `<button type="button" onclick='show_financials( "${row.symbol}" , ${JSON.stringify(row.stockdata)}, 15)' class="btn btn-link btn-sm"><span class="fas fa-history"></span></button>`;
            }    
        },
        { 
            defaultContent: 0
        },
        { data : "stock_name"},
        { data : "stockdata.0.market_cap_format" },
        { data : "stocksector" },
        { data : "stockdata.0.aebitda_spice" },
        { data : "stock_current_price" },
        { data : 'valueConditions' },
        { data : "stockdata.0.yield_format" },
        
        { data : "note" },
        { data : "ownership" },
        { data : "emoticon" },
        { data : "categories"},

        { data : "stockdata.0.datestring" },
        { data : "stockdata.0.shares_outstanding_quarterly" },
        { data : "stockdata.0.enterprise_value_format" },
        { data : "stockdata.0.revenue_format" },
        { data : "stockdata.0.aebitda_format" },
        { data : "stockdata.0.aeXsho_format" },
        { data : "stockdata.0.aebitda_percent" },
        { data : "stockdata.0.asset_turnover" },
        { data : "stockdata.0.aebitda_at" },
        { data : "stockdata.0.ev_aebitda" },
        { data : "stockdata.0.net_debt_format" },
        { data : "stockdata.0.nd_aebitda" },

        { data : 'stockdata.0.roe_format'},
        { data : "stockdata.0.roe_spice" },
        { data : "stockdata.0.effective_tax_format" },

        { data : "gfrating" },
        { data : "jdv" },
        { data : "msse"},
        { data : "moat" },
        { data : "fairvalue" },
        { data : "fivestar" },
        { data : "onestar" },

        { data : "stockdata.0.eps_without_nri_string_format" },
        { data : "stockdata.0.growth_years_format" },
        { data : "growth_rate_5y" },
        { data : "growth_rate_10y" },
        { data : "growth_rate_15y" },
        { data : "stockdata.0.terminal_years_format" },

        { data : "stockdata.0.terminal_growth_rate_string_format" },
        { data : "stockdata.0.discount_rate_string_format" },

        { data : "dcf_values_5y.growth_value" },
        { data : "dcf_values_5y.terminal_value" },
        { data : "dcf_values_5y.fair_value" },
        { data : "dcf_values_10y.growth_value" },
        { data : "dcf_values_10y.terminal_value" },
        { data : "dcf_values_10y.fair_value" },
        { data : "dcf_values_15y.growth_value" },
        { data : "dcf_values_15y.terminal_value" },
        { data : "dcf_values_15y.fair_value" },
        
        { data : "stockdata.0.fcf_format" },
        { data : "stockdata.0.fcf_yield" },
        { data : "fcf_growth_1" },
        { data : "fcf_growth_3" },
        { data : "fcf_growth_5" },
        { data : "fcf_growth_10" },

        { data : "stockdata.0.capex_format"},
        { data : "stockdata.1.growth_capex"},
        { data : "capeXfcfAverage5"},
        { data : "capeXfcfAverage10"},
        { data : "stockdata.0.capeXae_format"},
        { data : "capeXaeAverage5" },
        { data : "capeXaeAverage10" },
        { data : "stockdata.0.fcfXae_format" },
        { data : "price_growth_1" },
        { data : "price_growth_3"},
        { data : "price_growth_5" },
        { data : "price_growth_10" },

        { data : "so_change_1" },
        { data : "so_change_3" },
        { data : "so_change_5" },
        { data : "so_change_10" },

        { data : "soChangePercent_1"},
        { data : "soChangePercent_3"},
        { data : "soChangePercent_5"},
        { data : "soChangePercent_10"},

        { data : "revenue_growth_1"},
        { data : "revenue_growth_3"},
        { data : "revenue_growth_5"},
        { data : "revenue_growth_10"},

        { data : "aebitda_growth_1"},
        { data : "aebitda_growth_3"},
        { data : "aebitda_growth_5"},
        { data : "aebitda_growth_10"},

        { data : "stockdata.0.roic_format" },
        { data : "stockdata.0.wacc_format" },
        { data : "stockdata.0.roicwacc_format" },
    ];
    return columns;
}

/**
 * The ajax function used to send info to the server and accept responses
 * @param {String} action - What the server will do with the request
 * @param {String} id - The Primary key of the stock for the database
 * @param {JSON} userInput - What the user inputs into the app
 * @returns {Promise} JSON
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
        }).done(function (returned_data) {
            resolve(returned_data);
        });
    });
}