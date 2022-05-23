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
        return 'null';
    }
    if (!isFinite(param)) {
        return 'Infinity';
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
        data.fcfYield = `${cNaI((Number(data.fcf) / Number(data.market_cap))* 100).toFixed(2)}%`;
        data.fcfSpice = `${cNaI(((Number(data.fcfmargin.replace('%', '')) * Number(data.asset_turnover)) * (Number(data.fcfYield.replace('%', ''))))/100).toFixed(2)}`;
        data.yield_format = data.yield + '%';

        data.fcfroic = `${cNaI((Number(data.fcf) / Number(data.invested_capital)) * 100).toFixed(2)}%`;
        data.fcfroa = `${cNaI(Number(data.fcfmargin.replace('%','')) * Number(data.asset_turnover)).toFixed(2)}%`;
        data.fcfroe = `${cNaI((Number(data.fcfmargin.replace('%','')) * Number(data.asset_turnover) * (Number(data.totalassets)/Number(data.total_stockholder_equity)))).toFixed(2)}%`
        data.fcfRoce = `${cNaI(((Number(data.fcf)/Number(data.capital_employed)) * 100).toFixed(2))}%`
        data.fcfRota = `${cNaI((Number(data.fcf)/(Number(data.totalassets) - Number(data.intangible_assets)))*100).toFixed(2)}%`

        data.grossmargin = `${cNaI(Number(data.grossmargin))}%`;
        data.operatingmargin = `${cNaI(Number(data.operatingmargin))}%`;
        data.fcfmargin = `${cNaI(Number(data.fcfmargin))}%`;

        data.nd_aebitda = `${cNaI(Number(data.net_debt) / Number(data.aebitda)).toFixed(2)}`;
        data.ndFcf = `${cNaI(Number(data.net_debt) / Number(data.fcf)).toFixed(2)}`;
        data.cap_lease_debt_test = data.cap_lease_debt
        data.cap_lease_debt = data.cap_lease_debt != 0 ? `${cNaI(Number(data.cap_lease_debt) * 100).toFixed(2)}%`: `N/A`;

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

        data.sgr = `${cNaI((( Number(data.fcfroic.replace('%','')) * (1-Number(data.dividend)))).toFixed(2))}%`;
        data.fror = `${cNaI(data.fror)}%`;
        data.expected_annual_total_return = `${cNaI(Number(data.fcfYield.replace(/[^0-9.-]/g, "")) + Number(data.sgr.replace(/[^0-9.-]/g, ""))).toFixed(2)}%`;

        data.dividendPayoutRatio = `${cNaI((Number(data.dividendspershare)/(Number(data.fcf)/Number(data.shares_outstanding))) * 100).toFixed(2)}%`;
        data.cashflow_reinvestment_rate = `${cNaI(Number(data.cashflow_reinvestment_rate)*100).toFixed(0)}%`;

        data.capFcf = `${cNaI(Number(data.market_cap) / Number(data.fcf)).toFixed(2)}`;
        data.fcfYield = `${cNaI((Number(data.fcf) / Number(data.market_cap))* 100).toFixed(2)}%`;
        data.fcfMultiple = `${cNaI((Number(data.market_cap) / Number(data.fcf))).toFixed(2)}`;
        data.fcfSpice = `${cNaI(((Number(data.fcfmargin.replace('%', '')) * Number(data.asset_turnover)) * (Number(data.fcfYield.replace('%', ''))))/100).toFixed(2)}`;
        data.aebitda_spice = cNaI(Math.round(data.aebitda / data.revenue * data.asset_turnover * 100 / (data.enterprise_value / data.aebitda) * 100) / 100);
        data.roe_spice = cNaI(Math.round(data.roe / (data.enterprise_value / data.aebitda) * 100) / 100);   
        data.urbem_value = `${cNaI(Number(data.capFcf)/Number(data.sgr.replace('%',''))).toFixed(1)}`    

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

        data.purchase_of_business = formatNumber(Number(data.purchase_of_business).toFixed(0), '$');
        
        data.goodwill = formatNumber(((Number(data.goodwill)/Number(data.totalassets)) * 100).toFixed(2), '%');

        data.flow_ratio = formatNumber((Number(data.flow_ratio) * 100).toFixed(2), '%');

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
    stock.setup.fcfYield = setup('fcfYield', '%');

    stock.setup.fcfroic = setup('fcfroic', '%');
    stock.setup.fcfRota = setup('fcfRota', '%');

    stock.setup.grossmargin = setup('grossmargin', '%');
    stock.setup.operatingmargin = setup('operatingmargin', '%');
    stock.setup.fcfmargin = setup('fcfmargin', '%');

    stock.setup.ndFcf = setup('ndFcf');

    stock.setup.capex_sales = setup('capex_sales', '%');
    stock.setup.capex_fcf = setup('capex_fcf', '%');

    stock.setup.fcfNetIncome = setup('fcfNetIncome', '%', '%');
    stock.setup.cash_conversion_cycle = setup('cash_conversion_cycle', '','',0);
    stock.setup.salesshare = setup('salesshare', '$');
    stock.setup.fcfShare = setup('fcfShare');

    stock.setup.dividendPayoutRatio = setup('dividendPayoutRatio', '%');
    stock.setup.cashflow_reinvestment_rate = setup('cashflow_reinvestment_rate', '%', 0);

    stock.setup.flow_ratio = setup('flow_ratio', '%');

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
    for(let i = 1; i <= 5; i++){
        try{
            let num = cNaI(((Number(stock.stockdata[i].fcf) - Number(stock.stockdata[i + 3].fcf))/(Number(stock.stockdata[i].total_stockholder_equity) - Number(stock.stockdata[i+3].total_stockholder_equity))) * 100).toFixed(2);
            stock.calculations[`iroe3yr${i}`] = `${(num > 0) ? num: 0}%`;
        }
        catch(e){
            stock.calculations[`iroe3yr${i}`] = `0.00%`
        }
    }
    for(let i = 1; i <= 3; i++){
        try{
            let num = cNaI(((Number(stock.stockdata[i].fcf) - Number(stock.stockdata[i + 5].fcf))/(Number(stock.stockdata[i].total_stockholder_equity) - Number(stock.stockdata[i+5].total_stockholder_equity))) * 100).toFixed(2)
            stock.calculations[`iroe5yr${i}`] = `${(num > 0) ? num : 0}%`;
        }
        catch(e){
            stock.calculations[`iroe5yr${i}`] = `0.00%`
        }
    }
    
    try{
        let iroiE1 = cNaI(((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[2].fcf))/(Number(stock.stockdata[1].total_stockholder_equity) - Number(stock.stockdata[2].total_stockholder_equity))) * 100).toFixed(2);
        stock.calculations.incrementalRoe1yr = (iroiE1 > 0) ? `${iroiE1}%` : '0.00%';
    }
    catch{
        stock.calculations.incrementalRoe1yr = '0';
    }
    try{
        let iroiE3 = cNaI(((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[4].fcf))/(Number(stock.stockdata[1].total_stockholder_equity) - Number(stock.stockdata[4].total_stockholder_equity))) * 100).toFixed(2);
        stock.calculations.incrementalRoe3yr = (iroiE3 > 0) ? `${iroiE3}%` : '0.00%';
    }   
    catch{
        stock.calculations.incrementalRoe3yr = '0';
    }
    try{
        let iroiE5 = cNaI(((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[6].fcf))/(Number(stock.stockdata[1].total_stockholder_equity) - Number(stock.stockdata[6].total_stockholder_equity))) * 100).toFixed(2);
        stock.calculations.incrementalRoe5yr = (iroiE5 > 0) ? `${iroiE5}%` : '0.00%';
    }
    catch{
        stock.calculations.incrementalRoe5yr = '0';
    }
    try{
        let iroiE10 = cNaI(((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[11].fcf))/(Number(stock.stockdata[1].total_stockholder_equity) - Number(stock.stockdata[11].total_stockholder_equity))) * 100).toFixed(2);
        stock.calculations.incrementalRoe10yr = (iroiE10 > 0) ? `${iroiE10}%` : '0.00%'
    }
    catch{
        stock.calculations.incrementalRoe10yr = '0';
    }

    //Finds max/min fcfYield in last 10 years
    stock.fcfYield = {};
    let max = '';
    let min = '';
    for(let i = 0; i < 10; i++){
        try{
            //first pass
            if(i === 0){
                max = stock.stockdata[i].fcfYield
                min = stock.stockdata[i].fcfYield
            }
            else{
                if(Number(stock.stockdata[i].fcfYield.replace(/[^0-9.-]/g, "")) > Number(max.replace(/[^0-9.-]/g, ""))){
                    max = stock.stockdata[i].fcfYield;
                }
                else if(Number(stock.stockdata[i].fcfYield.replace(/[^0-9.-]/g, "")) < Number(min.replace(/[^0-9.-]/g, ""))){
                    min = stock.stockdata[i].fcfYield;
                }
            }
        }
        catch(e){
            // console.log(e)
            break;
        }
    }
    stock.fcfYield.max = max;
    stock.fcfYield.min = min;

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

    //calculates Owner Cash Earnings LFY
    try{
        stock.OwnerCashEarning_LFY = (cNaI(Number(stock.stockdata[1].operating_cash_flow))
        + cNaI(Number(stock.stockdata[1].purchase_of_ppe))
        + cNaI(Number(stock.stockdata[1].sales_of_ppe))
        + cNaI(Number(stock.stockdata[1].other_financing))
        + cNaI(Number(stock.stockdata[1].net_intangibles_purchase_and_sale))
        - cNaI(Number(stock.stockdata[1].stock_based_compensation))).toFixed(2)

        stock.OwnerCashEarningsYield = ((cNaI(Number(stock.OwnerCashEarning_LFY)) / cNaI(Number(stock.stockdata[0].market_cap))) * 100).toFixed(2) + '%'
    }
    catch(err){
     stock.OwnerCashEarning_LFY = 0
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

        //Calculates NPV
        let {
            growthYears,
            growthRateStart, 
            growthRateEnd,
            discountRate,
            terminalMultiple,
            fcf
        } = stock.npv;
        stock.npv.fcf = (fcf == '0') ? 
            (Number(stock.stockdata[0].fcf) + Number(stock.stockdata[0].net_income)) / 2
            : fcf

        let calculatedNPV = [];
        for(let i = 0; i <= Number(growthYears); i++){
            if(i < 1){
                calculatedNPV.push({
                    growth: Number(growthRateStart),
                    fcf: Number(stock.npv.fcf),
                    npvAccFcf: Number(stock.npv.fcf),
                    npvTerminal: null,
                    npvTotal: null,
                });
            }
            else{
                let {
                    growth,
                    fcf,
                    npvAccFcf,
                } = calculatedNPV[i-1]
                let 
                    cGrowth = (growth - (Number(growthRateStart) - Number(growthRateEnd))/growthYears);
                    cFcf = fcf * (1 + cGrowth),
                    cnpvAccFcF = (i == 1) 
                        ? cFcf / Math.pow(1 + Number(discountRate), i)
                        : npvAccFcf + cFcf / Math.pow(1 + Number(discountRate), i)
                    cnpvTerminal = (i !== Number(growthYears)) ? null : (cFcf * Number(terminalMultiple)) / Math.pow(1 + Number(discountRate), i + 1)
                    cnpvTotal = (i !== Number(growthYears)) ? null : (cnpvTerminal + cnpvAccFcF)
                    cfvMultiple = (i !== Number(growthYears)) ? null : (cnpvTotal/stock.npv.fcf)
                calculatedNPV.push({
                    growth: cGrowth,
                    fcf: cFcf,
                    npvAccFcf: cnpvAccFcF,
                    npvTerminal: cnpvTerminal,
                    npvTotal: cnpvTotal,
                    fvMultiple: cfvMultiple,
                });
            }
        }
        let {
            fvMultiple,
            npvTotal,
        } = calculatedNPV[calculatedNPV.length-1]
        let currentMultiple = 1/(Number(stock.stockdata[0].fcf)/Number(stock.stockdata[0].market_cap));
        let premiumDiscount = (Number(stock.stockdata[0].market_cap)/npvTotal);
        stock.npvoutput = {
            fv: npvTotal.toFixed(2),
            fvMultiple: fvMultiple.toFixed(2),
            currentMultiple: currentMultiple.toFixed(2),
            premiumDiscount: `${premiumDiscount.toFixed(2)}`,
            PdFvCur: `${(currentMultiple/fvMultiple).toFixed(2)}`,
        }
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
            //equation empty + single column
            if(custom[i].equation.length === 0){
                //average = [columnName, years]
                let splitColAve = custom[i].columns.split('|');
                let splitColDel = custom[i].columns.split(':');
                //calculates average
                if(splitColAve.length === 2){
                    let columnName = splitColAve[0];
                    let aveYears = Number(splitColAve[1]);
                    let num = calc.calculate_average(data[0].stockdata, sToSD(columnName,0,true), aveYears, yr)
                    year[custom[i].rowName] = (custom[i].sign === '$')
                    ?   `$${formatNumber(Number(num).toFixed(decimal))}`
                    :   `${formatNumber(Number(num).toFixed(decimal))}${custom[i].sign}`
                }
                else if(splitColDel.length === 2){
                    let columnName = splitColDel[0]
                    let cYrs = Number(splitColDel[1])
                    year[custom[i].rowName] = (custom[i].sign === '$')
                    ? `$${formatNumber(Number(sToSD(columnName, yr + cYrs)).toFixed(decimal))}`
                    : `${formatNumber(Number(sToSD(columnName, yr + cYrs)).toFixed(decimal))}${custom[i].sign}`

                }
                else{
                    year[custom[i].rowName] = (custom[i].sign === '$')
                    ?   `$${formatNumber(Number(sToSD(custom[i].columns, yr)).toFixed(decimal))}`
                    :   `${formatNumber(Number(sToSD(custom[i].columns, yr)).toFixed(decimal))}${custom[i].sign}`
                }
            }
            else{
                let variables = [];
                for(let p of custom[i].columns.split(" ")){
                    if (p.split('|').length === 2){
                        let average = p.split('|');
                        variables.push(calc.calculate_average(data[0].stockdata, sToSD(average[0],0,true), Number(average[1]), yr));
                    }
                    else if(p.split(':').length === 2){
                        let delay = p.split(':');
                        let num = sToSD(delay[0], yr + Number(delay[1]));
                        if(num !== false) variables.push(Number(num));
                        else variables.push(num);
                    }
                    else if(p.length > 0) variables.push(Number(sToSD(p, yr)));
                }
                year[custom[i].rowName] = (custom[i].sign === '$')
                ?   `$${formatNumber(Number(evalExpression(variables, custom[i].equation)).toFixed(decimal))}`
                :   `${formatNumber(Number(evalExpression(variables, custom[i].equation)).toFixed(decimal))}${custom[i].sign}`
            }
        }
        toSend.push(year)
        }
        catch(e){
            console.log(e)
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
    function sToSD(columnString, row = 0, avg=false){
        // console.log(columnString)
        // console.log(row)
        // console.log(sd)
        try{
            let value;
            switch(columnString) {
                case 'aebitda':
                    value = (avg === false) 
                        ? sd[row].aebitda
                        : 'aebitda';
                    break;
                case 'assetTurn':
                    value = (avg === false) 
                        ? sd[row].asset_turnover
                        : 'asset_turnover';
                    break;
                case 'bvps':
                    value = (avg === false) 
                    ? sd[row].book_value_per_share
                    : 'book_value_per_share';
                    break;
                case 'capLeaseDebt':
                    value = (avg === false)
                        ? sd[row].cap_lease_debt
                        : 'cap_lease_debt';
                case 'capex':
                    value = (avg === false)
                        ? sd[row].capex
                        : 'capex';
                    break;
                case 'capitalEmployed':
                    value = (avg === false)
                        ? sd[row].capital_employed
                        : 'capital_employed';
                    break;
                case 'cashConversionCycle':
                    value = (avg === false) 
                        ? sd[row].cash_conversion_cycle
                        : 'cash_conversion_cycle';
                    break;
                case 'cashflowReinvestmentRate':
                    value = (avg === false) 
                        ? sd[row].cashflow_reinvestment_rate
                        : 'cashflow_reinvestment_rate';
                    break;
                case 'debtToEquity':
                    value = (avg === false) 
                        ? sd[row].debt_to_equity
                        : 'debt_to_equity';
                    break;
                case 'discountRate':
                    value = (avg === false) 
                        ? sd[row].discount_rate
                        : 'discount_rate';
                    break;
                case 'dividend':
                    value = (avg === false) 
                        ? sd[row].dividend
                        : 'dividend';
                    break;
                case 'dividendYield':
                    value = (avg === false) 
                        ? sd[row].dividendYield
                        : 'dividendYield';
                    break;
                case 'dividendPerShare':
                    value = (avg === false) 
                        ? sd[row].dividendShare
                        : 'dividendShare';
                    break;
                case 'ebit':
                    value = (avg === false) 
                        ? sd[row].ebit
                        : 'ebit';
                    break;
                case 'effectiveTax':
                    value = (avg === false) 
                        ?  sd[row].effective_tax
                        : 'effective_tax';
                    break;
                case 'employees':
                    value = (avg === false) 
                        ?  sd[row].employees
                        : 'employees';
                    break;
                case 'enterpriseValue':
                    value = (avg === false) 
                        ?  sd[row].enterprise_value
                        : 'enterprise_value';
                    break;
                case 'epsBasic':
                    value = (avg === false) 
                        ?  sd[row].eps_basic
                        : 'eps_basic';
                    break;
                case 'epsWithoutNri':
                    value = (avg === false) 
                        ?  sd[row].eps_without_nri
                        : 'eps_without_nri';
                    break;
                case 'fcf':
                    value = (avg === false) 
                        ?  sd[row].fcf
                        : 'fcf';
                    break;
                case 'fcfMargin':
                    value = (avg === false) 
                        ?  sd[row].fcfmargin
                        : 'fcfmargin';
                    break;
                case 'flowRatio':
                    value = (avg === false) 
                        ?  sd[row].flow_ratio
                        : 'flow_ratio';
                    break;
                case 'fror':
                    value = (avg === false) 
                        ?  sd[row].fror
                        : 'fror';
                    break;
                case 'grossMargin':
                    value = (avg === false) 
                        ?  sd[row].grossmargin
                        : 'grossmargin';
                    break;
                case 'growthYears':
                    value = (avg === false) 
                        ?  sd[row].growth_years
                        : 'growth_years';
                    break;
                case 'investedCapital':
                    value = (avg === false) 
                        ?  sd[row].invested_capital
                        : 'invested_capital';
                    break;
                case 'intangibleAssets':
                    value = (avg === false) 
                        ?  sd[row].intangible_assets
                        : 'intangible_assets';
                    break;
                case 'longTermDebt':
                    value = (avg === false) 
                        ?  sd[row].lt_debt_lease_obligations
                        : 'lt_debt_lease_obligations'
                    break;
                case 'marketCap':
                    value = (avg === false) 
                        ?  sd[row].market_cap
                        : 'market_cap'
                    break;
                case 'monthEndPrice':
                    value = (avg === false) 
                        ?  sd[row].month_end_price
                        : 'month_end_price'
                    break;
                case 'netDebt':
                    value = (avg === false) 
                        ?  sd[row].net_debt
                        : 'net_debt'
                    break;
                case 'netIntangibles':
                    value = (avg === false) 
                        ?  sd[row].net_intangibles_purchase_and_sale
                        : 'net_intangibles_purchase_and_sale'
                    break;
                case 'netIncome':
                    value = (avg === false) 
                        ?  sd[row].net_income
                        : 'net_income'
                    break;
                case 'netMargin':
                    value = (avg === false) 
                        ?  sd[row].netmargin
                        : 'netmargin'
                    break;
                case 'operatingCashFlow':
                    value = (avg === false) 
                        ?  sd[row].operating_cash_flow
                        : 'operating_cash_flow'
                    break;
                case 'operatingCushion':
                    value = (avg === false) 
                        ?  sd[row].operating_cushion
                        : 'operating_cushion'
                    break;
                case 'operatingMargin':
                    value = (avg === false) 
                        ?  sd[row].operatingmargin
                        : 'operatingmargin'
                    break;
                case 'otherFinancing':
                    value = (avg === false) 
                        ?  sd[row].other_financing
                        : 'other_financing'
                    break;
                case 'ownerEarning':
                    value = (avg === false) 
                        ?  sd[row].ownerEarningShar
                        : 'ownerEarningShar';
                    break;
                case 'ppe':
                    value = (avg === false) 
                        ?  sd[row].ppe
                        : 'ppe';
                    break;
                case 'price':
                    value = (avg === false) 
                        ?  sd[row].price
                        : 'price';
                    break;
                case 'purchaseOfBusiness':
                    value = (avg === false) 
                        ?  sd[row].purchase_of_business
                        : 'purchase_of_business';
                    break;
                case 'purchaseOfPPE':
                    value = (avg === false) 
                        ?  sd[row].purchase_of_ppe
                        : 'purchase_of_ppe';
                    break;
                case 'reinvestedCfJdv':
                    value = (avg === false) 
                        ?  sd[row].reinvested_cf_jdv
                        : 'reinvested_cf_jdv';
                    break;
                case 'revenue':
                    value = (avg === false) 
                        ?  sd[row].revenue
                        : 'revenue';
                    break;
                case 'roe':
                    value = (avg === false) 
                        ?  sd[row].roe
                        : 'roe';
                    break;
                case 'roic':
                    value = (avg === false) 
                        ?  sd[row].roic
                        : 'roic';
                    break;
                case 'salesOfPPE':
                    value = (avg === false) 
                        ?  sd[row].sales_of_ppe
                        : 'sales_of_ppe';
                    break;
                case 'sharesOutstanding':
                    value = (avg === false) 
                        ?  sd[row].shares_outstanding
                        : 'shares_outstanding';
                    break;
                case 'sharesOutstandingQuarterly':
                    value = (avg === false) 
                        ?  sd[row].shares_outstanding_quarterly
                        : 'shares_outstanding_quarterly';
                    break;
                case 'shortTermDebt':
                    value = (avg === false) 
                        ?  sd[row].st_debt_lease_obligations
                        : 'st_debt_lease_obligations';
                    break;
                case 'stockBasedCompensation':
                    value = (avg === false) 
                        ?  sd[row].stock_based_compensation
                        : 'stock_based_compensation';
                    break;
                case 'terminalGrowthRate':
                    value = (avg === false) 
                        ?  sd[row].terminal_growth_rate
                        : 'terminal_growth_rate';
                    break;
                case 'TerminalYears':
                    value = (avg === false) 
                        ?  sd[row].terminal_years
                        : 'terminal_years';
                    break;
                case 'totalStockholderEquity':
                    value = (avg === false) 
                        ?  sd[row].total_stockholder_equity
                        : 'total_stockholder_equity';
                    break;
                case 'totalAssets':
                    value = (avg === false) 
                        ?  sd[row].totalassets
                        : 'totalassets';
                    break;
                case 'ttm':
                    value = (avg === false) 
                        ?  sd[row].ttm
                        : 'ttm';
                    break;
                case 'wacc':
                    value = (avg === false) 
                        ?  sd[row].wacc
                        : 'wacc';
                    break;
                case 'yield':
                    value = (avg === false) 
                        ?  sd[row].yield
                        : 'yield';
                    break;
                default:
                    value = 'N/A'
            }
            return value;
        }
        catch(e){
            console.log("out of bounds");
            return false;
        }
    }
}
module.exports = {
    formatNumber,
    format_data,
    clearNAN,
    formatHistorical,
}

// Unused Calculations
/* 

stock.calculations.rule_of_40 = `${cNaI(Number(stock.stockdata[3].fcfmargin.replace('%','')) + Number(stock.setup.fcfShare["compGrowth3yr"].replace('%',''))).toFixed(2)}%`;

// 1 year
stock.calculations.incrementalRoic1yr = `${cNaI((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[2].fcf))/(Number(stock.stockdata[1].invested_capital) - Number(stock.stockdata[2].invested_capital)) * 100).toFixed(2)}%`
stock.calculations.incrementalJDVROIC1yr = `${cNaI((Number(stock.stockdata[1].fcf)-Number(stock.stockdata[2].fcf))/addup('reinvested_cf_jdv', 1, 2)*100).toFixed(2)}%`

stock.calculations.incrementalRoic1yr = '0';
stock.calculations.incrementalJDVROIC1yr = '0'

// 3 year
stock.calculations.incrementalRoic3yr = `${cNaI((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[4].fcf))/(Number(stock.stockdata[1].invested_capital) - Number(stock.stockdata[4].invested_capital)) * 100).toFixed(2)}%`
stock.calculations.incrementalJDVROIC3yr = `${cNaI((Number(stock.stockdata[1].fcf)-Number(stock.stockdata[4].fcf))/addup('reinvested_cf_jdv', 1, 4)*100).toFixed(2)}%`
    
stock.calculations.incrementalRoic3yr = '0';
stock.calculations.incrementalJDVROIC3yr = '0'

// 5 year
stock.calculations.sgr5yr = `${cNaI(Number(stock.setup.sgr['5yrAvg'].replace('%','')) / 1 - Number(stock.setup.dividend['5yrAvg'].replace('%','')))}`;
stock.calculations.incrementalRoic5yr = `${cNaI((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[6].fcf))/(Number(stock.stockdata[1].invested_capital) - Number(stock.stockdata[6].invested_capital)) * 100).toFixed(2)}%`
stock.calculations.incrementalJDVROIC5yr = `${cNaI((Number(stock.stockdata[1].fcf)-Number(stock.stockdata[6].fcf))/addup('reinvested_cf_jdv', 1, 6)*100).toFixed(2)}%`

stock.calculations.sgr5yr = '0';
stock.calculations.incrementalRoic5yr = '0';
stock.calculations.incrementalJDVROIC5yr = '0'

//10 year
stock.calculations.sgr10yr = `${cNaI(Number(stock.setup.sgr['10yrAvg'].replace('%','')) / 1 - Number(stock.setup.dividend['10yrAvg'].replace('%',''))).toFixed(2)}`;
stock.calculations.bvpsY10 = `$${formatNumber(cNaI(((Math.pow( 1 + (Number(stock.setup.sgr['10yrAvg'].replace('%',''))/ 100), 10)) * Number(stock.stockdata[0].book_value_per_share)).toFixed(2)))}`;
stock.calculations.fcfShareY10 = `$${formatNumber(cNaI(((Math.pow( 1 + (Number(stock.setup.sgr['10yrAvg'].replace('%',''))/ 100), 10)) * Number(stock.stockdata[0].fcfShare)).toFixed(2)))}`;
stock.calculations.stockPriceY10 = `$${formatNumber(cNaI((Number(stock.calculations.fcfShareY10.replace('$', '')) * Number(stock.setup.capFcf['10yrAvg'])).toFixed(2)))}`;
stock.calculations.projected10ror = `${formatNumber(cNaI(((Math.pow(Number(stock.calculations.stockPriceY10.replace(/[^0-9.-]/g, "")) / Number(stock.stockdata[0].price),0.1)-1) * 100).toFixed(2)))}%`
stock.calculations.projected10Total = `${cNaI((Number(stock.calculations.projected10ror.replace(/[^0-9.-]/g, "")) + Number(stock.setup.dividendYield["10yrAvg"].replace(/[^0-9.-]/g, ""))).toFixed(2))}%`;
stock.calculations.incrementalRoic10yr = `${cNaI((Number(stock.stockdata[1].fcf) - Number(stock.stockdata[11].fcf))/(Number(stock.stockdata[1].invested_capital) - Number(stock.stockdata[11].invested_capital)) * 100).toFixed(2)}%`
stock.calculations.incrementalJDVROIC10yr = `${cNaI((Number(stock.stockdata[1].fcf)-Number(stock.stockdata[11].fcf))/addup('reinvested_cf_jdv', 1, 11)*100).toFixed(2)}%`

stock.calculations.sgr10yr = '0';
stock.calculations.bvpsY10 = '0';
stock.calculations.fcfShareY10 = '0';
stock.calculations.stockPriceY10 = '0';
stock.calculations.projected10ror = '0';
stock.calculations.projected10Total = '0';
stock.calculations.incrementalRoic10yr = '0';
stock.calculations.incrementalJDVROIC10yr = '0';
*/