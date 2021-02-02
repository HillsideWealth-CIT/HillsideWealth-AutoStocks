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
            return '0';
        }
    }
    catch (e) {
        return '0';
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
        if(index >= 11){
            return
        }
        data.fcfYield = `${cNaI((Number(data.fcf) / Number(data.enterprise_value))* 100).toFixed(2)}%`;
        data.fcfSpice = `${cNaI(((Number(data.fcfmargin.replace('%', '')) * Number(data.asset_turnover)) * (Number(data.fcfYield.replace('%', ''))))/100).toFixed(2)}`;
        data.yield_format = data.yield + '%';

        data.fcfroic = `${cNaI((Number(data.fcf) / Number(data.invested_capital)) * 100).toFixed(2)}%`;
        data.fcfroa = `${cNaI(Number(data.fcfmargin.replace('%','')) * Number(data.asset_turnover)).toFixed(2)}%`;
        data.fcfroe = `${cNaI((Number(data.fcfmargin.replace('%','')) * Number(data.asset_turnover) * (Number(data.totalassets)/Number(data.total_stockholder_equity)))).toFixed(2)}%`
        data.fcfRoce = `${cNaI(((Number(data.fcf)/Number(data.capital_employed)) * 100).toFixed(2))}%`
        data.fcfRota = `${cNaI(Number(data.fcf)/(Number(data.totalassets) - Number(data.intangible_assets))).toFixed(2)}%`

        data.grossmargin = `${cNaI(Number(data.grossmargin))}%`;
        data.operatingmargin = `${cNaI(Number(data.operatingmargin))}%`;
        data.fcfmargin = `${cNaI(Number(data.fcfmargin))}%`;

        data.nd_aebitda = `${cNaI(Number(data.net_debt) / Number(data.aebitda)).toFixed(2)}`;
        data.ndFcf = `${cNaI(Number(data.net_debt) / Number(data.fcf)).toFixed(2)}`;
        data.cap_lease_debt = `${cNaI(Number(data.cap_lease_debt) * 100).toFixed(2)}%`;

        data.capex_sales = `${cNaI((Number(data.capex) / Number(data.revenue)) * 100).toFixed(2)}%`;
        data.capex_ownerEarnings = `${cNaI((Number(data.capex) / (Number(data.owner_earning) * Number(data.shares_outstanding))) * 100).toFixed(2)}%`;
        data.capex_fcf = `${cNaI((Number(data.capex) / (Number(data.fcf) - Number(data.capex))) * 100).toFixed(2)}%`;

        data.fcfNetIncome = `${cNaI((Number(data.fcf) / Number(data.net_income)) * 100).toFixed(0)}%`;
        data.fcfOwnerEarnings = `${cNaI((Number(data.fcf) / (Number(data.owner_earning) * Number(data.shares_outstanding))) * 100).toFixed(0)}%`;

        data.salesshare = `$${cNaI(Number(data.revenue) / Number(data.shares_outstanding)).toFixed(2)}`;
        data.ownerEarningShare = `$${cNaI(Number(data.owner_earning)).toFixed(2)}`;
        data.fcfShare = `${cNaI(Number(data.fcf) / Number(data.shares_outstanding)).toFixed(2)}`;
        data.aebitdaShare = `${cNaI(Number(data.aebitda)/Number(data.shares_outstanding)).toFixed(2)}`;
        data.dividendShare = `${Number(data.dividendspershare).toFixed(2)}$`;
        data.price_format = formatNumber(data.price, '$');

        data.sgr = `${cNaI(( Number(data.fcfroic.replace('%','')) * (1-Number(data.dividend))).toFixed(2))}%`;
        data.fror = `${cNaI(data.fror)}%`;
        data.expected_annual_total_return = `${cNaI(Number(data.fcfYield.replace(/[^0-9.-]/g, "")) + Number(data.sgr.replace(/[^0-9.-]/g, ""))).toFixed(2)}%`;

        data.dividendPayoutRatio = `${cNaI((Number(data.dividendspershare)/(Number(data.fcf)/Number(data.shares_outstanding))) * 100).toFixed(2)}%`;
        data.cashflow_reinvestment_rate = `${cNaI(Number(data.cashflow_reinvestment_rate)*100).toFixed(0)}%`;

        data.evFcf = `${cNaI(Number(data.enterprise_value) / Number(data.fcf)).toFixed(2)}`;
        data.fcfYield = `${cNaI((Number(data.fcf) / Number(data.enterprise_value))* 100).toFixed(2)}%`;
        data.fcfSpice = `${cNaI(((Number(data.fcfmargin.replace('%', '')) * Number(data.asset_turnover)) * (Number(data.fcfYield.replace('%', ''))))/100).toFixed(2)}`;
        data.aebitda_spice = cNaI(Math.round(data.aebitda / data.revenue * data.asset_turnover * 100 / (data.enterprise_value / data.aebitda) * 100) / 100);
        data.roe_spice = cNaI(Math.round(data.roe / (data.enterprise_value / data.aebitda) * 100) / 100);   
        data.urbem_value = `${cNaI(Number(data.evFcf)/Number(data.sgr.replace('%',''))).toFixed(1)}`    

        data.fcfEmployee = `$${cNaI((Number(data.employees) * 1000000) / Number(data.fcf)).toFixed(0)}`;

        data.shares_outstanding_format = formatNumber(Math.round(data.shares_outstanding * 100) / 100);
        data.enterprise_value_format = formatNumber(Number(data.enterprise_value).toFixed(0) ,'$');

        data.eps_without_nri_format = Math.round((data.eps_without_nri) * 100) / 100;
        data.eps_without_nri_string_format = '$' + Math.round((data.eps_without_nri) * 100) / 100;
        data.eps_growth_rate = Math.round((data.eps_basic) * 100) / 100;
        data.growth_years_format = data.growth_years;
        data.terminal_years_format = data.terminal_years;
        data.terminal_growth_rate_format = (data.terminal_growth_rate) * 100;
        data.terminal_growth_rate_string_format = (data.terminal_growth_rate) * 100 + '%';
        data.discount_rate_format = (data.discount_rate) * 100;
        data.discount_rate_string_format = (data.discount_rate) * 100 + '%';

        data.purchase_of_business = formatNumber(Number(data.purchase_of_business).toFixed(0), '$')

        data.datestring = moment(data.date).format('YYYY-MM-DD');

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
    });

    stock.stockdata[0].fcfEmployee = `$${formatNumber(cNaI(((Number(stock.stockdata[0].fcf) * 1000000) / Number(stock.stockdata[1].employees)).toFixed(0)))}`

    // Setup
    stock.setup = {};
    stock.setup.fcfSpice = setup('fcfSpice');
    stock.setup.fcfYield = setup('fcfYield', '%');

    stock.setup.fcfroic = setup('fcfroic', '%');
    stock.setup.fcfroa = setup('fcfroa', '%');
    stock.setup.fcfroe = setup('fcfroe', '%');
    stock.setup.fcfRoce = setup('fcfRoce', '%');
    stock.setup.fcfRota = setup('fcfRota', '%');

    stock.setup.grossmargin = setup('grossmargin', '%');
    stock.setup.operatingmargin = setup('operatingmargin', '%');
    stock.setup.fcfmargin = setup('fcfmargin', '%');

    stock.setup.nd_aebitda = setup('nd_aebitda');
    stock.setup.ndFcf = setup('ndFcf');

    stock.setup.capex_sales = setup('capex_sales', '%');
    stock.setup.capex_ownerEarnings = setup('capex_ownerEarnings', '%');
    stock.setup.capex_fcf = setup('capex_fcf', '%');

    stock.setup.fcfNetIncome = setup('fcfNetIncome', '%', '%');
    stock.setup.fcfOwnerEarnings = setup('fcfOwnerEarnings', '%', '%');
    stock.setup.cash_conversion_cycle = setup('cash_conversion_cycle', '','',0);

    stock.setup.sales = setup('revenue', '$');
    stock.setup.salesshare = setup('salesshare', '$');
    stock.setup.ownerEarningShare = setup('ownerEarningShare');
    stock.setup.fcfShare = setup('fcfShare');
    stock.setup.aebitdaShare = setup('aebitdaShare');
    stock.setup.dividendShare = setup('dividendShare', '$');
    stock.setup.price = setup('price', '$');

    stock.setup.sgr = setup('sgr', '%');

    stock.setup.dividendPayoutRatio = setup('dividendPayoutRatio', '%');
    stock.setup.cashflow_reinvestment_rate = setup('cashflow_reinvestment_rate', '%', 0);

    stock.setup.evFcf = setup('evFcf');
    stock.setup.fcfYield = setup('fcfYield', '%');
    stock.setup.fcfSpice = setup('fcfSpice');

    stock.setup.purchase_of_business = setup('purchase_of_business', '$', 0);
    stock.setup.dividend = setup('dividend');

    stock.setup.dividendYield = setup('dividend_yield', '%');
    stock.setup.urbem_value = setup('urbem_value', '%');

    // stock.setup.fcfEmployee = setup('fcfEmployee','$',0);

    stock.setup.fcfEmployee = {
        '3yr':'$0',
        '5yr':'$0',
        '10yr':'$0',
    };
    let ttmYear;
    for(let i = 0; i < stock.stockdata.length; i++){
        if (stock.stockdata[i].employees !== 0){
            ttmYear = i;
            break;
        }
    }
    try{
        let fcf3 = stock.stockdata[0].fcf - stock.stockdata[2].fcf;
        let employees3 = stock.stockdata[ttmYear].employees - stock.stockdata[2].employees;
        stock.setup.fcfEmployee['3yr'] = `$${formatNumber(cNaI((fcf3 * 1000000)/employees3).toFixed(0))}`;
    }
    catch{
    }

    try{
        let fcf5 = stock.stockdata[0].fcf - stock.stockdata[4].fcf;
        let employees5 = stock.stockdata[ttmYear].employees - stock.stockdata[4].employees;
        stock.setup.fcfEmployee['5yr'] = `$${formatNumber(cNaI((fcf5 * 1000000)/employees5).toFixed(0))}`;
    }
    catch{
    }
    try{
        let fcf10 = stock.stockdata[0].fcf - stock.stockdata[9].fcf;
        let employees10 = stock.stockdata[ttmYear].employees - stock.stockdata[9].employees;
         `$${formatNumber(cNaI((fcf10 * 1000000)/employees10).toFixed(0))}`;
    }
    catch{
    }

    stock.stock_current_price = formatNumber(Number(stock.stock_current_price.replace(/[^0-9.-]/g, "")).toFixed(2), '$')

    //calculations
    stock.calculations = {};
    stock.calculations.rule_of_40 = `${cNaI(Number(stock.stockdata[3].fcfmargin.replace('%','')) + Number(stock.setup.fcfShare["compGrowth3yr"].replace('%',''))).toFixed(2)}%`;
    try{
        stock.calculations.incrementalRoe1yr = `${cNaI(((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[2].fcf))/(Number(stock.stockdata[1].total_stockholder_equity) - Number(stock.stockdata[2].total_stockholder_equity))) * 100).toFixed(2)}%`;
        stock.calculations.incrementalRoic1yr = `${cNaI((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[2].fcf))/(Number(stock.stockdata[1].invested_capital) - Number(stock.stockdata[2].invested_capital)) * 100).toFixed(2)}%`
        stock.calculations.incrementalJDVROIC1yr = `${cNaI((Number(stock.stockdata[1].fcf)-Number(stock.stockdata[2].fcf))/addup('reinvested_cf_jdv', 1, 2)*100).toFixed(2)}%`
    }
    catch{
        stock.calculations.incrementalRoe1yr = '0';
        stock.calculations.incrementalRoic1yr = '0';
        stock.calculations.incrementalJDVROIC1yr = '0'
    }
    try{
        stock.calculations.incrementalRoe3yr = `${cNaI(((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[4].fcf))/(Number(stock.stockdata[1].total_stockholder_equity) - Number(stock.stockdata[4].total_stockholder_equity))) * 100).toFixed(2)}%`;
        stock.calculations.incrementalRoic3yr = `${cNaI((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[4].fcf))/(Number(stock.stockdata[1].invested_capital) - Number(stock.stockdata[4].invested_capital)) * 100).toFixed(2)}%`
        stock.calculations.incrementalJDVROIC3yr = `${cNaI((Number(stock.stockdata[1].fcf)-Number(stock.stockdata[4].fcf))/addup('reinvested_cf_jdv', 1, 4)*100).toFixed(2)}%`
    }
    catch{
        stock.calculations.incrementalRoe3yr = '0';
        stock.calculations.incrementalRoic3yr = '0';
        stock.calculations.incrementalJDVROIC3yr = '0'
    }
    try{
        stock.calculations.sgr5yr = `${cNaI(Number(stock.setup.sgr['5yrAvg'].replace('%','')) / 1 - Number(stock.setup.dividend['5yrAvg'].replace('%','')))}`;
        stock.calculations.incrementalRoe5yr = `${cNaI(((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[6].fcf))/(Number(stock.stockdata[1].total_stockholder_equity) - Number(stock.stockdata[6].total_stockholder_equity))) * 100).toFixed(2)}%`;
        stock.calculations.incrementalRoic5yr = `${cNaI((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[6].fcf))/(Number(stock.stockdata[1].invested_capital) - Number(stock.stockdata[6].invested_capital)) * 100).toFixed(2)}%`
        stock.calculations.incrementalJDVROIC5yr = `${cNaI((Number(stock.stockdata[1].fcf)-Number(stock.stockdata[6].fcf))/addup('reinvested_cf_jdv', 1, 6)*100).toFixed(2)}%`
    }
    catch{
        stock.calculations.sgr5yr = '0';
        stock.calculations.incrementalRoe5yr = '0';
        stock.calculations.incrementalRoic5yr = '0';
        stock.calculations.incrementalJDVROIC5yr = '0'

    }
    try{
        stock.calculations.sgr10yr = `${cNaI(Number(stock.setup.sgr['10yrAvg'].replace('%','')) / 1 - Number(stock.setup.dividend['10yrAvg'].replace('%',''))).toFixed(2)}`;
        stock.calculations.bvpsY10 = `$${formatNumber(cNaI(((Math.pow( 1 + (Number(stock.setup.sgr['10yrAvg'].replace('%',''))/ 100), 10)) * Number(stock.stockdata[0].book_value_per_share)).toFixed(2)))}`;
        stock.calculations.fcfShareY10 = `$${formatNumber(cNaI(((Math.pow( 1 + (Number(stock.setup.sgr['10yrAvg'].replace('%',''))/ 100), 10)) * Number(stock.stockdata[0].fcfShare)).toFixed(2)))}`;
        stock.calculations.stockPriceY10 = `$${formatNumber(cNaI((Number(stock.calculations.fcfShareY10.replace('$', '')) * Number(stock.setup.evFcf['10yrAvg'])).toFixed(2)))}`;
        stock.calculations.projected10ror = `${formatNumber(cNaI(((Math.pow(Number(stock.calculations.stockPriceY10.replace(/[^0-9.-]/g, "")) / Number(stock.stockdata[0].price),0.1)-1) * 100).toFixed(2)))}%`
        stock.calculations.projected10Total = `${cNaI((Number(stock.calculations.projected10ror.replace(/[^0-9.-]/g, "")) + Number(stock.setup.dividendYield["10yrAvg"].replace(/[^0-9.-]/g, ""))).toFixed(2))}%`;
        
        stock.calculations.incrementalRoe10yr = `${cNaI(((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[11].fcf))/(Number(stock.stockdata[1].total_stockholder_equity) - Number(stock.stockdata[11].total_stockholder_equity))) * 100).toFixed(2)}%`;
        stock.calculations.incrementalRoic10yr = `${cNaI((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[11].fcf))/(Number(stock.stockdata[1].invested_capital) - Number(stock.stockdata[11].invested_capital)) * 100).toFixed(2)}%`
        stock.calculations.incrementalJDVROIC10yr = `${cNaI((Number(stock.stockdata[1].fcf)-Number(stock.stockdata[11].fcf))/addup('reinvested_cf_jdv', 1, 11)*100).toFixed(2)}%`

    }
    catch{
        stock.calculations.sgr10yr = '0';
        stock.calculations.bvpsY10 = '0';
        stock.calculations.fcfShareY10 = '0';
        stock.calculations.stockPriceY10 = '0';
        stock.calculations.projected10ror = '0';
        stock.calculations.projected10Total = '0';
        stock.calculations.incrementalRoe10yr = '0';
        stock.calculations.incrementalRoic10yr = '0';
        stock.calculations.incrementalJDVROIC10yr = '0';
    }

    stock.valueConditions = calc.value_calculator(stock.fairvalue, stock.stock_current_price.replace(/[^a-z0-9,. ]/gi, ''));
    stock.categories = stock.categories == "null" ? "0" : stock.categories;
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
            end_so = stock.stockdata[0].shares_outstanding;
        var so_10 = null,
            so_5 = null,
            so_3 = null,
            so_1 = null;
            for (var i = 1; i < stock.stockdata.length; i++) {
                if (end_date - stock.stockdata[i].date.getFullYear() == 10) {
                    so_10 = stock.stockdata[i].shares_outstanding;
                } if (end_date - stock.stockdata[i].date.getFullYear() == 5) {
                    so_5 = stock.stockdata[i].shares_outstanding;
                } if (end_date - stock.stockdata[i].date.getFullYear() == 3) {
                    so_3 = stock.stockdata[i].shares_outstanding;
                } if (end_date - stock.stockdata[i].date.getFullYear() == 1) {
                    so_1 = stock.stockdata[i].shares_outstanding;
                }
            }   

        stock.soChangePercent_10 = clearNAN(Math.round((formatNumber((Math.round(((so_10 - end_so) / so_10) * 100) / 100) * -1) * 100) * 100) / 100, '%');
        stock.soChangePercent_5 = clearNAN(Math.round((formatNumber((Math.round(((so_5 - end_so) / so_5) * 100) / 100) * -1) * 100) * 100) / 100, '%');
        stock.soChangePercent_3 = clearNAN(Math.round((formatNumber((Math.round(((so_3 - end_so) / so_3) * 100) / 100) * -1) * 100) * 100) / 100, '%');
        stock.soChangePercent_1 = clearNAN(Math.round((formatNumber((Math.round(((so_1 - end_so) / so_1) * 100) / 100) * -1) * 100) * 100) / 100, '%');
    }
    catch (err) {
        ///
    }

    function addup(column, start, end){
        let sum = 0;
        for(let i = start; i < end; i++){
            sum += Number(stock.stockdata[i][column])
        }
        return sum
    }

    // Converts NAN and Infinity
    function cNaI(number){
        // if(!isFinite(number)){
        //     return 0
        // }
        if(isNaN(number)){
            // console.log('NaN:' + number)
            return 0
        }
        else if (!isFinite(number)){
            // console.log('infinite: ' + number)
            return 0
        }
        else if (number === null){
            // console.log('is null')
            return 0
        }
        else{
            return number
        }
    }


    function setup(column, sign='', fixed=2){
        let stockinfoNum = {}
        let stockinfo = {}
        try{
            stockinfoNum["compGrowth1yr"] = (Math.pow(Number(stock.stockdata[0][column].replace(/[^0-9.-]/g, "")) / Number(stock.stockdata[1][column].replace(/[^0-9.-]/g, "")), 1/1) - 1) * 100;
        }
        catch{
            stockinfoNum["compGrowth1yr"] = NaN;
        }
        try{
            stockinfoNum['3yrAvg'] = calc.calculate_average(stock.stockdata, column, 3);
            stockinfoNum["compGrowth3yr"] = (Math.pow(Number(stock.stockdata[0][column].replace(/[^0-9.-]/g, "")) / Number(stock.stockdata[3][column].replace(/[^0-9.-]/g, "")), 1/3) - 1) * 100;
        }
        catch{
            stockinfoNum['3yrAvg'] = NaN;
            stockinfoNum["compGrowth3yr"] = NaN;
        }
        try{
            stockinfoNum['5yrAvg'] = calc.calculate_average(stock.stockdata, column, 5);
            stockinfoNum['ttm/5yr'] = Number(stock.stockdata[0][column].replace(/[^0-9.-]/g, "")) / Number(calc.calculate_average(stock.stockdata, column, 5));
            stockinfoNum['5stdev'] = `${((Number(calc.calculate_stDev(stock.stockdata, column, 5)) / Number(stockinfoNum['5yrAvg'])) * 100).toFixed(1)}`.replace(/[^0-9.]/g, "");
            stockinfoNum["compGrowth5yr"] = (Math.pow(Number(stock.stockdata[0][column].replace(/[^0-9.-]/g, "")) / Number(stock.stockdata[5][column].replace(/[^0-9.-]/g, "")), 1/5) - 1) * 100;
        }
        catch{
            stockinfoNum['5yrAvg'] = NaN;
            stockinfoNum['ttm/5yr'] = NaN;
            stockinfoNum['5stdev'] = NaN;
            stockinfoNum["compGrowth5yr"] = NaN;
        }
        try{
            stockinfoNum['10yrAvg'] = calc.calculate_average(stock.stockdata, column, 10);
            stockinfoNum['ttm/10yr'] = Number(stock.stockdata[0][column].replace(/[^0-9.-]/g, "")) / Number(calc.calculate_average(stock.stockdata, column, 10));
            stockinfoNum['10stdev'] = `${((Number(calc.calculate_stDev(stock.stockdata, column, 10)) / Number(stockinfoNum['10yrAvg'])) * 100).toFixed(1)}`.replace(/[^0-9.]/g, "");
            stockinfoNum["compGrowth10yr"] = (Math.pow(Number(stock.stockdata[0][column].replace(/[^0-9.-]/g, "")) / Number(stock.stockdata[10][column].replace(/[^0-9.-]/g, "")), 1/10) - 1) * 100;
        }
        catch(e){
            stockinfoNum['10yrAvg'] = NaN;
            stockinfoNum['ttm/10yr'] = NaN;
            stockinfoNum['10stdev'] = NaN;
            stockinfoNum["compGrowth10yr"] = NaN;
        }

        stockinfo['3yrAvg'] = stockinfoNum['3yrAvg'] === ''
            ? '-'
            : `${formatNumber(stockinfoNum['3yrAvg'].toFixed(fixed), sign)}`

        stockinfo['5yrAvg'] = stockinfoNum['5yrAvg'] === ''
            ? '-'
            : `${formatNumber(stockinfoNum['5yrAvg'].toFixed(fixed), sign)}`

        stockinfo['10yrAvg'] = stockinfoNum['10yrAvg'] === ''
            ? '-'
            : `${formatNumber(stockinfoNum['10yrAvg'].toFixed(fixed), sign)}`

        stockinfo['ttm/5yr'] = stockinfoNum['ttm/5yr'] === ''
            ? '-'
            : `${formatNumber(stockinfoNum['ttm/5yr'].toFixed(2))}`

        stockinfo['ttm/10yr'] = stockinfoNum['ttm/10yr'] === ''
            ? '-'
            : `${formatNumber(stockinfoNum['ttm/10yr'].toFixed(2))}`

        stockinfo['5stdev'] = stockinfoNum['5stdev'] === ''
            ? '-'
            : `+/- ${formatNumber(stockinfoNum['5stdev'])}%`
        stockinfo['10stdev'] = stockinfoNum['10stdev'] === ''
            ? '-'
            : `+/- ${formatNumber(stockinfoNum['10stdev'])}%`
        stockinfo['compGrowth1yr'] = stockinfoNum['compGrowth1yr'] === ''
            ? '-'
            : `${formatNumber(stockinfoNum["compGrowth1yr"].toFixed(2))}%`
        stockinfo['compGrowth3yr'] = stockinfoNum['compGrowth3yr'] === ''
            ? '-'
            : `${formatNumber(stockinfoNum["compGrowth3yr"].toFixed(2))}%`
        stockinfo['compGrowth5yr'] = stockinfoNum['compGrowth5yr'] === ''
            ? '-'
            : `${formatNumber(stockinfoNum["compGrowth5yr"].toFixed(2))}%`
        stockinfo['compGrowth10yr'] = stockinfoNum['compGrowth10yr'] === ''
            ? '-'
            : `${formatNumber(stockinfoNum["compGrowth10yr"].toFixed(2))}%`
        return stockinfo;
    };
}

/**
 * Formats data for the historical table
 * @param {Object} data - data from the data base 
 * @param {String} cs - CustomString from the database
 * @param {Int} years - The number of times the function loops
 */
function formatHistorical(data, cs, years=20) {
    let custom = JSON.parse(cs)
    let toSend = [];
    let sd = data[0].stockdata
    for(let yr = 0; yr < years; yr++){
        try{
        let year = { date : moment(sd[yr].date).format('YYYY-MM-DD') };
        for(let i = 0; i < custom.length; i++){
            let decimal = Number(custom[i].decimal);
            //equation empty
            if(custom[i].equation.length === 0){
                year[custom[i].rowName] = (custom[i].sign === '$')
                ?   `$${Number(sToSD(custom[i].columns, yr)).toFixed(decimal)}`
                :   `${Number(sToSD(custom[i].columns, yr)).toFixed(decimal)}${custom[i].sign}`
            }
            else{
                let variables = [];
                for(let p of custom[i].columns.split(" ")){
                    if(p.length > 0) variables.push(Number(sToSD(p, yr)))
                }
                year[custom[i].rowName] = (custom[i].sign === '$')
                ?   `$${Number(evalExpression(variables, custom[i].equation)).toFixed(decimal)}`
                :   `${Number(evalExpression(variables, custom[i].equation)).toFixed(decimal)}${custom[i].sign}`
            }
        }
        toSend.push(year)
        }
        catch{
            break;
        }
    }
    return toSend

    /**
     * Retreives values from stocks object
     * @param {String} columnString - The Name of the column 
     * @param {Int} row - The number of the row
     * @returns {String} - Returns the value from the database on the specified row
     */
    function sToSD(columnString, row){
        // console.log(columnString)
        // console.log(row)
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
            case 'capLeaseDebt':
                value = sd[row].cap_lease_debt;
            case 'capex':
                value = sd[row].capex;
                break;
            case 'capitalEmployed':
                value = sd[row].capital_employed;
                break;
            case 'cashConversionCycle':
                value = sd[row].cash_conversion_cycle;
                break;
            case 'cashflowReinvestmentRate':
                value = sd[row].cashflow_reinvestment_rate;
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
            case 'ebit':
                value = sd[row].ebit;
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
            case 'flowRatio':
                value = sd[row].flow_ratio;
                break;
            case 'fror':
                value = sd[row].fror;
                break;
            case 'grossMargin':
                value = sd[row].grossMargin;
                break;
            case 'growthYears':
                value = sd[row].growth_years;
                break;
            case 'investedCapital':
                value = sd[row].invested_capital;
                break;
            case 'longTermDebt':
                value = sd[row].lt_debt_lease_obligations;
                break;
            case 'marketCap':
                value = sd[row].market_cap;
                break;
            case 'monthEndPrice':
                value = sd[row].month_end_price;
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
            case 'operatingCushion':
                value = sd[row].operating_cushion;
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
            case 'reinvestedCfJdv':
                value = sd[row].reinvested_cf_jdv;
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
        return value;
    }
}
module.exports = {
    formatNumber,
    format_data,
    clearNAN,
    formatHistorical,
}