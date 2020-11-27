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
    ajax_Call("init_temp", "/init_table").then((resolve) => {
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
        rowId : `stock_id`,
        select : { selector: 'td:first-child', style : 'multi' },
        columns : column_builder(),
        fixedColumns: { leftColumns: 2 },
        scrollX : true,
        scrollY : '70vh',
        deferRender : true,
        scroller: true,
        order : [[shareConf ? 9 : 8, 'desc']],
    });
    return datatable;
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
                // button 1: takes user to gurufocus graph
                return `<button type="button" onclick='open_chart("${row.symbol}")' class="btn btn-link btn-sm"><span class="fas fa-chart-line"></span></button>`;
            }    
        },
        {   data : null,
            orderable : false,
            className: 'setting_cell',
            render: function( data, type, row, meta){
                // button 2: Comments, emoticon, morning star, guru rating, JDV
                if(row.note === null) row.note = '';
                return `<button type="button" id="edit${row.stock_id}" onclick='open_edit("${row.symbol}", "${row.stock_id}", "${row.note.replaceAll('\n', '\\n')}", "${row.emoticon}", "${row.onestar}" , "${row.fivestar}", "${row.fairvalue}","${row.moat}", "${row.jdv}", "${row.stock_current_price}", "${row.gfrating}", "${row.ownership}", "${row.msse}", "${row.mCapAve_5}", "${row.mCapAve_10}", "${row.mCapAve_15}", "${row.links}")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`.replace(/[\n\r]/g, "");
            }    
        },
        {   data : null,
            orderable : false,
            className: 'setting_cell',
            render: function( data, type, row, meta){
                // button 3: DCF calculator
                return `<button type="button" onclick='open_calc("${row.stockdata[0].eps_without_nri}", "${row.growth_rate_5y}", "${row.growth_rate_10y}", "${row.growth_rate_15y}", "${row.stockdata[0].terminal_growth_rate}","${row.stockdata[0].discount_rate}","${row.stockdata[0].growth_years}","${row.stockdata[0].terminal_years}", )' class="btn btn-link btn-sm"><span class="fas fa-calculator"></span></button>`;
            }    
        },
        {   data : null,
            orderable : false,
            className: 'setting_cell',
            render: function( data, type, row, meta){
                // button 4: 15 Year historical Financial Data
                return `<button type="button" onclick='show_financials("${row.symbol}", "${row.stock_id}")' class="btn btn-link btn-sm"><span class="fas fa-history"></span></button>`;
            }    
        },
        {   data : null,
            orderable : false,
            className: 'setting_cell',
            render: function( data, type, row, meta){
                // button 4: 15 Year historical Financial Data
                return `<button type="button" onclick='linksMenu("${row.links}", "${row.symbol}")' class="btn btn-link btn-sm"><span class="fas fa-external-link-alt"></span></button>`;
            }    
        },
        { 
            defaultContent: 0
        },
        { data : "stock_name" },
        
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

        { data : "calculations.roce"},

        { data : "stockdata.0.grossmargin" },
        { data : "setup.grossMargin.3yrAvg" },
        { data : "setup.grossMargin.5yrAvg" },
        { data : "setup.grossMargin.10yrAvg" },
        { data : "setup.grossMargin.ttm/5yr" },
        { data : "setup.grossMargin.ttm/10yr" },
        { data : "setup.grossMargin.5stdev" },
        { data : "setup.grossMargin.10stdev" },

        { data : "stockdata.0.operatingmargin" },
        { data : "setup.operatingmargin.3yrAvg" },
        { data : "setup.operatingmargin.5yrAvg" },
        { data : "setup.operatingmargin.10yrAvg" },
        { data : "setup.operatingmargin.ttm/5yr" },
        { data : "setup.operatingmargin.ttm/10yr" },
        { data : "setup.operatingmargin.5stdev" },
        { data : "setup.operatingmargin.10stdev" },

        { data : "stockdata.0.netmargin" },
        { data : "setup.netmargin.3yrAvg" },
        { data : "setup.netmargin.5yrAvg" },
        { data : "setup.netmargin.10yrAvg" },
        { data : "setup.netmargin.ttm/5yr" },
        { data : "setup.netmargin.ttm/10yr" },
        { data : "setup.netmargin.5stdev" },
        { data : "setup.netmargin.10stdev" },

        { data : "stockdata.0.fcfmargin" },
        { data : "setup.fcfmargin.3yrAvg" },
        { data : "setup.fcfmargin.5yrAvg" },
        { data : "setup.fcfmargin.10yrAvg" },
        { data : "setup.fcfmargin.ttm/5yr" },
        { data : "setup.fcfmargin.ttm/10yr" },
        { data : "setup.fcfmargin.5stdev" },
        { data : "setup.fcfmargin.10stdev" },

        { data : "stockdata.0.cashflow_reinvestment_rate" },

        { data : "stockdata.0.nd_aebitda" },
        { data : "setup.nd_aebitda.3yrAvg" },
        { data : "setup.nd_aebitda.5yrAvg" },
        { data : "setup.nd_aebitda.10yrAvg" },
        { data : "setup.nd_aebitda.ttm/5yr" },
        { data : "setup.nd_aebitda.ttm/10yr" },
        { data : "setup.nd_aebitda.5stdev" },
        { data : "setup.nd_aebitda.10stdev" },

        { data : "stockdata.0.nd_aebitdaFcf" },
        { data : "setup.nd_aebitdaFcf.3yrAvg" },
        { data : "setup.nd_aebitdaFcf.5yrAvg" },
        { data : "setup.nd_aebitdaFcf.10yrAvg" },
        { data : "setup.nd_aebitdaFcf.ttm/5yr" },
        { data : "setup.nd_aebitdaFcf.ttm/10yr" },
        { data : "setup.nd_aebitdaFcf.5stdev" },
        { data : "setup.nd_aebitdaFcf.10stdev" },

        { data : "stockdata.0.cap_lease_debt"},

        { data : "predictability" },
        { data : "financialStrength" },

        { data : "stockdata.0.revenue" },
        { data : "setup.sales.compGrowth3yr" },
        { data : "setup.sales.compGrowth5yr" },
        { data : "setup.sales.compGrowth10yr" },
        { data : "setup.sales.ttm/5yr" },
        { data : "setup.sales.ttm/10yr" },
        { data : "setup.sales.5stdev" },
        { data : "setup.sales.10stdev" },

        { data : "stockdata.0.salesshare" },
        { data : "setup.salesshare.compGrowth3yr" },
        { data : "setup.salesshare.compGrowth5yr" },
        { data : "setup.salesshare.compGrowth10yr" },
        { data : "setup.salesshare.ttm/5yr" },
        { data : "setup.salesshare.ttm/10yr" },
        { data : "setup.salesshare.5stdev" },
        { data : "setup.salesshare.10stdev" },

        { data : "stockdata.0.ownerEarningShare" },
        { data : "setup.ownerEarningShare.compGrowth3yr" },
        { data : "setup.ownerEarningShare.compGrowth5yr" },
        { data : "setup.ownerEarningShare.compGrowth10yr" },
        { data : "setup.ownerEarningShare.ttm/5yr" },
        { data : "setup.ownerEarningShare.ttm/10yr" },
        { data : "setup.ownerEarningShare.5stdev" },
        { data : "setup.ownerEarningShare.10stdev" },

        { data : "stockdata.0.fcfShare" },
        { data : "setup.fcfShare.compGrowth3yr" },
        { data : "setup.fcfShare.compGrowth5yr" },
        { data : "setup.fcfShare.compGrowth10yr" },
        { data : "setup.fcfShare.ttm/5yr" },
        { data : "setup.fcfShare.ttm/10yr" },
        { data : "setup.fcfShare.5stdev" },
        { data : "setup.fcfShare.10stdev" },

        { data : "stockdata.0.aebitdaShare"},

        { data : "stockdata.0.sgr" },
        { data : "setup.sgr.3yrAvg" },
        { data : "setup.sgr.5yrAvg" },
        { data : "setup.sgr.10yrAvg" },
        { data : "setup.sgr.ttm/5yr" },
        { data : "setup.sgr.ttm/10yr" },
        { data : "setup.sgr.5stdev" },
        { data : "setup.sgr.10stdev" },

        { data : "stockdata.0.fror"},

        { data : "calculations.bvpsY10"},
        { data : "calculations.fcfShareY10"},
        { data : "calculations.stockPriceY10"},
        { data : "setup.dividendYield.10yrAvg"},
        { data : "calculations.projected10ror"},
        { data : "calculations.projected10Total"},

        { data: "stockdata.0.expected_annual_total_return"},

        { data : "stockdata.0.capex_sales"},
        { data : "stockdata.0.capex_ownerEarnings"},
        { data : "stockdata.0.capex_fcf"},

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

        { data : "stockdata.0.dividendShare" },
        { data : "setup.dividendShare.3yrAvg" },
        { data : "setup.dividendShare.5yrAvg" },
        { data : "setup.dividendShare.10yrAvg" },
        { data : "setup.dividendShare.ttm/5yr" },
        { data : "setup.dividendShare.ttm/10yr" },
        { data : "setup.dividendShare.5stdev" },
        { data : "setup.dividendShare.10stdev" },

        { data : "stockdata.0.shares_outstanding" },
        { data : "setup.shares_outstanding.3yrAvg" },
        { data : "setup.shares_outstanding.5yrAvg" },
        { data : "setup.shares_outstanding.10yrAvg" },
        { data : "setup.shares_outstanding.ttm/5yr" },
        { data : "setup.shares_outstanding.ttm/10yr" },
        { data : "setup.shares_outstanding.5stdev" },
        { data : "setup.shares_outstanding.10stdev" },

        { data : "stockdata.0.dividendPayoutRatio" },
        { data : "setup.dividendPayoutRatio.3yrAvg" },
        { data : "setup.dividendPayoutRatio.5yrAvg" },
        { data : "setup.dividendPayoutRatio.10yrAvg" },
        { data : "setup.dividendPayoutRatio.ttm/5yr" },
        { data : "setup.dividendPayoutRatio.ttm/10yr" },
        { data : "setup.dividendPayoutRatio.5stdev" },
        { data : "setup.dividendPayoutRatio.10stdev" },

        { data : "stockdata.0.evFcf" },
        { data : "setup.evFcf.3yrAvg" },
        { data : "setup.evFcf.5yrAvg" },
        { data : "setup.evFcf.10yrAvg" },
        { data : "setup.evFcf.ttm/5yr" },
        { data : "setup.evFcf.ttm/10yr" },
        { data : "setup.evFcf.5stdev" },
        { data : "setup.evFcf.10stdev" },

        { data : "stockdata.0.fcfYield" },
        { data : "setup.fcfYield.3yrAvg" },
        { data : "setup.fcfYield.5yrAvg" },
        { data : "setup.fcfYield.10yrAvg" },
        { data : "setup.fcfYield.ttm/5yr" },
        { data : "setup.fcfYield.ttm/10yr" },
        { data : "setup.fcfYield.5stdev" },
        { data : "setup.fcfYield.10stdev" },

        { data : "stockdata.0.fcfSpice" },
        { data : "setup.fcfSpice.3yrAvg" },
        { data : "setup.fcfSpice.5yrAvg" },
        { data : "setup.fcfSpice.10yrAvg" },
        { data : "setup.fcfSpice.ttm/5yr" },
        { data : "setup.fcfSpice.ttm/10yr" },
        { data : "setup.fcfSpice.5stdev" },
        { data : "setup.fcfSpice.10stdev" },

        { data : "stockdata.0.flow_ratio" },
        { data : "stockdata.0.operating_cushion" },
        { data : "stockdata.0.working_capital" },
        { data : "stockdata.0.coreOp" },
        { data : "calculations.rule_of_40" },

    ];
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
        }).done(function (returned_data) {
            resolve(returned_data);
        });
    });
}
