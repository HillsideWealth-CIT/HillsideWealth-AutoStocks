const moment = require("moment");
const calc = require('./calculations');
/**
 * Adds a comma sparator to numbers in thousads
 * Clears NaNs
 * Adds symbols at the end of strings
 * @param {Float} num 
 * @param {String} extraSymbol 
 */
function formatNumber(num, extraSymbol) {
  try {
      num = clearNAN(num);
      if(!isFinite(num)){
          return null;
      }
      else if(num != null){
          if(extraSymbol == '%' ){
              return `${num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}%`;
          }
          else if(extraSymbol == '$' && num < 0){
              return `-$${(num*-1).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`;
          }
          else if(extraSymbol == '$'){
              return `$${num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`;
          }
          else{
              return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
          }
      }
      else{
          return null;
      }
  }
  catch(e) {
      return null;
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
      data.effective_tax_format = formatNumber(Math.round(data.effective_tax * 10) / 10,'%');
      data.fcf_format = formatNumber(Math.round(data.fcf), '$');
      data.purchase_of_business_format = data.purchase_of_business;

      data.roic_format = formatNumber(data.roic, '%');
      data.wacc_format = formatNumber(data.wacc, '%');
      data.roicwacc_format = formatNumber(Math.round((data.roic - data.wacc) * 100) / 100);
      data.capex_format = formatNumber(Math.round((data.capex * -1)), '$');
      data.aeXsho_format = formatNumber(Math.round((data.aebitda / data.shares_outstanding) * 100) / 100, '$');
      data.capeXfcf_format = formatNumber(Math.round((data.capex / data.fcf) * 100) / 100);
      data.fcfXae_format = formatNumber(Math.round((data.fcf / data.aebitda) * 100), '%');

      data.eps_without_nri_format =  Math.round((data.eps_without_nri) * 100) / 100;
      data.eps_without_nri_string_format = '$' +  Math.round((data.eps_without_nri) * 100) / 100;
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
      data.fcf_yield = formatNumber(Math.round(data.fcf / data.market_cap * 10000)/100, '%');
      
      

      try{
          data.growth_capex = calculate_growth_capex(data.ppe, data.revenue, stock.stockdata[index+1].revenue);
          data.growth_capex_format = formatNumber(calculate_growth_capex(data.ppe, data.revenue, stock.stockdata[index+1].revenue)*-1, '$');
      }
      catch(e){
          data.growth_capex = null;
      }
      
      if(data.growth_capex != null){
          data.maintenance_capex = data.capex - data.growth_capex;
          data.maintenance_capex_format = formatNumber(Math.round(data.maintenance_capex*-1), '$')
          data.capeXae_format = formatNumber(Math.round(((data.maintenance_capex / data.aebitda)* 100)), '%');
      }
      else{
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
  catch(e){
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
      stock.mCapAve_5 = Math.round(calc.calculate_average(stock.stockdata, 'maintenance_capex', 5))
      stock.mCapAve_10 = Math.round(calc.calculate_average(stock.stockdata, 'maintenance_capex', 10))
      stock.mCapAve_15 = Math.round(calc.calculate_average(stock.stockdata, 'maintenance_capex', 15))

      stock.capeXfcfAverage5 = formatNumber(Math.round(calc.calculate_average(stock.stockdata, 'capeXfcf_format', 5) * 100), '%');
      stock.capeXfcfAverage10 = formatNumber(Math.round(calc.calculate_average(stock.stockdata, 'capeXfcf_format', 10) * 100), '%');

      stock.capeXaeAverage5 = formatNumber(Math.round(calc.calculate_average(stock.stockdata, 'capeXae_format', 5)), '%');
      stock.capeXaeAverage10 = formatNumber(Math.round(calc.calculate_average(stock.stockdata, 'capeXae_format', 10)), '%');
      stock.categories == "null" ? stock.categories = null :null;
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

  function calculate_growth_capex(ppe, cur_revenue, prev_revenue){
      // console.log(`${ppe} ${cur_revenue} ${prev_revenue}`)
      if(ppe && prev_revenue){
          growthCapex = Math.round((ppe/cur_revenue)*(prev_revenue - cur_revenue))*100/100 
          return growthCapex;
      }
      else{
          return null;
      }
  }

}

/**
 * returns null if param is NaN
 * @param {*} param
 * @param {*} extraSymbol
 * @returns {string} 
 */
function clearNAN(param, extraSymbol) {
  if (isNaN(param)){
      return null;
  }
  if( !isFinite(param)){
      return 88888888 + extraSymbol;
  }
  else if (extraSymbol) {
      return param + extraSymbol;
  }
  else {
      return param;
  }
}

function formatHistorical(data) {
    let toSend = [];
    let sd = data[0].stockdata
    for(let i = 0; i < 20; i++){
        let year = {
            date: i===0 ? 'TTM' : moment(sd[i].date).format('MMM, YYYY'),
            fcfroic: `${(Number(sd[i].fcf)/(Number(sd[i].total_stockholder_equity) + Number(sd[i].st_debt_lease_obligations) + Number(sd[i].lt_debt_lease_obligations)) * 100).toFixed(2)}%`,
            fcfroa: `${(Number(sd[i].fcfmargin) * Number(sd[i].asset_turnover)).toFixed(2)}%`,
            fcfmargin: `${(Number(sd[i].fcfmargin)).toFixed(2)}%`,
            netdebtfcf: `${(Number(sd[i].net_debt)/Number(sd[i].fcf)).toFixed(2)}`,
            salesshare: (Number(sd[i].revenue)/Number(sd[i].shares_outstanding)).toFixed(2),
            fcfshare: (Number(sd[i].fcf)/Number(sd[i].shares_outstanding)).toFixed(2),
            sgr: ((Number(sd[i].fcf)/(Number(sd[i].total_stockholder_equity) + Number(sd[i].st_debt_lease_obligations) + Number(sd[i].lt_debt_lease_obligations)) * 100) * (1 - sd[i].dividend)).toFixed(2),
            fcf_net_income: `${((Number(sd[i].fcf)/Number(sd[i].net_income)) * 100).toFixed(2)}%`,
            shares_outstanding: Number(sd[i].shares_outstanding),
            fcf_yield: `${((Number(sd[i].fcf) / Number(sd[i].enterprise_value)) * 100).toFixed(2)}%`,
            fcf_spice: ((Number(sd[i].fcfmargin) * Number(sd[i].asset_turnover)) / (Number(sd[i].enterprise_value) / Number(sd[i].fcf))).toFixed(2),
        }
        toSend.push(year)
    }
    return toSend
}

module.exports = {
  formatNumber,
  format_data,
  clearNAN,
  formatHistorical,
}