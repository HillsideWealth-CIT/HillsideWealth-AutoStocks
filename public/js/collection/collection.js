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
    ajax_Call(action, "/init_table").then((resolve) => {
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
        scrollY : '70vh',
        deferRender : true,
        scroller: true,
        order : [[shareConf ? 1 : 1, 'desc']],
        colReorder:{realtime: false},
        columnDefs: {
            type: 'natural', targets: '_all'
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
        'selectAll', 'selectNone',
        {text: '<span class="fas fa-plus"></span> Add', className:"btn-sm", action: function(){add();}},
        {text: '<span class="fas fa-trash-alt"></span> Delete', className:"btn-sm", action: function(){remove(removeLink);}},
        {text: '<span class="fas fa-sync-alt"></span> Refresh', className: "btn-sm", action: function(){update(updateLink);}},
        {text: `<span class="fas fa-calculator"></span> DCF`, className: "btn-sm", action: function(){calc_edit();}},
       
        {text: '<span class="fas fa-eye"></span> Show Selected', className:"btn-sm", action: function(){show_selected();}},
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
                { text:'Key Stats', action: function(){keyStats();}},
                { text:'Return on Capital', action: function(){returnOnCapital();}},
                { text:'Incremental Return on Capital', action: function(){incrementalReturnOnCapital();}},
                { text:'Margins', action: function(){margins();}},
                { text:'Financial Health', action: function(){financialHealth();}},
                { text:'Capital Intensity', action: function(){capitalIntensity();}},
                { text:'Cash Generation/Conversion', action: function(){cashGeneration();}},
                { text:'Guru', action: function(){guru();}},
                { text:'Growth', action: function(){growth();}},
                { text:'Future Growth Estimates', action: function(){futureGrowth();}},
                { text:'Projected ROR & Price Target', action: function(){projectedRor();}},
                { text:'Capital Allocation', action: function(){capitalAllocation();}},
                { text:'Valuation', action: function(){valuation();}},
                { text:'Random', action: function(){random();}},
            ]
        },
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
                // 1: takes user to gurufocus graph
                // 2: Comments, emoticon, morning star, guru rating, JDV
                // 3: DCF calculator
                // 4: 15 Year historical Financial Data
                // 5: Links Button
                return `
                <div>
                    <button type="button" onclick='open_chart("${row.symbol}")' class="btn btn-link btn-sm"><span class="fas fa-chart-line"></span></button>
                    <button type="button" onclick='open_calc("${row.stockdata[0].eps_without_nri}", "${row.growth_rate_5y}", "${row.growth_rate_10y}", "${row.growth_rate_15y}", "${row.stockdata[0].terminal_growth_rate}","${row.stockdata[0].discount_rate}","${row.stockdata[0].growth_years}","${row.stockdata[0].terminal_years}", )' class="btn btn-link btn-sm"><span class="fas fa-calculator"></span></button>
                    <button type="button" onclick='show_financials("${row.symbol}", "${row.stock_id}")' class="btn btn-link btn-sm"><span class="fas fa-history"></span></button>
                    <button type="button" onclick='linksMenu("${row.links}", "${row.symbol}")' class="btn btn-link btn-sm"><span class="fas fa-external-link-alt"></span></button>
                </div>
                `;
            }    
        },
        { data : "stock_name"},
        { data : "stock_current_price" },

        { data : "stockdata.0.fcfSpice" },
        { data : "setup.fcfSpice.3yrAvg" },
        { data : "setup.fcfSpice.5yrAvg" },
        { data : "setup.fcfSpice.10yrAvg" },
        { data : "setup.fcfSpice.ttm/5yr" },
        { data : "setup.fcfSpice.ttm/10yr" },
        { data : "setup.fcfSpice.5stdev" },
        { data : "setup.fcfSpice.10stdev" },

        { data : "stockdata.0.fcfYield" },
        { data : "setup.fcfYield.3yrAvg" },
        { data : "setup.fcfYield.5yrAvg" },
        { data : "setup.fcfYield.10yrAvg" },
        { data : "setup.fcfYield.ttm/5yr" },
        { data : "setup.fcfYield.ttm/10yr" },
        { data : "setup.fcfYield.5stdev" },
        { data : "setup.fcfYield.10stdev" },

        { data : "stockdata.0.yield_format" },
        { data : "stockdata.0.enterprise_value_format"},
        { data : "categories" },
        { data : "stockdata.0.datestring" },
        { defaultContent: 0 },

        { data : "stockdata.0.fcfroic" },
        { data : "setup.fcfroic.3yrAvg" },
        { data : "setup.fcfroic.5yrAvg" },
        { data : "setup.fcfroic.10yrAvg" },
        { data : "setup.fcfroic.ttm/5yr" },
        { data : "setup.fcfroic.ttm/10yr" },
        { data : "setup.fcfroic.5stdev" },
        { data : "setup.fcfroic.10stdev" },

        { data : "stockdata.0.fcfroa" },
        { data : "setup.fcfroa.3yrAvg" },
        { data : "setup.fcfroa.5yrAvg" },
        { data : "setup.fcfroa.10yrAvg" },
        { data : "setup.fcfroa.ttm/5yr" },
        { data : "setup.fcfroa.ttm/10yr" },
        { data : "setup.fcfroa.5stdev" },
        { data : "setup.fcfroa.10stdev" },

        { data : "stockdata.0.fcfroe" },
        { data : "setup.fcfroe.3yrAvg" },
        { data : "setup.fcfroe.5yrAvg" },
        { data : "setup.fcfroe.10yrAvg" },
        { data : "setup.fcfroe.ttm/5yr" },
        { data : "setup.fcfroe.ttm/10yr" },
        { data : "setup.fcfroe.5stdev" },
        { data : "setup.fcfroe.10stdev" },

        { data : "stockdata.0.fcfRoce" },
        { data : "setup.fcfRoce.3yrAvg" },
        { data : "setup.fcfRoce.5yrAvg" },
        { data : "setup.fcfRoce.10yrAvg" },
        { data : "setup.fcfRoce.ttm/5yr" },
        { data : "setup.fcfRoce.ttm/10yr" },
        { data : "setup.fcfRoce.5stdev" },
        { data : "setup.fcfRoce.10stdev" },

        { data : "calculations.incrementalRoe3yr"},
        { data : "calculations.incrementalRoe5yr"},
        { data : "calculations.incrementalRoe10yr"},

        { data : "calculations.incrementalRoic3yr"},
        { data : "calculations.incrementalRoic5yr"},
        { data : "calculations.incrementalRoic10yr"},

        { data : "calculations.incrementalJDVROIC3yr"},
        { data : "calculations.incrementalJDVROIC5yr"},
        { data : "calculations.incrementalJDVROIC10yr"},

        { data : "stockdata.0.cashflow_reinvestment_rate"},

        { data : "stockdata.0.grossmargin" },
        { data : "setup.grossmargin.3yrAvg" },
        { data : "setup.grossmargin.5yrAvg" },
        { data : "setup.grossmargin.10yrAvg" },
        { data : "setup.grossmargin.ttm/5yr" },
        { data : "setup.grossmargin.ttm/10yr" },
        { data : "setup.grossmargin.5stdev" },
        { data : "setup.grossmargin.10stdev" },

        { data : "stockdata.0.operatingmargin" },
        { data : "setup.operatingmargin.3yrAvg" },
        { data : "setup.operatingmargin.5yrAvg" },
        { data : "setup.operatingmargin.10yrAvg" },
        { data : "setup.operatingmargin.ttm/5yr" },
        { data : "setup.operatingmargin.ttm/10yr" },
        { data : "setup.operatingmargin.5stdev" },
        { data : "setup.operatingmargin.10stdev" },

        { data : "stockdata.0.fcfmargin" },
        { data : "setup.fcfmargin.3yrAvg" },
        { data : "setup.fcfmargin.5yrAvg" },
        { data : "setup.fcfmargin.10yrAvg" },
        { data : "setup.fcfmargin.ttm/5yr" },
        { data : "setup.fcfmargin.ttm/10yr" },
        { data : "setup.fcfmargin.5stdev" },
        { data : "setup.fcfmargin.10stdev" },

        { data : "stockdata.0.nd_aebitda" },
        { data : "setup.nd_aebitda.3yrAvg" },
        { data : "setup.nd_aebitda.5yrAvg" },
        { data : "setup.nd_aebitda.10yrAvg" },
        { data : "setup.nd_aebitda.ttm/5yr" },
        { data : "setup.nd_aebitda.ttm/10yr" },
        { data : "setup.nd_aebitda.5stdev" },
        { data : "setup.nd_aebitda.10stdev" },

        { data : "stockdata.0.nd_aebitdaFcf"},
        { data : "stockdata.0.cap_lease_debt"},

        { data : "stockdata.0.capex_sales" },
        { data : "setup.capex_sales.3yrAvg" },
        { data : "setup.capex_sales.5yrAvg" },
        { data : "setup.capex_sales.10yrAvg" },
        { data : "setup.capex_sales.ttm/5yr" },
        { data : "setup.capex_sales.ttm/10yr" },
        { data : "setup.capex_sales.5stdev" },
        { data : "setup.capex_sales.10stdev" },

        { data : "stockdata.0.capex_ownerEarnings" },
        { data : "setup.capex_ownerEarnings.3yrAvg" },
        { data : "setup.capex_ownerEarnings.5yrAvg" },
        { data : "setup.capex_ownerEarnings.10yrAvg" },
        { data : "setup.capex_ownerEarnings.ttm/5yr" },
        { data : "setup.capex_ownerEarnings.ttm/10yr" },
        { data : "setup.capex_ownerEarnings.5stdev" },
        { data : "setup.capex_ownerEarnings.10stdev" },
        
        { data : "stockdata.0.capex_fcf" },
        { data : "setup.capex_fcf.3yrAvg" },
        { data : "setup.capex_fcf.5yrAvg" },
        { data : "setup.capex_fcf.10yrAvg" },
        { data : "setup.capex_fcf.ttm/5yr" },
        { data : "setup.capex_fcf.ttm/10yr" },
        { data : "setup.capex_fcf.5stdev" },
        { data : "setup.capex_fcf.10stdev" },
        
        { data : "stockdata.0.fcfNetIncome" },
        { data : "setup.fcfNetIncome.3yrAvg" },
        { data : "setup.fcfNetIncome.5yrAvg" },
        { data : "setup.fcfNetIncome.10yrAvg" },
        { data : "setup.fcfNetIncome.ttm/5yr" },
        { data : "setup.fcfNetIncome.ttm/10yr" },
        { data : "setup.fcfNetIncome.5stdev" },
        { data : "setup.fcfNetIncome.10stdev" },
        
        { data : "stockdata.0.fcfOwnerEarnings" },
        { data : "setup.fcfOwnerEarnings.3yrAvg" },
        { data : "setup.fcfOwnerEarnings.5yrAvg" },
        { data : "setup.fcfOwnerEarnings.10yrAvg" },
        { data : "setup.fcfOwnerEarnings.ttm/5yr" },
        { data : "setup.fcfOwnerEarnings.ttm/10yr" },
        { data : "setup.fcfOwnerEarnings.5stdev" },
        { data : "setup.fcfOwnerEarnings.10stdev" },

        { data : "stockdata.0.cash_conversion_cycle" },
        { data : "setup.cash_conversion_cycle.3yrAvg" },
        { data : "setup.cash_conversion_cycle.5yrAvg" },
        { data : "setup.cash_conversion_cycle.10yrAvg" },
        { data : "setup.cash_conversion_cycle.ttm/5yr" },
        { data : "setup.cash_conversion_cycle.ttm/10yr" },
        { data : "setup.cash_conversion_cycle.5stdev" },
        { data : "setup.cash_conversion_cycle.10stdev" },

        { data : "predictability" },
        { data : "financialStrength" },

        { data : "setup.sales.compGrowth1yr"},
        { data : "setup.sales.compGrowth3yr"},
        { data : "setup.sales.compGrowth5yr"},
        { data : "setup.sales.compGrowth10yr"},

        { data : "setup.salesshare.compGrowth1yr"},
        { data : "setup.salesshare.compGrowth3yr"},
        { data : "setup.salesshare.compGrowth5yr"},
        { data : "setup.salesshare.compGrowth10yr"},

        { data : "setup.ownerEarningShare.compGrowth1yr"},
        { data : "setup.ownerEarningShare.compGrowth3yr"},
        { data : "setup.ownerEarningShare.compGrowth5yr"},
        { data : "setup.ownerEarningShare.compGrowth10yr"},

        { data : "setup.fcfShare.compGrowth1yr"},
        { data : "setup.fcfShare.compGrowth3yr"},
        { data : "setup.fcfShare.compGrowth5yr"},
        { data : "setup.fcfShare.compGrowth10yr"},

        { data : "setup.aebitdaShare.compGrowth1yr"},
        { data : "setup.aebitdaShare.compGrowth3yr"},
        { data : "setup.aebitdaShare.compGrowth5yr"},
        { data : "setup.aebitdaShare.compGrowth10yr"},

        { data : "setup.dividendShare.compGrowth1yr"},
        { data : "setup.dividendShare.compGrowth3yr"},
        { data : "setup.dividendShare.compGrowth5yr"},
        { data : "setup.dividendShare.compGrowth10yr"},

        { data : "setup.price.compGrowth1yr"},
        { data : "setup.price.compGrowth3yr"},
        { data : "setup.price.compGrowth5yr"},
        { data : "setup.price.compGrowth10yr"},

        { data : "stockdata.0.sgr" },
        { data : "setup.sgr.3yrAvg" },
        { data : "setup.sgr.5yrAvg" },
        { data : "setup.sgr.10yrAvg" },
        { data : "setup.sgr.ttm/5yr" },
        { data : "setup.sgr.ttm/10yr" },
        { data : "setup.sgr.5stdev" },
        { data : "setup.sgr.10stdev" },

        { data : "stockdata.0.fror" },
        { data : "stockdata.0.expected_annual_total_return" },

        { data : "calculations.bvpsY10" },
        { data : "calculations.fcfShareY10" },
        { data : "calculations.stockPriceY10" },
        { data : "setup.dividendYield.10yrAvg" },
        { data : "calculations.projected10ror" },
        { data : "calculations.projected10Total" },

        { data : "stockdata.0.shares_outstanding_format"},
        { data : "soChangePercent_1" },
        { data : "soChangePercent_3" },
        { data : "soChangePercent_5" },
        { data : "soChangePercent_10" },

        { data : "stockdata.0.dividendPayoutRatio" },
        { data : "setup.dividendPayoutRatio.3yrAvg" },
        { data : "setup.dividendPayoutRatio.5yrAvg" },
        { data : "setup.dividendPayoutRatio.10yrAvg" },
        { data : "setup.dividendPayoutRatio.ttm/5yr" },
        { data : "setup.dividendPayoutRatio.ttm/10yr" },
        { data : "setup.dividendPayoutRatio.5stdev" },
        { data : "setup.dividendPayoutRatio.10stdev" },

        { data : "setup.cashflow_reinvestment_rate.5yrAvg"},

        { data : "stockdata.0.evFcf"},
        { data : "setup.evFcf.3yrAvg" },
        { data : "setup.evFcf.5yrAvg" },
        { data : "setup.evFcf.10yrAvg" },
        { data : "setup.evFcf.ttm/5yr" },
        { data : "setup.evFcf.ttm/10yr" },
        { data : "setup.evFcf.5stdev" },
        { data : "setup.evFcf.10stdev" },

        { data : "stockdata.0.fcfYield"},
        { data : "setup.fcfYield.3yrAvg" },
        { data : "setup.fcfYield.5yrAvg" },
        { data : "setup.fcfYield.10yrAvg" },
        { data : "setup.fcfYield.ttm/5yr" },
        { data : "setup.fcfYield.ttm/10yr" },
        { data : "setup.fcfYield.5stdev" },
        { data : "setup.fcfYield.10stdev" },

        { data : "calculations.rule_of_40"},

        { data : "stockdata.0.fcfSpice"},
        { data : "setup.fcfSpice.3yrAvg" },
        { data : "setup.fcfSpice.5yrAvg" },
        { data : "setup.fcfSpice.10yrAvg" },
        { data : "setup.fcfSpice.ttm/5yr" },
        { data : "setup.fcfSpice.ttm/10yr" },
        { data : "setup.fcfSpice.5stdev" },
        { data : "setup.fcfSpice.10stdev" },

        { data : "stockdata.0.aebitda_spice" },
        { data : "stockdata.0.roe_spice" },
        
        { data : "stockdata.1.fcfEmployee" },
        { data : "fcfEmployee3" },
        { data : "fcfEmployee5" },
        { data : "fcfEmployee10" },

        { data : "stockdata.0.purchase_of_business" },
        { data : "setup.purchase_of_business.3yrAvg" },
        { data : "setup.purchase_of_business.5yrAvg" },
        { data : "setup.purchase_of_business.10yrAvg" },
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

function formatEdit(row){
    // return `<button type="button" id="edit${row.stock_id}" onclick='open_edit("${row.symbol}", "${row.stock_id}", "${row.note.replaceAll('\n', '\\n')}", "${row.emoticon}", "${row.onestar}" , "${row.fivestar}", "${row.fairvalue}","${row.moat}", "${row.jdv}", "${row.stock_current_price}", "${row.gfrating}", "${row.ownership}", "${row.msse}", "${row.mCapAve_5}", "${row.mCapAve_10}", "${row.mCapAve_15}", "${row.links}")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`.replace(/[\n\r]/g, "")
}
