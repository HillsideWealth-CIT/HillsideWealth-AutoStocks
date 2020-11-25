const { set } = require("lodash");
const moment = require("moment");
const { evalExpression } = require("./calculations");
const calc = require('./calculations');
/**
 * Adds a comma sparator to numbers in thousads
 * Clears NaNs
 * Adds symbols at the end of strings
 * @param {Float} num 
 * @param {String} extraSymbol 
 */
function formatNumber(nums, extraSymbol) {
    try {
        num = clearNAN(nums);
        if (!isFinite(num)) {
            return 'Infinity';
        }
        else if (num != null) {
            if (extraSymbol == '%') {
                return `${num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}%`;
            }
            else if (extraSymbol == '$' && num < 0) {
                return `-$${(num * -1).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`;
            }
            else if (extraSymbol == '$') {
                return `$${num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`;
            }
            else {
                return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            }
        }
        else {
            return 'Cannot Represent';
        }
    }
    catch (e) {
        return '---';
    }
}

/**
 * returns null if param is NaN
 * @param {*} param
 * @param {*} extraSymbol
 * @returns {string} 
 */
function clearNAN(param, extraSymbol) {
    if (isNaN(param)) {
        return null;
    }
    if (!isFinite(param)) {
        return Infinity;
    }
    else if (extraSymbol) {
        return param + extraSymbol;
    }
    else {
        return param;
    }
}

/**
 * Formats a JSON object
 * @param {JSON} stock 
 */
function format_data(stock) {
    stock.stockdata.forEach((data, index) => {
        data.yield_format = data.yield + '%';
        data.price_format = formatNumber(data.price, '$');
        data.shares_outstanding_format = formatNumber(Math.round(data.shares_outstanding * 100) / 100);
        data.shares_outstanding_quarterly = formatNumber(Math.round(data.shares_outstanding_quarterly * 100) / 100);
        data.market_cap_format = formatNumber(Math.round(data.market_cap), '$');
        data.net_debt_format = formatNumber(Math.round(data.net_debt) * 1, '$');
        data.enterprise_value_format = formatNumber(Math.round(data.enterprise_value * 10) / 10, '$');
        data.revenue_format = formatNumber(Math.round(data.revenue), '$');
        data.aebitda_format = formatNumber(data.aebitda, '$');
        data.roe_format = formatNumber(Math.round(data.roe * 10) / 10, '%');
        data.effective_tax_format = formatNumber(Math.round(data.effective_tax * 10) / 10, '%');
        data.fcf_format = formatNumber(Math.round(data.fcf), '$');
        data.purchase_of_business_format = data.purchase_of_business;

        data.roic_format = formatNumber(data.roic, '%');
        data.wacc_format = formatNumber(data.wacc, '%');
        data.roicwacc_format = formatNumber(Math.round((data.roic - data.wacc) * 100) / 100);
        data.capex_format = formatNumber(Math.round((data.capex * -1)), '$');
        data.aeXsho_format = formatNumber(Math.round((data.aebitda / data.shares_outstanding) * 100) / 100, '$');
        data.capeXfcf_format = formatNumber(Math.round((data.capex / data.fcf) * 100) / 100);
        data.fcfXae_format = formatNumber(Math.round((data.fcf / data.aebitda) * 100), '%');

        data.eps_without_nri_format = Math.round((data.eps_without_nri) * 100) / 100;
        data.eps_without_nri_string_format = '$' + Math.round((data.eps_without_nri) * 100) / 100;
        data.eps_growth_rate = Math.round((data.eps_basic) * 100) / 100;
        data.growth_years_format = data.growth_years;
        data.terminal_years_format = data.terminal_years;
        data.terminal_growth_rate_format = (data.terminal_growth_rate) * 100;
        data.terminal_growth_rate_string_format = (data.terminal_growth_rate) * 100 + '%';
        data.discount_rate_format = (data.discount_rate) * 100;
        data.discount_rate_string_format = (data.discount_rate) * 100 + '%';

        data.aebitda_at = Math.round(data.aebitda / data.revenue * data.asset_turnover * 1000) / 10 + '%';
        data.nd_aebitda = formatNumber(Math.round(data.net_debt / data.aebitda * 100) / 100);
        data.aebitda_percent = Math.round(data.aebitda / data.revenue * 1000) / 10 + '%';
        data.ev_aebitda = Math.round(data.enterprise_value / data.aebitda * 100) / 100;
        data.aebitda_spice = Math.round(data.aebitda / data.revenue * data.asset_turnover * 100 / (data.enterprise_value / data.aebitda) * 100) / 100;
        data.roe_spice = Math.round(data.roe / (data.enterprise_value / data.aebitda) * 100) / 100;
        data.datestring = moment(data.date).format('MMM DD, YYYY');
        data.fcf_yield = formatNumber(Math.round(data.fcf / data.market_cap * 10000) / 100, '%');
        // data.fcfroic: `${(Number(sd[i].fcf) / (Number(sd[i].total_stockholder_equity) + Number(sd[i].st_debt_lease_obligations) + Number(sd[i].lt_debt_lease_obligations)) * 100).toFixed(2)}%`;

        try {
            data.growth_capex = calculate_growth_capex(data.ppe, data.revenue, stock.stockdata[index + 1].revenue);
            data.growth_capex_format = formatNumber(calculate_growth_capex(data.ppe, data.revenue, stock.stockdata[index + 1].revenue) * -1, '$');
        }
        catch (e) {
            data.growth_capex = null;
        }

        if (data.growth_capex != null) {
            data.maintenance_capex = data.capex - data.growth_capex;
            data.maintenance_capex_format = formatNumber(Math.round(data.maintenance_capex * -1), '$')
            data.capeXae_format = formatNumber(Math.round(((data.maintenance_capex / data.aebitda) * 100)), '%');
        }
        else {
            data.maintenance_capex = null;
            data.capeXae_format = null;
        }




        // console.log(stock.stockdata[0].revenue)
    });

    stock.valueConditions = calc.value_calculator(stock.fairvalue, stock.stock_current_price.replace(/[^a-z0-9,. ]/gi, ''));

    try {
        stock.growth_rate_5y = formatNumber(calc.calculate_default_growth_func(5, stock.stockdata[0].eps_without_nri_format, stock.stockdata[4].eps_without_nri_format), '%');
        stock.dcf_values_5y = calc.initial_values_calc(5,
            stock.stockdata[0].eps_without_nri_format,
            stock.stockdata[4].eps_without_nri,
            stock.stockdata[0].terminal_growth_rate,
            stock.stockdata[0].discount_rate,
            stock.stockdata[0].growth_years,
            stock.stockdata[0].terminal_years
        );
    }
    catch (e) {
        stock.growth_rate_5y = null;
        stock.dcf_values_5y = { fair_value: null, growth_value: null, terminal_value: null };
    }

    try {
        stock.growth_rate_10y = formatNumber(calc.calculate_default_growth_func(10, stock.stockdata[0].eps_without_nri_format, stock.stockdata[9].eps_without_nri_format), '%');
        stock.dcf_values_10y = calc.initial_values_calc(10,
            stock.stockdata[0].eps_without_nri_format,
            stock.stockdata[9].eps_without_nri,
            stock.stockdata[0].terminal_growth_rate,
            stock.stockdata[0].discount_rate,
            stock.stockdata[0].growth_years,
            stock.stockdata[0].terminal_years
        );
    }
    catch (err) {
        //console.log(err)
        stock.growth_rate_10y = null;
        stock.dcf_values_10y = { fair_value: null, growth_value: null, terminal_value: null };
    }

    try {
        stock.growth_rate_15y = formatNumber(calc.calculate_default_growth_func(15, stock.stockdata[0].eps_without_nri_format, stock.stockdata[14].eps_without_nri_format), '%');
        stock.dcf_values_15y = calc.initial_values_calc(15,
            stock.stockdata[0].eps_without_nri_format,
            stock.stockdata[14].eps_without_nri,
            stock.stockdata[0].terminal_growth_rate,
            stock.stockdata[0].discount_rate,
            stock.stockdata[0].growth_years,
            stock.stockdata[0].terminal_years
        );
    }
    catch (err) {
        //console.log(err)
        stock.growth_rate_15y = null;
        stock.dcf_values_15y = { fair_value: null, growth_value: null, terminal_value: null };
    }

    // Calculates metric growth rates
    try {
        const end_date = stock.stockdata[0].date.getFullYear(),
            end_price = stock.stockdata[0].price,
            end_revenue = stock.stockdata[0].revenue,
            end_aebitda = stock.stockdata[0].aebitda,
            end_fcf = stock.stockdata[0].fcf,
            end_so = stock.stockdata[0].shares_outstanding;
        var price_10 = null,
            price_5 = null,
            price_3 = null,
            price_1 = null,
            revenue_10 = null,
            revenue_5 = null,
            revenue_3 = null,
            revenue_1 = null,
            aebitda_10 = null,
            aebitda_5 = null,
            aebitda_3 = null,
            aebitda_1 = null;
        fcf_10 = null,
            fcf_5 = null,
            fcf_3 = null,
            fcf_1 = null,
            so_10 = null,
            so_5 = null,
            so_3 = null,
            so_1 = null;
        for (var i = 1; i < stock.stockdata.length; i++) {
            if (end_date - stock.stockdata[i].date.getFullYear() == 10) {
                price_10 = stock.stockdata[i].price;
                revenue_10 = stock.stockdata[i].revenue;
                aebitda_10 = stock.stockdata[i].aebitda;
                fcf_10 = stock.stockdata[i].fcf;
                so_10 = stock.stockdata[i].shares_outstanding;
            } if (end_date - stock.stockdata[i].date.getFullYear() == 5) {
                price_5 = stock.stockdata[i].price;
                revenue_5 = stock.stockdata[i].revenue;
                aebitda_5 = stock.stockdata[i].aebitda;
                fcf_5 = stock.stockdata[i].fcf;
                so_5 = stock.stockdata[i].shares_outstanding;
            } if (end_date - stock.stockdata[i].date.getFullYear() == 3) {
                price_3 = stock.stockdata[i].price;
                revenue_3 = stock.stockdata[i].revenue;
                aebitda_3 = stock.stockdata[i].aebitda;
                fcf_3 = stock.stockdata[i].fcf;
                so_3 = stock.stockdata[i].shares_outstanding;
            } if (end_date - stock.stockdata[i].date.getFullYear() == 1) {
                price_1 = stock.stockdata[i].price;
                revenue_1 = stock.stockdata[i].revenue;
                aebitda_1 = stock.stockdata[i].aebitda;
                fcf_1 = stock.stockdata[i].fcf;
                so_1 = stock.stockdata[i].shares_outstanding;
            }
        }

        stock.fcfEmployee3 = (calc.calculate_average(stock.stockdata, 'employees', 3) / calc.calculate_average(stock.stockdata, 'fcf', 3)).toFixed(2);
        stock.fcfEmployee5 = (calc.calculate_average(stock.stockdata, 'employees', 5) / calc.calculate_average(stock.stockdata, 'fcf', 5)).toFixed(2);
        stock.fcfEmployee10 = (calc.calculate_average(stock.stockdata, 'employees', 10) / calc.calculate_average(stock.stockdata, 'fcf', 10)).toFixed(2);
        stock.fcfEmployee15 = (calc.calculate_average(stock.stockdata, 'employees', 15) / calc.calculate_average(stock.stockdata, 'fcf', 15)).toFixed(2);

        stock.mCapAve_5 = Math.round(calc.calculate_average(stock.stockdata, 'maintenance_capex', 5))
        stock.mCapAve_10 = Math.round(calc.calculate_average(stock.stockdata, 'maintenance_capex', 10))
        stock.mCapAve_15 = Math.round(calc.calculate_average(stock.stockdata, 'maintenance_capex', 15))

        stock.capeXfcfAverage5 = formatNumber(Math.round(calc.calculate_average(stock.stockdata, 'capeXfcf_format', 5) * 100), '%');
        stock.capeXfcfAverage10 = formatNumber(Math.round(calc.calculate_average(stock.stockdata, 'capeXfcf_format', 10) * 100), '%');

        stock.capeXaeAverage5 = formatNumber(Math.round(calc.calculate_average(stock.stockdata, 'capeXae_format', 5)), '%');
        stock.capeXaeAverage10 = formatNumber(Math.round(calc.calculate_average(stock.stockdata, 'capeXae_format', 10)), '%');
        stock.categories == "null" ? stock.categories = null : null;
        !stock.ownership ? stock.ownership = '0%' : stock.ownership = `${stock.ownership}%`;
        stock.fairvalue == "null" ? stock.fairvalue = null : stock.fairvalue = '$' + Math.round(stock.fairvalue * 100) / 100;
        stock.onestar == "null" ? stock.onestar = null : stock.onestar = '$' + Math.round(stock.onestar * 100) / 100;
        stock.fivestar == "null" ? stock.fivestar = null : stock.fivestar = '$' + Math.round(stock.fivestar * 100) / 100;

        stock.price_growth_10 = formatNumber(Math.round((Math.pow(end_price / price_10, 1 / 10) - 1) * 100), '%');
        stock.price_growth_5 = formatNumber(Math.round((Math.pow(end_price / price_5, 1 / 5) - 1) * 100), '%');
        stock.price_growth_3 = formatNumber(Math.round((Math.pow(end_price / price_3, 1 / 3) - 1) * 100), '%');
        stock.price_growth_1 = formatNumber(Math.round((Math.pow(end_price / price_1, 1 / 1) - 1) * 100), '%');

        stock.revenue_growth_10 = clearNAN(Math.round((Math.pow(end_revenue / revenue_10, 1 / 10) - 1) * 100), '%');
        stock.revenue_growth_5 = clearNAN(Math.round((Math.pow(end_revenue / revenue_5, 1 / 5) - 1) * 100), '%');
        stock.revenue_growth_3 = clearNAN(Math.round((Math.pow(end_revenue / revenue_3, 1 / 3) - 1) * 100), '%');
        stock.revenue_growth_1 = clearNAN(Math.round((Math.pow(end_revenue / revenue_1, 1 / 1) - 1) * 100), '%');

        stock.aebitda_growth_10 = formatNumber(Math.round((Math.pow(end_aebitda / aebitda_10, 1 / 10) - 1) * 100), '%');
        stock.aebitda_growth_5 = formatNumber(Math.round((Math.pow(end_aebitda / aebitda_5, 1 / 5) - 1) * 100), '%');
        stock.aebitda_growth_3 = formatNumber(Math.round((Math.pow(end_aebitda / aebitda_3, 1 / 3) - 1) * 100), '%');
        stock.aebitda_growth_1 = formatNumber(Math.round((Math.pow(end_aebitda / aebitda_1, 1 / 1) - 1) * 100), '%');

        stock.fcf_growth_10 = clearNAN(Math.round((Math.pow(end_fcf / fcf_10, 1 / 10) - 1) * 100), '%');
        stock.fcf_growth_5 = clearNAN(Math.round((Math.pow(end_fcf / fcf_5, 1 / 5) - 1) * 100), '%');
        stock.fcf_growth_3 = clearNAN(Math.round((Math.pow(end_fcf / fcf_3, 1 / 3) - 1) * 100), '%');
        stock.fcf_growth_1 = clearNAN(Math.round((Math.pow(end_fcf / fcf_1, 1 / 1) - 1) * 100), '%');

        stock.so_change_10 = formatNumber(Math.round((end_so - so_10) * 10) / 10);
        stock.so_change_5 = formatNumber(Math.round((end_so - so_5) * 10) / 10);
        stock.so_change_3 = formatNumber(Math.round((end_so - so_3) * 10) / 10);
        stock.so_change_1 = formatNumber(Math.round((end_so - so_1) * 10) / 10);

        stock.soChangePercent_10 = clearNAN(Math.round((formatNumber((Math.round(((so_10 - end_so) / so_10) * 100) / 100) * -1) * 100) * 100) / 100, '%');
        stock.soChangePercent_5 = clearNAN(Math.round((formatNumber((Math.round(((so_5 - end_so) / so_5) * 100) / 100) * -1) * 100) * 100) / 100, '%');
        stock.soChangePercent_3 = clearNAN(Math.round((formatNumber((Math.round(((so_3 - end_so) / so_3) * 100) / 100) * -1) * 100) * 100) / 100, '%');
        stock.soChangePercent_1 = clearNAN(Math.round((formatNumber((Math.round(((so_1 - end_so) / so_1) * 100) / 100) * -1) * 100) * 100) / 100, '%');

    }
    catch (err) {
        ///
    }

    function calculate_growth_capex(ppe, cur_revenue, prev_revenue) {
        // console.log(`${ppe} ${cur_revenue} ${prev_revenue}`)
        if (ppe && prev_revenue) {
            growthCapex = Math.round((ppe / cur_revenue) * (prev_revenue - cur_revenue)) * 100 / 100
            return growthCapex;
        }
        else {
            return null;
        }
    }

}

function tempFormat(stock) {
    console.log(stock.symbol)
    stock.stockdata.forEach((data, index) => {
        if(index == 0){
            console.log(data.roic)
        }
        data.fcfroic = `${((Number(data.fcf) / data.roic) * 100).toFixed(2)}%`;
        data.fcfroa = `${(Number(data.fcfmargin) * Number(data.asset_turnover)).toFixed(2)}%`;
        data.fcfroe = `${((Number(data.fcfmargin) * Number(data.asset_turnover) * (Number(data.totalassets)/Number(data.total_stockholder_equity)))).toFixed(2)}%`
        data.grossmargin = `${Number(data.grossmargin)}%`;
        data.operatingmargin = `${Number(data.operatingmargin)}%`;
        data.netmargin = `${Number(data.netmargin)}%`;
        data.fcfmargin = `${Number(data.fcfmargin)}%`;
        
        data.nd_aebitda = `${(Number(data.net_debt) / Number(data.aebitda)).toFixed(2)}`;
        data.nd_aebitdaFcf = `${(Number(data.nd_aebitda) / Number(data.fcf) * 100).toFixed(2)}`;
        data.cap_lease_debt = `${Number(data.cap_lease_debt).toFixed(2)}`;

        data.salesshare = `${(Number(data.revenue) / Number(data.shares_outstanding)).toFixed(2)}`;
        data.ownerEarningShare = `${(Number(data.owner_earning) / Number(data.shares_outstanding)).toFixed(2)}`;
        data.fcfShare = `${(Number(data.fcf) / Number(data.shares_outstanding)).toFixed(2)}`;
        data.sgr = `${(Number(data.fcfroic.replace('%','')) * (1 - data.dividend)).toFixed(2)}`;

        data.fror = `${data.fror}%`;

        data.capexSales = `${((Number(data.capex)/Number(data.revenue)) * 100).toFixed(2)}`;
        data.capexOwnerEarnings = `${((Number(data.capex) / Number(data.owner_earning)) * 100).toFixed(2)}`
        data.capexFcf = `${((Number(data.capex) / Number(data.fcf)) * 100).toFixed(2)}`;

        data.fcfNetIncome = `${((Number(data.fcf) / Number(data.net_income)) * 100).toFixed(2)}`;
        data.fcfOwnerEarnings = `${((Number(data.fcf) / Number(data.owner_earning)) * 100).toFixed(2)}`;

        data.dividendShare = `${Number(data.dividendspershare).toFixed(2)}$`;
        data.dividendPayoutRatio = `${(Number(data.dividend) * 100).toFixed(2)}%`;

        data.peRatio = `${(Number(data.price) / Number(data.shares_outstanding)).toFixed(2)}`;
        data.pFcfRatio = `${((Number(data.price) / Number(data.fcf))).toFixed(2)}`;
        data.evFcf = `${(Number(data.enterprise_value) / Number(data.fcf)).toFixed(2)}`;
        data.fcfYield = `${(Number(data.fcf) / Number(data.enterprise_value)).toFixed(2)}`;
        data.fcfSpice = `${((Number(data.fcfmargin.replace('%', '')) * Number(data.asset_turnover)) * (Number(data.fcfYield))).toFixed(2)}`;
        
        data.coreOp = `${(Number(data.operating_cushion) - Number(data.working_capital)).toFixed(2)}%`;
        data.flow_ratio = `${Number(data.flow_ratio).toFixed(2)}`;
        data.operating_cushion = `${Number(data.operating_cushion).toFixed(2)}%`;
        data.working_capital = `${Number(data.working_capital).toFixed(2)}%`

        data.expected_annual_total_return = `${(Number(data.fcfYield) + Number(data.sgr)).toFixed(2)}%`

        data.capex_sales = `${((Number(data.capex) / Number(data.revenue)) * 100).toFixed(2)}%`;
        data.capex_ownerEarnings = `${((Number(data.capex) / Number(data.owner_earning)) * 100).toFixed(2)}%`;
        data.capex_fcf = `${((Number(data.capex) / Number(data.fcf)) * 100).toFixed(2)}%`;

        data.cashflow_reinvestment_rate = `${(Number(data.cashflow_reinvestment_rate)*100).toFixed(2)}`

    })
    stock.setup = {};

    stock.setup.fcfroic = setup('fcfroic', '%');
    stock.setup.fcfroa = setup('fcfroa', '%');
    stock.setup.fcfroe = setup('fcfroe', '%');
    stock.setup.grossMargin = setup('grossmargin', '%');
    stock.setup.operatingmargin = setup('operatingmargin', '%');
    stock.setup.netmargin = setup('netmargin');
    stock.setup.fcfmargin = setup('fcfmargin');
    stock.setup.nd_aebitda = setup('nd_aebitda');
    stock.setup.nd_aebitdaFcf = setup('nd_aebitdaFcf');
    stock.setup.sales = setup('revenue', 'M');
    stock.setup.salesshare = setup('salesshare');
    stock.setup.ownerEarningShare = setup('ownerEarningShare');
    stock.setup.fcfShare = setup('fcfShare');
    stock.setup.dividend = setup('dividend');
    stock.setup.sgr = setup('sgr');
    stock.setup.bvps = setup('book_value_per_share');
    stock.setup.fcfNetIncome = setup('fcfNetIncome', '%');
    stock.setup.fcfOwnerEarnings = setup('fcfOwnerEarnings', '%');
    stock.setup.dividendShare = setup('dividendShare', '$');
    stock.setup.dividendYield = setup('dividend_yield');
    stock.setup.shares_outstanding = setup('shares_outstanding');
    stock.setup.peRatio = setup('peRatio');
    stock.setup.pFcfRatio = setup('pFcfRatio');
    stock.setup.evFcf = setup('evFcf');
    stock.setup.fcfYield = setup('fcfYield');
    stock.setup.fcfSpice = setup('fcfSpice');

    //Calculations
    stock.calculations = {};
    stock.calculations.sgr5yr = `${(Number(stock.setup.sgr['5yrAvg']) / 1 - Number(stock.setup.dividend['5yrAvg']))}`;
    stock.calculations.sgr10yr = `${(Number(stock.setup.sgr['10yrAvg']) / 1 - Number(stock.setup.dividend['10yrAvg']))}`;

    stock.calculations.bvpsY10 = formatNumber(((Math.pow( 1 + (Number(stock.setup.sgr['10yrAvg'])/ 100), 10)) * Number(stock.stockdata[0].book_value_per_share)).toFixed(2), '$');
    stock.calculations.fcfShareY10 = `${(Number(stock.stockdata[10].book_value_per_share) * Number(stock.setup.fcfroic['10yrAvg'])).toFixed(2)}$`;
    stock.calculations.stockPriceY10 = `${(Number(stock.stockdata[10].fcfShare) * Number(stock.setup.pFcfRatio['10yrAvg']))}$`;
    stock.calculations.projected10ror = formatNumber((1/(Math.pow(Number(stock.stockdata[10].price) / Number(stock.stockdata[0].price), 0.9))).toFixed(2), '%');
    stock.calculations.projected10Total = formatNumber(Number(stock.calculations.projected10ror) + Number(stock.setup.dividendYield["10yrAvg"]), '%');
    
    stock.calculations.roce = `${(Number(stock.stockdata[0].ebit) / ((Number(stock.stockdata[1].capital_employed) + Number(stock.stockdata[0].capital_employed))/2) * 100).toFixed(2)}%`
    stock.calculations.rule_of_40 = `${(Number(stock.setup.fcfmargin["5yrAvg"]) + Number(stock.calculations.sgr5yr)).toFixed(2)}%`;

    function setup(column, sign=''){
        let stockinfoNum = {}
        let stockinfo = {}
        stockinfoNum['3yrAvg'] = calc.calculate_average(stock.stockdata, column, 3);
        stockinfoNum['5yrAvg'] = calc.calculate_average(stock.stockdata, column, 5);
        stockinfoNum['10yrAvg'] = calc.calculate_average(stock.stockdata, column, 10);
        stockinfoNum['ttm/5yr'] = Number(stock.stockdata[0][column].replace('%','')) / Number(calc.calculate_average(stock.stockdata, column, 5));
        stockinfoNum['ttm/10yr'] = Number(stock.stockdata[0][column].replace('%','')) / Number(calc.calculate_average(stock.stockdata, column, 10));
        stockinfoNum['5stdev'] = ((Number(calc.calculate_stDev(stock.stockdata, column, 5)) / Number(stockinfoNum['5yrAvg'])) * 100);
        stockinfoNum['10stdev'] = ((Number(calc.calculate_stDev(stock.stockdata, column, 10)) / Number(stockinfoNum['10yrAvg'])) * 100);

        stockinfo['3yrAvg'] = stockinfoNum['3yrAvg'] === 'NaN'
            ? '-----'
            : `${formatNumber(stockinfoNum['3yrAvg'].toFixed(2), sign)}`

        stockinfo['5yrAvg'] = stockinfoNum['5yrAvg'] === 'NaN'
            ? '-----'
            : `${formatNumber(stockinfoNum['5yrAvg'].toFixed(2), sign)}`

        stockinfo['10yrAvg'] = stockinfoNum['10yrAvg'] === 'NaN'
            ? '-----'
            : `${formatNumber(stockinfoNum['10yrAvg'].toFixed(2), sign)}`

        stockinfo['ttm/5yr'] = stockinfoNum['ttm/5yr'] === 'NaN'
            ? '-----'
            : `${formatNumber(stockinfoNum['ttm/5yr'].toFixed(2))}`

        stockinfo['ttm/10yr'] = stockinfoNum['ttm/10yr'] === 'NaN'
            ? '-----'
            : `${formatNumber(stockinfoNum['ttm/10yr'].toFixed(2))}`

        stockinfo['5stdev'] = stockinfoNum['5stdev'] === 'NaN'
            ? '-----'
            : `+/- ${formatNumber(stockinfoNum['5stdev'].toFixed(1), sign)}`
            
        stockinfo['10stdev'] = stockinfoNum['10stdev'] === 'NaN'
            ? '-----'
            : `+/- ${formatNumber(stockinfoNum['10stdev'].toFixed(1), sign)}`


        // stockinfo['3yrAvg'] = `${(calc.calculate_average(stock.stockdata, column, 3)).toFixed(2)}`;
        // stockinfo['5yrAvg'] = `${(calc.calculate_average(stock.stockdata, column, 5)).toFixed(2)}`;
        // stockinfo['10yrAvg'] = `${(calc.calculate_average(stock.stockdata, column, 10)).toFixed(2)}`;
        // stockinfo['ttm/5yr'] = `${(Number(stock.stockdata[0][column].replace('%','')) / Number(calc.calculate_average(stock.stockdata, column, 5))).toFixed(2)}`;
        // stockinfo['ttm/10yr'] = `${(Number(stock.stockdata[0][column].replace('%','')) / Number(calc.calculate_average(stock.stockdata, column, 10))).toFixed(2)}`;
        // stockinfo['5stdev'] = `+/- ${((Number(calc.calculate_stDev(stock.stockdata, column, 5)) / Number(stockinfo['5yrAvg'].replace(sign, ''))) * 100).toFixed(1)} = (${calc.calculate_stDev(stock.stockdata, column, 5)}/${Number(stockinfo['5yrAvg'].replace(sign, ''))})`;
        // stockinfo['10stdev'] = `+/- ${((Number(calc.calculate_stDev(stock.stockdata, column, 10)) / Number(stockinfo['10yrAvg'].replace(sign, ''))) * 100).toFixed(1)} = (${calc.calculate_stDev(stock.stockdata, column, 10)}/${Number(stockinfo['10yrAvg'].replace(sign, ''))})`;

        return stockinfo;
    };

}

function formatHistorical(data, cs) {
    let customString = cs.split(',');
    let toSend = [];
    let sd = data[0].stockdata
    for (let i = 0; i < 20; i++) {
        try{
            let year = {date: i === 0 ? 'TTM' : moment(sd[i].date).format('MMM, YYYY'),}
            for(let j = 0; j < customString.length; j++){
                let rowData = customString[j].split('|');
                let headerSign = (rowData[0].indexOf('(') !== -1)
                    ? rowData[0].slice(rowData[0].indexOf('(')+1, rowData[0].indexOf(')'))
                    : ''
                if(rowData.length == 2){
                    year[rowData[0]] = sToSD(rowData[1].trim(), i, headerSign);
                }
                else{
                    let variables =[];
                    for(let p of rowData[1].split(" ")){
                        if(p.length > 0) variables.push(Number(sToSD(p, i)));
                    }
                    year[rowData[0]] = `${evalExpression(variables, rowData[2]).toFixed(2)}${headerSign}`;
                }
            }
            toSend.push(year)
        }
        catch(e){
            break;
        }

    }
    return toSend

    function sToSD(columnString, row, headerSign = ''){
        let value;
        switch(columnString) {
            case 'aebitda':
                value = sd[row].aebitda;
                break;
            case 'assetTurn':
                value = sd[row].asset_turnover;
                break;
            case 'bvps':
                value = sd[row].book_value_per_share;
                break;
            case 'capex':
                value = sd[row].capex;
                break;
            case 'discountRate':
                value = sd[row].discount_rate;
                break;
            case 'dividend':
                value = sd[row].dividend;
                break;
            case 'dividendYield':
                value = sd[row].dividendYield;
                break;
            case 'dividendPerShare':
                value = sd[row].dividendShare;
                break;
            case 'effectiveTax':
                value = sd[row].effective_tax;
                break;
            case 'employees':
                value = sd[row].employees;
                break;
            case 'enterpriseValue':
                value = sd[row].enterprise_value;
                break;
            case 'epsBasic':
                value = sd[row].eps_basic;
                break;
            case 'epsWithoutNri':
                value = sd[row].eps_without_nri;
                break;
            case 'fcf':
                value = sd[row].fcf;
                break;
            case 'fcfMargin':
                value = sd[row].fcfmargin;
                break;
            case 'grossMargin':
                value = sd[row].grossMargin;
                break;
            case 'growthYears':
                value = sd[row].growth_years;
                break;
            case 'longTermDebt':
                value = sd[row].lt_debt_lease_obligations;
                break;
            case 'marketCap':
                value = sd[row].market_cap;
                break;
            case 'netDebt':
                value = sd[row].net_debt;
                break;
            case 'netIncome':
                value = sd[row].net_income;
                break;
            case 'netMargin':
                value = sd[row].netmargin;
                break;
            case 'operatingMargin':
                value = sd[row].operatingmargin;
                break;
            case 'ownerEarning':
                value = sd[row].ownerEarningShare
                break;
            case 'ppe':
                value = sd[row].ppe;
                break;
            case 'price':
                value = sd[row].price;
                break;
            case 'purchaseOfBusiness':
                value = sd[row].purchase_of_business;
                break;
            case 'revenue':
                value = sd[row].revenue;
                break;
            case 'roe':
                value = sd[row].roe;
                break;
            case 'roic':
                value = sd[row].roic;
                break;
            case 'sharesOutstanding':
                value = sd[row].shares_outstanding;
                break;
            case 'sharesOutstandingQuarterly':
                value = sd[row].shares_outstanding_quarterly;
                break;
            case 'shortTermDebt':
                value = sd[row].st_debt_lease_obligations;
                break;
            case 'terminalGrowthRate':
                value = sd[row].terminal_growth_rate;
                break;
            case 'TerminalYears':
                value = sd[row].terminal_years;
                break;
            case 'totalStockholderEquity':
                value = sd[row].total_stockholder_equity;
                break;
            case 'totalAssets':
                value = sd[row].totalassets;
                break;
            case 'ttm':
                value = sd[row].ttm;
                break;
            case 'wacc':
                value = sd[row].wacc;
                break;
            case 'yield':
                value = sd[row].yield;
                break;
            default:
                value = 'N/A'
        }
        return `${value}${headerSign}`;
    }
}
module.exports = {
    formatNumber,
    format_data,
    tempFormat,
    clearNAN,
    formatHistorical,
}