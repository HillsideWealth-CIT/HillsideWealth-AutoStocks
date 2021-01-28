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
                { text:'Key Stats Rest', action: function(){keyStats_Rest();}},
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
                    evFcf: row.stockdata[0].evFcf,
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
                    <button type="button" onclick='open_calc("${row.stockdata[0].eps_without_nri}", "${row.growth_rate_5y}", "${row.growth_rate_10y}", "${row.growth_rate_15y}", "${row.stockdata[0].terminal_growth_rate}","${row.stockdata[0].discount_rate}","${row.stockdata[0].growth_years}","${row.stockdata[0].terminal_years}", )' class="btn btn-link btn-sm"><span class="fas fa-calculator"></span></button>
                    <button type="button" onclick='show_financials("${row.symbol}", "${row.stock_id}")' class="btn btn-link btn-sm"><span class="fas fa-history"></span></button>
                </div>
                `;
            }    
        },
        { data : "stock_name"},
        { data : "stockdata.0.datestring" },
        { defaultContent: 0 },
        { data : "stock_current_price" },

        { data : "stockdata.0.fcfSpice", type : "any-number" },
        { data : "setup.fcfSpice.3yrAvg", type : "any-number" },
        { data : "setup.fcfSpice.5yrAvg", type : "any-number" },
        { data : "setup.fcfSpice.10yrAvg", type : "any-number" },
        { data : "setup.fcfSpice.ttm/5yr", type : "any-number"
        },
        { data : "setup.fcfSpice.ttm/10yr", type : "any-number" },
        { data : "setup.fcfSpice.5stdev", type : "any-number"},
        { data : "setup.fcfSpice.10stdev", type : "any-number" },

        { data : "stockdata.0.fcfYield", type : "any-number" },
        { data : "setup.fcfYield.3yrAvg", type : "any-number" },
        { data : "setup.fcfYield.5yrAvg", type : "any-number" },
        { data : "setup.fcfYield.10yrAvg", type : "any-number" },
        { data : "setup.fcfYield.ttm/5yr", type : "any-number" },
        { data : "setup.fcfYield.ttm/10yr", type : "any-number" },
        { data : "setup.fcfYield.5stdev", type : "any-number" },
        { data : "setup.fcfYield.10stdev", type : "any-number" },

        { data : "stockdata.0.yield_format", type : "any-number" },
        { data : "stockdata.0.enterprise_value_format"},
        { data : "categories" },

        { data : "stockdata.0.fcfroic", type : "any-number" },
        { data : "setup.fcfroic.3yrAvg", type : "any-number" },
        { data : "setup.fcfroic.5yrAvg", type : "any-number" },
        { data : "setup.fcfroic.10yrAvg", type : "any-number" },
        { data : "setup.fcfroic.ttm/5yr", type : "any-number" },
        { data : "setup.fcfroic.ttm/10yr", type : "any-number" },
        { data : "setup.fcfroic.5stdev", type : "any-number" },
        { data : "setup.fcfroic.10stdev", type : "any-number" },

        { data : "stockdata.0.fcfroa", type : "any-number" },
        { data : "setup.fcfroa.3yrAvg", type : "any-number" },
        { data : "setup.fcfroa.5yrAvg", type : "any-number" },
        { data : "setup.fcfroa.10yrAvg", type : "any-number" },
        { data : "setup.fcfroa.ttm/5yr", type : "any-number" },
        { data : "setup.fcfroa.ttm/10yr", type : "any-number" },
        { data : "setup.fcfroa.5stdev", type : "any-number" },
        { data : "setup.fcfroa.10stdev", type : "any-number" },

        { data : "stockdata.0.fcfroe", type : "any-number" },
        { data : "setup.fcfroe.3yrAvg", type : "any-number" },
        { data : "setup.fcfroe.5yrAvg", type : "any-number" },
        { data : "setup.fcfroe.10yrAvg", type : "any-number" },
        { data : "setup.fcfroe.ttm/5yr", type : "any-number" },
        { data : "setup.fcfroe.ttm/10yr", type : "any-number" },
        { data : "setup.fcfroe.5stdev", type : "any-number" },
        { data : "setup.fcfroe.10stdev", type : "any-number" },

        { data : "stockdata.0.fcfRoce", type : "any-number" },
        { data : "setup.fcfRoce.3yrAvg", type : "any-number" },
        { data : "setup.fcfRoce.5yrAvg", type : "any-number" },
        { data : "setup.fcfRoce.10yrAvg", type : "any-number" },
        { data : "setup.fcfRoce.ttm/5yr", type : "any-number" },
        { data : "setup.fcfRoce.ttm/10yr", type : "any-number" },
        { data : "setup.fcfRoce.5stdev", type : "any-number" },
        { data : "setup.fcfRoce.10stdev", type : "any-number" },

        { data : "stockdata.0.fcfRota", type : "any-number" },
        { data : "setup.fcfRota.3yrAvg", type : "any-number" },
        { data : "setup.fcfRota.5yrAvg", type : "any-number" },
        { data : "setup.fcfRota.10yrAvg", type : "any-number" },
        { data : "setup.fcfRota.ttm/5yr", type : "any-number" },
        { data : "setup.fcfRota.ttm/10yr", type : "any-number" },
        { data : "setup.fcfRota.5stdev", type : "any-number" },
        { data : "setup.fcfRota.10stdev", type : "any-number" },

        { data : "calculations.incrementalRoe1yr", type : "any-number"},
        { data : "calculations.incrementalRoe3yr", type : "any-number"},
        { data : "calculations.incrementalRoe5yr", type : "any-number"},
        { data : "calculations.incrementalRoe10yr", type : "any-number"},

        { data : "calculations.incrementalRoic1yr", type : "any-number"},
        { data : "calculations.incrementalRoic3yr", type : "any-number"},
        { data : "calculations.incrementalRoic5yr", type : "any-number"},
        { data : "calculations.incrementalRoic10yr", type : "any-number"},

        { data : "calculations.incrementalJDVROIC1yr", type : "any-number"},
        { data : "calculations.incrementalJDVROIC3yr", type : "any-number"},
        { data : "calculations.incrementalJDVROIC5yr", type : "any-number"},
        { data : "calculations.incrementalJDVROIC10yr", type : "any-number"},

        { data : "stockdata.0.cashflow_reinvestment_rate", type : "any-number"},
        { data : "setup.cashflow_reinvestment_rate.3yrAvg", type : "any-number"},
        { data : "setup.cashflow_reinvestment_rate.5yrAvg", type : "any-number"},
        { data : "setup.cashflow_reinvestment_rate.10yrAvg", type : "any-number"},
        { data : "setup.cashflow_reinvestment_rate.ttm/5yr", type : "any-number"},
        { data : "setup.cashflow_reinvestment_rate.ttm/10yr", type : "any-number"},
        { data : "setup.cashflow_reinvestment_rate.5stdev", type : "any-number"},
        { data : "setup.cashflow_reinvestment_rate.10stdev", type : "any-number"},

        { data : "stockdata.0.grossmargin", type : "any-number" },
        { data : "setup.grossmargin.3yrAvg", type : "any-number" },
        { data : "setup.grossmargin.5yrAvg", type : "any-number" },
        { data : "setup.grossmargin.10yrAvg", type : "any-number" },
        { data : "setup.grossmargin.ttm/5yr", type : "any-number" },
        { data : "setup.grossmargin.ttm/10yr", type : "any-number" },
        { data : "setup.grossmargin.5stdev", type : "any-number" },
        { data : "setup.grossmargin.10stdev", type : "any-number" },

        { data : "stockdata.0.operatingmargin", type : "any-number" },
        { data : "setup.operatingmargin.3yrAvg", type : "any-number" },
        { data : "setup.operatingmargin.5yrAvg", type : "any-number" },
        { data : "setup.operatingmargin.10yrAvg", type : "any-number" },
        { data : "setup.operatingmargin.ttm/5yr", type : "any-number" },
        { data : "setup.operatingmargin.ttm/10yr", type : "any-number" },
        { data : "setup.operatingmargin.5stdev", type : "any-number" },
        { data : "setup.operatingmargin.10stdev", type : "any-number" },

        { data : "stockdata.0.fcfmargin", type : "any-number" },
        { data : "setup.fcfmargin.3yrAvg", type : "any-number" },
        { data : "setup.fcfmargin.5yrAvg", type : "any-number" },
        { data : "setup.fcfmargin.10yrAvg", type : "any-number" },
        { data : "setup.fcfmargin.ttm/5yr", type : "any-number" },
        { data : "setup.fcfmargin.ttm/10yr", type : "any-number" },
        { data : "setup.fcfmargin.5stdev", type : "any-number" },
        { data : "setup.fcfmargin.10stdev", type : "any-number" },

        { data : "stockdata.0.nd_aebitda", type : "any-number" },
        { data : "setup.nd_aebitda.3yrAvg", type : "any-number" },
        { data : "setup.nd_aebitda.5yrAvg", type : "any-number" },
        { data : "setup.nd_aebitda.10yrAvg", type : "any-number" },
        { data : "setup.nd_aebitda.ttm/5yr", type : "any-number" },
        { data : "setup.nd_aebitda.ttm/10yr", type : "any-number" },
        { data : "setup.nd_aebitda.5stdev", type : "any-number" },
        { data : "setup.nd_aebitda.10stdev", type : "any-number" },

        { data : "stockdata.0.ndFcf", type : "any-number"},
        { data : "setup.ndFcf.3yrAvg" , type : "any-number"},
        { data : "setup.ndFcf.5yrAvg" , type : "any-number"},
        { data : "setup.ndFcf.10yrAvg" , type : "any-number"},
        { data : "setup.ndFcf.ttm/5yr" , type : "any-number"},
        { data : "setup.ndFcf.ttm/10yr" , type : "any-number"},
        { data : "setup.ndFcf.5stdev" , type : "any-number"},
        { data : "setup.ndFcf.10stdev" , type : "any-number"},

        { data : "stockdata.0.cap_lease_debt"},

        { data : "stockdata.0.capex_sales", type : "any-number" },
        { data : "setup.capex_sales.3yrAvg", type : "any-number" },
        { data : "setup.capex_sales.5yrAvg", type : "any-number" },
        { data : "setup.capex_sales.10yrAvg", type : "any-number" },
        { data : "setup.capex_sales.ttm/5yr", type : "any-number" },
        { data : "setup.capex_sales.ttm/10yr", type : "any-number" },
        { data : "setup.capex_sales.5stdev", type : "any-number" },
        { data : "setup.capex_sales.10stdev", type : "any-number" },

        { data : "stockdata.0.capex_ownerEarnings", type : "any-number" },
        { data : "setup.capex_ownerEarnings.3yrAvg", type : "any-number" },
        { data : "setup.capex_ownerEarnings.5yrAvg", type : "any-number" },
        { data : "setup.capex_ownerEarnings.10yrAvg", type : "any-number" },
        { data : "setup.capex_ownerEarnings.ttm/5yr", type : "any-number" },
        { data : "setup.capex_ownerEarnings.ttm/10yr", type : "any-number" },
        { data : "setup.capex_ownerEarnings.5stdev", type : "any-number" },
        { data : "setup.capex_ownerEarnings.10stdev", type : "any-number" },
        
        { data : "stockdata.0.capex_fcf", type : "any-number" },
        { data : "setup.capex_fcf.3yrAvg", type : "any-number" },
        { data : "setup.capex_fcf.5yrAvg", type : "any-number" },
        { data : "setup.capex_fcf.10yrAvg", type : "any-number" },
        { data : "setup.capex_fcf.ttm/5yr", type : "any-number" },
        { data : "setup.capex_fcf.ttm/10yr", type : "any-number" },
        { data : "setup.capex_fcf.5stdev", type : "any-number" },
        { data : "setup.capex_fcf.10stdev", type : "any-number" },
        
        { data : "stockdata.0.fcfNetIncome", type : "any-number" },
        { data : "setup.fcfNetIncome.3yrAvg", type : "any-number" },
        { data : "setup.fcfNetIncome.5yrAvg", type : "any-number" },
        { data : "setup.fcfNetIncome.10yrAvg", type : "any-number" },
        { data : "setup.fcfNetIncome.ttm/5yr", type : "any-number" },
        { data : "setup.fcfNetIncome.ttm/10yr", type : "any-number" },
        { data : "setup.fcfNetIncome.5stdev", type : "any-number" },
        { data : "setup.fcfNetIncome.10stdev", type : "any-number" },
        
        { data : "stockdata.0.fcfOwnerEarnings", type : "any-number" },
        { data : "setup.fcfOwnerEarnings.3yrAvg", type : "any-number" },
        { data : "setup.fcfOwnerEarnings.5yrAvg", type : "any-number" },
        { data : "setup.fcfOwnerEarnings.10yrAvg", type : "any-number" },
        { data : "setup.fcfOwnerEarnings.ttm/5yr", type : "any-number" },
        { data : "setup.fcfOwnerEarnings.ttm/10yr", type : "any-number" },
        { data : "setup.fcfOwnerEarnings.5stdev", type : "any-number" },
        { data : "setup.fcfOwnerEarnings.10stdev", type : "any-number" },

        { data : "stockdata.0.cash_conversion_cycle", type : "any-number" },
        { data : "setup.cash_conversion_cycle.3yrAvg", type : "any-number" },
        { data : "setup.cash_conversion_cycle.5yrAvg", type : "any-number" },
        { data : "setup.cash_conversion_cycle.10yrAvg", type : "any-number" },
        { data : "setup.cash_conversion_cycle.ttm/5yr", type : "any-number" },
        { data : "setup.cash_conversion_cycle.ttm/10yr", type : "any-number" },
        { data : "setup.cash_conversion_cycle.5stdev", type : "any-number" },
        { data : "setup.cash_conversion_cycle.10stdev", type : "any-number" },

        { data : "predictability" },
        { data : "financialStrength" },

        { data : "setup.sales.compGrowth1yr", type : "any-number" },
        { data : "setup.sales.compGrowth3yr", type : "any-number" },
        { data : "setup.sales.compGrowth5yr", type : "any-number" },
        { data : "setup.sales.compGrowth10yr", type : "any-number" },

        { data : "setup.salesshare.compGrowth1yr", type : "any-number" },
        { data : "setup.salesshare.compGrowth3yr", type : "any-number" },
        { data : "setup.salesshare.compGrowth5yr", type : "any-number" },
        { data : "setup.salesshare.compGrowth10yr", type : "any-number" },

        { data : "setup.ownerEarningShare.compGrowth1yr", type : "any-number"},
        { data : "setup.ownerEarningShare.compGrowth3yr", type : "any-number"},
        { data : "setup.ownerEarningShare.compGrowth5yr", type : "any-number"},
        { data : "setup.ownerEarningShare.compGrowth10yr", type : "any-number"},

        { data : "setup.fcfShare.compGrowth1yr", type : "any-number"}, 
        { data : "setup.fcfShare.compGrowth3yr", type : "any-number"}, 
        { data : "setup.fcfShare.compGrowth5yr", type : "any-number"}, 
        { data : "setup.fcfShare.compGrowth10yr", type : "any-number"}, 

        { data : "setup.aebitdaShare.compGrowth1yr", type : "any-number"},
        { data : "setup.aebitdaShare.compGrowth3yr", type : "any-number"},
        { data : "setup.aebitdaShare.compGrowth5yr", type : "any-number"},
        { data : "setup.aebitdaShare.compGrowth10yr", type : "any-number"},

        { data : "setup.dividendShare.compGrowth1yr", type : "any-number"},
        { data : "setup.dividendShare.compGrowth3yr", type : "any-number"},
        { data : "setup.dividendShare.compGrowth5yr", type : "any-number"},
        { data : "setup.dividendShare.compGrowth10yr", type : "any-number"},

        { data : "setup.price.compGrowth1yr", type : "any-number"},
        { data : "setup.price.compGrowth3yr", type : "any-number"},
        { data : "setup.price.compGrowth5yr", type : "any-number"},
        { data : "setup.price.compGrowth10yr", type : "any-number"},

        { data : "stockdata.0.sgr", type : "any-number" },
        { data : "setup.sgr.3yrAvg", type : "any-number" },
        { data : "setup.sgr.5yrAvg", type : "any-number" },
        { data : "setup.sgr.10yrAvg", type : "any-number" },
        { data : "setup.sgr.ttm/5yr", type : "any-number" },
        { data : "setup.sgr.ttm/10yr", type : "any-number" },
        { data : "setup.sgr.5stdev", type : "any-number" },
        { data : "setup.sgr.10stdev", type : "any-number" },

        { data : "stockdata.0.fror", type : "any-number" },
        { data : "stockdata.0.expected_annual_total_return", type : "any-number" },

        { data : "calculations.bvpsY10", type : "any-number" },
        { data : "calculations.fcfShareY10", type : "any-number" },
        { data : "calculations.stockPriceY10", type : "any-number" },
        { data : "setup.dividendYield.10yrAvg", type : "any-number" },
        { data : "calculations.projected10ror", type : "any-number" },
        { data : "calculations.projected10Total", type : "any-number" },

        { data : "stockdata.0.shares_outstanding_format", type : "any-number" },
        { data : "soChangePercent_1", type : "any-number" },
        { data : "soChangePercent_3", type : "any-number" },
        { data : "soChangePercent_5", type : "any-number" },
        { data : "soChangePercent_10", type : "any-number" },

        { data : "stockdata.0.dividendPayoutRatio", type : "any-number" },
        { data : "setup.dividendPayoutRatio.3yrAvg", type : "any-number" },
        { data : "setup.dividendPayoutRatio.5yrAvg", type : "any-number" },
        { data : "setup.dividendPayoutRatio.10yrAvg", type : "any-number" },
        { data : "setup.dividendPayoutRatio.ttm/5yr", type : "any-number" },
        { data : "setup.dividendPayoutRatio.ttm/10yr", type : "any-number" },
        { data : "setup.dividendPayoutRatio.5stdev", type : "any-number" },
        { data : "setup.dividendPayoutRatio.10stdev", type : "any-number" },

        { data : "setup.cashflow_reinvestment_rate.5yrAvg"},

        { data : "stockdata.0.evFcf", type : "any-number" },
        { data : "setup.evFcf.3yrAvg", type : "any-number" },
        { data : "setup.evFcf.5yrAvg", type : "any-number" },
        { data : "setup.evFcf.10yrAvg", type : "any-number" },
        { data : "setup.evFcf.ttm/5yr", type : "any-number" },
        { data : "setup.evFcf.ttm/10yr", type : "any-number" },
        { data : "setup.evFcf.5stdev", type : "any-number" },
        { data : "setup.evFcf.10stdev", type : "any-number" },

        { data : "stockdata.0.fcfYield", type : "any-number" },
        { data : "setup.fcfYield.3yrAvg", type : "any-number" },
        { data : "setup.fcfYield.5yrAvg", type : "any-number" },
        { data : "setup.fcfYield.10yrAvg", type : "any-number" },
        { data : "setup.fcfYield.ttm/5yr", type : "any-number" },
        { data : "setup.fcfYield.ttm/10yr", type : "any-number" },
        { data : "setup.fcfYield.5stdev", type : "any-number" },
        { data : "setup.fcfYield.10stdev", type : "any-number" },

        { data : "calculations.rule_of_40"},

        { data : "stockdata.0.fcfSpice", type : "any-number" },
        { data : "setup.fcfSpice.3yrAvg", type : "any-number" },
        { data : "setup.fcfSpice.5yrAvg", type : "any-number" },
        { data : "setup.fcfSpice.10yrAvg", type : "any-number" },
        { data : "setup.fcfSpice.ttm/5yr", type : "any-number" },
        { data : "setup.fcfSpice.ttm/10yr", type : "any-number" },
        { data : "setup.fcfSpice.5stdev", type : "any-number" },
        { data : "setup.fcfSpice.10stdev", type : "any-number" },

        { data : "stockdata.0.aebitda_spice", type : "any-number" },
        { data : "stockdata.0.roe_spice", type : "any-number" },

        { data : "stockdata.0.urbem_value", type : "any-number" },

        { 
            data : null,
            render: (data, type, row, meta) => {
                try{
                    return row.stockdata[3].urbem_value
                }
                catch{
                    return '0.0'
                }
            }
        },
        { 
            data : null,
            render: (data, type, row, meta) => {
                try{
                    return row.stockdata[5].urbem_value
                }
                catch{
                    return '0.0'
                }
            }
        },
        { data : "stockdata.0.fcfEmployee" },
        { data : "setup.fcfEmployee.3yrAvg" },
        { data : "setup.fcfEmployee.5yrAvg" },
        { data : "setup.fcfEmployee.10yrAvg" },

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
