/**Calculates the dcf using the following parameters
 * @param {String} eps - earnings per share
 * @param {String} growth_rate
 * @param {String} terminal_growth - terminal growth rate
 * @param {String} discount_rate 
 * @param {Integer} g_years - growth years
 * @param {Integer} t_years - terminal growth years
 * @returns {JSON} results
 */
function dcf( eps, growth_rate, terminal_growth, discount_rate, g_years=10, t_years=10){
    // console.log(`${eps} ${growth_rate} ${terminal_growth} ${discount_rate} ${g_years} ${t_years}`)
    let results = {};
    let x = (1+parseFloat(growth_rate))/(1+parseFloat(discount_rate));
    let y = (1+parseFloat(terminal_growth))/(1+parseFloat(discount_rate));
    results.growth_value = dcf_growth(x, parseFloat(eps), g_years);
    results.terminal_value = dcf_terminal(x, y, parseFloat(eps), g_years,t_years);
    if(!isNaN(results.growth_value) && isFinite(results.growth_value + results.terminal_value) == true){
        results.fair_value ='$' + Math.round((results.growth_value + results.terminal_value) * 100)/100;
        results.growth_value ='$' + Math.round((results.growth_value) * 100 ) / 100;
        results.terminal_value ='$' + Math.round((results.terminal_value) * 100 ) / 100 ;
    }
    else{
        results.fair_value = null;
        results.growth_value = null;
        results.terminal_value = null;
    }
    return results;
}

/**
 * calculates the growth value
 * @param {float} x - growth rate devided by discount rate
 * @param {float} eps - earnings per share
 * @param {Integer} years 
 * @returns {float} growth_value
 */
function dcf_growth(x, eps, years){
    // console.log(`${x} ${eps} ${years}`);
    let growth_value = 0;
    //console.log(`X: ${x} ; Y: ${y}`)
    for(let i = 1; i <= years; i ++){
        let pow = Math.pow(x,i);
        growth_value += pow * eps;
    }
    return growth_value;
}

/**
 * @param {float} x - growth rate devided by discount rate
 * @param {float} y - terminal growth rate devided by discount rate
 * @param {float} eps - earning per share
 * @param {float} g_years - growth years
 * @param {float} t_years - terminal growth years
 * @returns {float} terminal_value
 */
function dcf_terminal(x, y, eps, g_years ,t_years){
    let terminal_value = 0;
    for (let i = 1; i <= t_years; i ++){
        part1 = Math.pow(x,g_years)
        part2 = Math.pow(y,i)
        terminal_value += part1 * part2 * eps;
        //console.log(part1*part2*eps)
    }
    return terminal_value;
}
/**
 * creates a giant query string using a list of stocks
 * @param {Array} list - list of stock ids 
 * @returns {String} conditions
 */
function multi_dfc_string(list) {
    let conditions = "";
    for(let i in list){
        if (i >= 1){
            conditions += ` OR stock_id=${list[i]}`;
        }
        else {
            conditions = `stock_id=${list[i]}`;
        }
        
    }
    return conditions;
}

function createAggregationString(arr) {
    let aggregateString = '';
    for(let i in arr){
        if (i == 0){
            aggregateString += arr[i];
        }
        else {
            aggregateString += `, ${arr[i]}`;
        }
    }
    return aggregateString;
}

/**
 * Determines if a price is under, over, or in expected regions
 * @param {Integer} val - Morningstar fairvalue
 * @param {Integer} price - current price of stock
 * @returns {String}
 */
function value_calculator(val, price){
    if(val != 'null'  && price != 'null'){
        if(price <= val * 1.10 && price >= val * 0.9){
            return 'Expected';
        }
        else if(price >= val * 1.10){
            return 'OverValued';
        }
        else{
            return 'UnderValued';
        }
    }
    else{
        return null;
    }
}

/**
 * calculates the average of numbers
 * @param {JSON} data 
 * @param {String} column 
 * @param {Integer} years 
 */
function calculate_average(data, column, years){
    try{
        let total = 0;
        for(let i = 0; i < years; i++){
            total += parseFloat(data[i][`${column}`]);
        }
        return Math.round((total/years)*1000)/1000;
        }
        catch(e){
            return null;
        }
}

module.exports={
    dcf,
    multi_dfc_string,
    createAggregationString,
    value_calculator,
    calculate_average
};