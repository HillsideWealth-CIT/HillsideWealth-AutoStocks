/**
 * Creates the list of Columns
 */
function createColumnList() {
  let optionString = '<datalist id="columnList">';
  let tableList = document.getElementById('headerRow').childNodes;
  for (let i = 0; i < tableList.length; i++) {
      if (tableList[i].innerHTML != '') {
          optionString += `<option value="${tableList[i].innerHTML}">`;
      }
  }
  return `${optionString}</datalist>`;
}

/***
* Creates the aggregation menu
*/
function createAggregation() {
  let to_send = {};
  Swal.fire({
      title: 'Create Aggregation',
      showCancelButton: true,
      html:
          `
              <div class="row">
                  <div class="col">
                      <label for="nameform">Name</label>
                      <input id="nameForm" type="text" class="form-control">
                  </div>
              </div>
              <div class="row">
                  <div class="col">
                      <label>Columns</label>
                  </div>
              </div>
              <div class="row">
                  <div class="col">
                      <label>Add [ !] At The End For greatest to least</label>
                  </div>
              </div>

              <div class="row mt-3">
                  <div class="col">
                      <input id="columnForm1" type="text" list="columnList" class="form-control">
                  </div>
                  <div class="col">
                      <input id="columnForm2" type="text" list="columnList" class="form-control">
                  </div>
              </div>
              
              <div class="row mt-3">
                  <div class="col">
                      <input id="columnForm3" type="text" list="columnList" class="form-control">
                  </div>
                  <div class="col">
                      <input id="columnForm4" type="text" list="columnList" class="form-control">
                  </div>
              </div>
          
          <div class="row mt-3">
              <div class="col">
                  <input id="columnForm5" type="text" list="columnList" class="form-control">
              </div>
              <div class="col">
                  <input id="columnForm6" type="text" list="columnList" class="form-control">
              </div>
          </div>
      
      
          <div class="row mt-3">
              <div class="col">
                  <input id="columnForm7" type="text" list="columnList" class="form-control">
              </div>
              <div class="col">
                  <input id="columnForm8" type="text" list="columnList" class="form-control">
              </div>
          </div>
      
      
          <div class="row mt-3">
              <div class="col">
                  <input id="columnForm9" type="text" list="columnList" class="form-control">
              </div>
              <div class="col">
                  <input id="columnForm10" type="text" list="columnList" class="form-control">
              </div>
          </div>

      ${createColumnList()}
          `,
  }).then((result) => {
      if (!result.dismiss) {
          to_send.name = document.getElementById('nameForm').value;
          to_send.columns = [];
          for (let i of 10) {
              if (document.getElementById(`columnForm${i + 1}`).value != "") {
                  to_send.columns.push(document.getElementById(`columnForm${i + 1}`).value);
              }
          }
          fetch('/aggregation?action=create', {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(to_send)
          }).then(response => response.json())
              .then(data => {
                  console.log(data);
              });
      }
  });
}

/**
* requests data from servers then determines what actions to take
* @param {Integer} columnNum - The column number
* @param {String} ver - the correct function to use
*/
function settingAggregation(columnNum, ver) {
  fetch('/aggregation?action=get', {
      method: 'POST',
      headers: { "Content-Type": "application/json" }
  })
  .then(response => response.json())
  .then(data => {
      createSelector(data);
      Swal.fire({
          title: 'Select Aggregate',
          input: 'select',
          inputOptions: createSelector(data),
          inputPlaceholder: 'Select a setting',
          showCancelButton: 'true',
          showConfirmButton: 'true',
      }).then(result => {
          if (!result.dismiss) {
              if(ver == 'set') {
                  sendColumnData(result.value.split(', '), columnNum);
              }
              else if(ver == 'edit') {
                  editAggregations(data, result);
              }
              else if (ver == 'delete') { 
                  deleteAggregations(data, result);
              }
              else{
                  alert('error');
              }
          }
      });
  });
}

/**
* Creates a JSON
* @param {List} arr 
*/
function createSelector(arr) {
  let selectors = {};
  for (let i in arr) {
      selectors[`${arr[i].aggregate_string}`] = arr[i].name;
  }
  return selectors;
}

/**
* Sends the Column data to the server then changes the aggregate column numbers
* @param {List} valueList 
* @param {Integer} columnNum 
*/
function sendColumnData(valueList, columnNum) {
  let toSend = [];
  let tableRows = $table.rows().data();

  for (let j in valueList) {
      let columnHeader = valueList[j].split(' !')[0];
      toSend.push({ row: valueList[j], values: [] });
      for (let i in tableRows) {
          if (tableRows[i].symbol) {
              let fad = FAD(tableRows[i], columnHeader);
              if(fad.symbol){
              toSend[j].values.push(fad);
              }
              else{
                  swal.fire({
                      type: 'error',
                      title: 'Error',
                      text: 'The column ['+ fad.error + '] does not exist' 
                  });
                  return
              }
          }
      }
  }
  fetch('/aggregation?action=aggregate', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSend)
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);
      $table.rows().every(function (index) {
          let stockIndex = data.symbols.indexOf($table.cell({ row: index, column: 1 }).data());
          $table.cell({ row: index, column: column_list.indexOf('Aggregated') }).data(data.score[stockIndex]).invalidate();
      });
      $table.draw();
  });

}

//format aggregation data
function FAD(data, column) {
  let keyvalues = {
    'Symbol' : 'symbol',
    'Stock Name' : "stock_name",
    'Current Price' : "stock_current_price",

    'FCF Spice' : "stockdata.0.fcfSpice",
    'FCF Spice 3yr' : "setup.fcfSpice.3yrAvg",
    'FCF Spice 5yr' : "setup.fcfSpice.5yrAvg",
    'FCF Spice 10yr' : "setup.fcfSpice.10yrAvg",
    'FCF Spice TTM/5yr' : "setup.fcfSpice.ttm/5yr",
    'FCF Spice TTM/10yr' : "setup.fcfSpice.ttm/10yr",
    'FCF Spice SD 5yr' : "setup.fcfSpice.5stdev",
    'FCF Spice SD 10yr' : "setup.fcfSpice.10stdev",

    'FCF Yield' : "stockdata.0.fcfYield",
    'FCF Yield 3yr' : "setup.fcfYield.3yrAvg",
    'FCF Yield 5yr' : "setup.fcfYield.5yrAvg",
    'FCF Yield 10yr' : "setup.fcfYield.10yrAvg",
    'FCF Yield TTM/5yr' : "setup.fcfYield.ttm/5yr",
    'FCF Yield TTM/10yr' : "setup.fcfYield.ttm/10yr",
    'FCF Yield SD 5yr' : "setup.fcfYield.5stdev",
    'FCF Yield SD 10yr' : "setup.fcfYield.10stdev",

    'Yield%' : "stockdata.0.yield_format",
    'Enterprise Value (M)' : "stockdata.0.enterprise_value_format",

    'FCFROIC%' : "stockdata.0.fcfroic",
    'FCFROIC% 3yr' : "setup.fcfroic.3yrAvg",
    'FCFROIC% 5yr' : "setup.fcfroic.5yrAvg",
    'FCFROIC% 10yr' : "setup.fcfroic.10yrAvg",
    'FCFROIC% TTM/5yr' : "setup.fcfroic.ttm/5yr",
    'FCFROIC% TTM/10yr' : "setup.fcfroic.ttm/10yr",
    'FCFROIC% SD 5yr' : "setup.fcfroic.5stdev",
    'FCFROIC% SD 10yr' : "setup.fcfroic.10stdev",

    'FCFROA%' : "stockdata.0.fcfroa",
    'FCFROA% 3yr' : "setup.fcfroa.3yrAvg",
    'FCFROA% 5yr' : "setup.fcfroa.5yrAvg",
    'FCFROA% 10yr' : "setup.fcfroa.10yrAvg",
    'FCFROA% TTM/5yr' : "setup.fcfroa.ttm/5yr",
    'FCFROA% TTM/10yr' : "setup.fcfroa.ttm/10yr",
    'FCFROA% SD 5yr' : "setup.fcfroa.5stdev",
    'FCFROA% SD 10yr' : "setup.fcfroa.10stdev",
    
    'FCFROE%' : "stockdata.0.fcfroe",
    'FCFROE% 3yr' : "setup.fcfroe.3yrAvg",
    'FCFROE% 5yr' : "setup.fcfroe.5yrAvg",
    'FCFROE% 10yr' : "setup.fcfroe.10yrAvg",
    'FCFROE% TTM/5yr' : "setup.fcfroe.ttm/5yr",
    'FCFROE% TTM/10yr' : "setup.fcfroe.ttm/10yr",
    'FCFROE% SD 5yr' : "setup.fcfroe.5stdev",
    'FCFROE% SD 10yr' : "setup.fcfroe.10stdev",
    
    'FCFROCE%' : "stockdata.0.fcfRoce",
    'FCFROCE% 3yr' : "setup.fcfRoce.3yrAvg",
    'FCFROCE% 5yr' : "setup.fcfRoce.5yrAvg",
    'FCFROCE% 10yr' : "setup.fcfRoce.10yrAvg",
    'FCFROCE% TTM/5yr' : "setup.fcfRoce.ttm/5yr",
    'FCFROCE% TTM/10yr' : "setup.fcfRoce.ttm/10yr",
    'FCFROCE% SD 5yr' : "setup.fcfRoce.5stdev",
    'FCFROCE% SD 10yr' : "setup.fcfRoce.10stdev",

    'FCFROTA%' : "stockdata.0.fcfRota",
    'FCFROTA% 3yr' : "setup.fcfRota.3yrAvg",
    'FCFROTA% 5yr' : "setup.fcfRota.5yrAvg",
    'FCFROTA% 10yr' : "setup.fcfRota.10yrAvg",
    'FCFROTA% TTM/5yr' : "setup.fcfRota.ttm/5yr",
    'FCFROTA% TTM/10yr' : "setup.fcfRota.ttm/10yr",
    'FCFROTA% SD 5yr' : "setup.fcfRota.5stdev",
    'FCFROTA% SD 10yr' : "setup.fcfRota.10stdev",

    'iROiE% 1yr' : "calculations.incrementalRoe1yr",
    'iROiE% 3yr' : "calculations.incrementalRoe3yr",
    'iROiE% 5yr' : "calculations.incrementalRoe5yr",
    'iROiE% 10yr' : "calculations.incrementalRoe10yr",

    'iFCFROiIC% 1yr' : "calculations.incrementalRoic1yr",
    'iFCFROiIC% 3yr' : "calculations.incrementalRoic3yr",
    'iFCFROiIC% 5yr' : "calculations.incrementalRoic5yr",
    'iFCFROiIC% 10yr' : "calculations.incrementalRoic10yr",

    'JDViFCFROiIC% 1yr' : "calculations.incrementalJDVROIC1yr",
    'JDViFCFROiIC% 3yr' : "calculations.incrementalJDVROIC3yr",
    'JDViFCFROiIC% 5yr' : "calculations.incrementalJDVROIC5yr",
    'JDViFCFROiIC% 10yr' : "calculations.incrementalJDVROIC10yr",
    
    'CF Re-investment Rate' : "stockdata.0.cashflow_reinvestment_rate",
    'CF Re-investment Rate 3yr' : "setup.cashflow_reinvestment_rate.3yrAvg",
    'CF Re-investment Rate 5yr' : "setup.cashflow_reinvestment_rate.5yrAvg",
    'CF Re-investment Rate 10yr' : "setup.cashflow_reinvestment_rate.10yrAvg",
    'CF Re-investment Rate TTM/5yr' : "setup.cashflow_reinvestment_rate.ttm/5yr",
    'CF Re-investment Rate TTM/10yr' : "setup.cashflow_reinvestment_rate.ttm/10yr",
    'CF Re-investment Rate SD 5yr' : "setup.cashflow_reinvestment_rate.5stdev",
    'CF Re-investment Rate SD 10yr' : "setup.cashflow_reinvestment_rate.10stdev",

    'Gross Margin%' : "stockdata.0.grossmargin",
    'Gross Margin% 3yr' : "setup.grossmargin.3yrAvg",
    'Gross Margin% 5yr' : "setup.grossmargin.5yrAvg",
    'Gross Margin% 10yr' : "setup.grossmargin.10yrAvg",
    'Gross Margin% TTM/5yr' : "setup.grossmargin.ttm/5yr",
    'Gross Margin% TTM/10yr' : "setup.grossmargin.ttm/10yr",
    'Gross Margin% SD 5yr' : "setup.grossmargin.5stdev",
    'Gross Margin% SD 10yr' : "setup.grossmargin.10stdev",

    'Operating Margin%' : "stockdata.0.operatingmargin",
    'Operating Margin% 3yr' : "setup.operatingmargin.3yrAvg",
    'Operating Margin% 5yr' : "setup.operatingmargin.5yrAvg",
    'Operating Margin% 10yr' : "setup.operatingmargin.10yrAvg",
    'Operating Margin% TTM/5yr' :"setup.operatingmargin.ttm/5yr" ,
    'Operating Margin% TTM/10yr' :"setup.operatingmargin.ttm/10yr" ,
    'Operating Margin% SD 5yr' : "setup.operatingmargin.5stdev",
    'Operating Margin% SD 10yr' : "setup.operatingmargin.10stdev",

    'fcf Margin%' : "stockdata.0.fcfmargin",
    'fcf Margin% 3yr' : "setup.fcfmargin.3yrAvg",
    'fcf Margin% 5yr' : "setup.fcfmargin.5yrAvg",
    'fcf Margin% 10yr' : "setup.fcfmargin.10yrAvg",
    'fcf Margin% TTM/5yr' : "setup.fcfmargin.ttm/5yr",
    'fcf Margin% TTM/10yr' : "setup.fcfmargin.ttm/10yr",
    'fcf Margin% SD 5yr' : "setup.fcfmargin.5stdev",
    'fcf Margin% SD 10yr' : "setup.fcfmargin.10stdev",

    'NetDebt/aEBITDA' : "stockdata.0.nd_aebitda",
    'NetDebt/aEBITDA 3yr' : "setup.nd_aebitda.3yrAvg",
    'NetDebt/aEBITDA 5yr' : "setup.nd_aebitda.5yrAvg",
    'NetDebt/aEBITDA 10yr' : "setup.nd_aebitda.10yrAvg",
    'NetDebt/aEBITDA TTM/5yr' : "setup.nd_aebitda.ttm/5yr",
    'NetDebt/aEBITDA TTM/10yr' : "setup.nd_aebitda.ttm/10yr",
    'NetDebt/aEBITDA SD 5yr' : "setup.nd_aebitda.5stdev",
    'NetDebt/aEBITDA SD 10yr' : "setup.nd_aebitda.10stdev",

    'NetDebt/FCF' : "stockdata.0.ndFcf",
    'NetDebt/FCF 3yr' : "setup.ndFcf.3yrAvg",
    'NetDebt/FCF 5yr' : "setup.ndFcf.5yrAvg",
    'NetDebt/FCF 10yr' : "setup.ndFcf.10yrAvg",
    'NetDebt/FCF TTM/5yr' : "setup.ndFcf.ttm/5yr",
    'NetDebt/FCF TTM/10yr' : "setup.ndFcf.ttm/10yr",
    'NetDebt/FCF SD 5yr' : "setup.ndFcf.5stdev",
    'NetDebt/FCF SD 10yr' : "setup.ndFcf.10stdev",

    'CapitalLeases/Debt' : "stockdata.0.cap_lease_debt",

    'CAPEX/Sales%' : "stockdata.0.capex_sales",
    'CAPEX/Sales% 3yr' : "setup.capex_sales.3yrAvg",
    'CAPEX/Sales% 5yr' : "setup.capex_sales.5yrAvg",
    'CAPEX/Sales% 10yr' : "setup.capex_sales.10yrAvg",
    'CAPEX/Sales% TTM/5yr' : "setup.capex_sales.ttm/5yr",
    'CAPEX/Sales% TTM/10yr' : "setup.capex_sales.ttm/10yr",
    'CAPEX/Sales% SD 5yr' : "setup.capex_sales.5stdev",
    'CAPEX/Sales% SD 10yr' : "setup.capex_sales.10stdev",

    'CAPEX/OwnerEarnings%' : "stockdata.0.capex_ownerEarnings",
    'CAPEX/OwnerEarnings% 3yr' : "setup.capex_ownerEarnings.3yrAvg",
    'CAPEX/OwnerEarnings% 5yr' : "setup.capex_ownerEarnings.5yrAvg",
    'CAPEX/OwnerEarnings% 10yr' : "setup.capex_ownerEarnings.10yrAvg",
    'CAPEX/OwnerEarnings% TTM/5yr' : "setup.capex_ownerEarnings.ttm/5yr",
    'CAPEX/OwnerEarnings% TTM/10yr' : "setup.capex_ownerEarnings.ttm/10yr",
    'CAPEX/OwnerEarnings% SD 5yr' : "setup.capex_ownerEarnings.5stdev",
    'CAPEX/OwnerEarnings% SD 10yr' : "setup.capex_ownerEarnings.10stdev",

    'CAPEX/FCF%' : "stockdata.0.capex_fcf",
    'CAPEX/FCF% 3yr' : "setup.capex_fcf.3yrAvg",
    'CAPEX/FCF% 5yr' : "setup.capex_fcf.5yrAvg",
    'CAPEX/FCF% 10yr' : "setup.capex_fcf.10yrAvg",
    'CAPEX/FCF% TTM/5yr' : "setup.capex_fcf.ttm/5yr",
    'CAPEX/FCF% TTM/10yr' : "setup.capex_fcf.ttm/10yr",
    'CAPEX/FCF% SD 5yr' : "setup.capex_fcf.5stdev",
    'CAPEX/FCF% SD 10yr' : "setup.capex_fcf.10stdev",

    'FCF/Net Income%' : "stockdata.0.fcfNetIncome",
    'FCF/Net Income% 3yr' : "setup.fcfNetIncome.3yrAvg",
    'FCF/Net Income% 5yr' : "setup.fcfNetIncome.5yrAvg",
    'FCF/Net Income% 10yr' : "setup.fcfNetIncome.10yrAvg",
    'FCF/Net Income% TTM/5yr' : "setup.fcfNetIncome.ttm/5yr",
    'FCF/Net Income% TTM/10yr' : "setup.fcfNetIncome.ttm/10yr",
    'FCF/Net Income% SD 5yr' : "setup.fcfNetIncome.5stdev",
    'FCF/Net Income% SD 10yr' : "setup.fcfNetIncome.10stdev",

    'FCF/OwnerEarning%' : "stockdata.0.fcfOwnerEarnings",
    'FCF/OwnerEarning% 3yr' : "setup.fcfOwnerEarnings.3yrAvg",
    'FCF/OwnerEarning% 5yr' : "setup.fcfOwnerEarnings.5yrAvg",
    'FCF/OwnerEarning% 10yr' : "setup.fcfOwnerEarnings.10yrAvg",
    'FCF/OwnerEarning% TTM/5yr' : "setup.fcfOwnerEarnings.ttm/5yr",
    'FCF/OwnerEarning% TTM/10yr' : "setup.fcfOwnerEarnings.ttm/10yr",
    'FCF/OwnerEarning% SD 5yr' : "setup.fcfOwnerEarnings.5stdev",
    'FCF/OwnerEarning% SD 10yr' : "setup.fcfOwnerEarnings.10stdev",

    'Cash Conversion Cycle' : "stockdata.0.cash_conversion_cycle",
    'Cash Conversion Cycle 3yr' : "setup.cash_conversion_cycle.3yrAvg",
    'Cash Conversion Cycle 5yr' : "setup.cash_conversion_cycle.5yrAvg",
    'Cash Conversion Cycle 10yr' : "setup.cash_conversion_cycle.10yrAvg",
    'Cash Conversion Cycle TTM/5yr' : "setup.cash_conversion_cycle.ttm/5yr",
    'Cash Conversion Cycle TTM/10yr' : "setup.cash_conversion_cycle.ttm/10yr",
    'Cash Conversion Cycle SD 5yr' : "setup.cash_conversion_cycle.5stdev",
    'Cash Conversion Cycle SD 10yr' : "setup.cash_conversion_cycle.10stdev",
    
    'Predictability Ranking' : "predictability",
    'Financial Strength' : "financialStrength",

    'Sales 1yr G' : "setup.sales.compGrowth1yr",
    'Sales 3yr G' : "setup.sales.compGrowth3yr",
    'Sales 5yr G' : "setup.sales.compGrowth5yr",
    'Sales 10yr G' : "setup.sales.compGrowth10yr",

    'Sales/Share G' : "setup.salesshare.compGrowth1yr",
    'Sales/Share 3yr G' : "setup.salesshare.compGrowth3yr",
    'Sales/Share 5yr G' : "setup.salesshare.compGrowth5yr",
    'Sales/Share 10yr G' : "setup.salesshare.compGrowth10yr",

    'OwnerEarnings/Share G' : "setup.ownerEarningShare.compGrowth1yr",
    'OwnerEarnings/Share 3yr G' : "setup.ownerEarningShare.compGrowth3yr",
    'OwnerEarnings/Share 5yr G' : "setup.ownerEarningShare.compGrowth5yr",
    'OwnerEarnings/Share 10yr G' : "setup.ownerEarningShare.compGrowth10yr",

    'FCF/Share G' : "setup.fcfShare.compGrowth1yr",
    'FCF/Share 3yr G' : "setup.fcfShare.compGrowth3yr",
    'FCF/Share 5yr G' : "setup.fcfShare.compGrowth5yr",
    'FCF/Share 10yr G' : "setup.fcfShare.compGrowth10yr",

    'aEBITDA/Share G' : "setup.aebitdaShare.compGrowth1yr",
    'aEBITDA/Share 3yr G' : "setup.aebitdaShare.compGrowth3yr",
    'aEBITDA/Share 5yr G' : "setup.aebitdaShare.compGrowth5yr",
    'aEBITDA/Share 10yr G' : "setup.aebitdaShare.compGrowth10yr",

    'Dividend/Share G' : "setup.dividendShare.compGrowth1yr",
    'Dividend/Share 3yr G' : "setup.dividendShare.compGrowth3yr",
    'Dividend/Share 5yr G' : "setup.dividendShare.compGrowth5yr",
    'Dividend/Share 10yr G' : "setup.dividendShare.compGrowth10yr",

    'Price 1yr G' : "setup.price.compGrowth1yr",
    'Price 3yr G' : "setup.price.compGrowth3yr",
    'Price 5yr G' : "setup.price.compGrowth5yr",
    'Price 10yr G' : "setup.price.compGrowth10yr",

    'SGR' : "stockdata.0.sgr",
    'SGR 3yr' : "setup.sgr.3yrAvg",
    'SGR 5yr' : "setup.sgr.5yrAvg",
    'SGR 10yr' : "setup.sgr.10yrAvg",
    'SGR TTM/5yr' : "setup.sgr.ttm/5yr",
    'SGR TTM/10yr' : "setup.sgr.ttm/10yr",
    'SGR SD 5yr' : "setup.sgr.5stdev",
    'SGR SD 10yr' : "setup.sgr.10stdev",

    'Forward ROR(Yacktman)%' : "stockdata.0.fror",
    'Expected Annual TR' : "stockdata.0.expected_annual_total_return",

    'BVPS in yr 10' : "calculations.bvpsY10",
    'FCF/Share in yr 10' : "calculations.fcfShareY10",
    'Stock Price yr 10' : "calculations.stockPriceY10",
    'Avg Div Yield 10yr' : "setup.dividendYield.10yrAvg",
    'Projected 10 yr ROR' : "calculations.projected10ror",
    'Total Projected 10 yr ROR' : "calculations.projected10Total",

    'Shares Outstanding' : "stockdata.0.shares_outstanding_format",
    'S/O Change (1Y)(%)' : "soChangePercent_1",
    'S/O Change (3Y)(%)' : "soChangePercent_3",
    'S/O Change (5Y)(%)' : "soChangePercent_5",
    'S/O Change (10Y)(%)' : "soChangePercent_10",
    
    'Dividend Payout Ratio%' : "stockdata.0.dividendPayoutRatio",
    'Dividend Payout Ratio% 3yr' : "setup.dividendPayoutRatio.3yrAvg",
    'Dividend Payout Ratio% 5yr' : "setup.dividendPayoutRatio.5yrAvg",
    'Dividend Payout Ratio% 10yr' : "setup.dividendPayoutRatio.10yrAvg",
    'Dividend Payout Ratio% TTM/5yr' : "setup.dividendPayoutRatio.ttm/5yr",
    'Dividend Payout Ratio% TTM/10yr' : "setup.dividendPayoutRatio.ttm/10yr",
    'Dividend Payout Ratio% SD 5yr' : "setup.dividendPayoutRatio.5stdev",
    'Dividend Payout Ratio% SD 10yr' : "setup.dividendPayoutRatio.10stdev",

    'CF Re-Investment Rate 5yr' : "setup.cashflow_reinvestment_rate.5yrAvg",

    'EV/FCF' : "stockdata.0.evFcf",
    'EV/FCF 3yr' : "setup.evFcf.3yrAvg",
    'EV/FCF 5yr' : "setup.evFcf.5yrAvg",
    'EV/FCF 10yr' : "setup.evFcf.10yrAvg",
    'EV/FCF TTM/5yr' : "setup.evFcf.ttm/5yr",
    'EV/FCF TTM/10yr' : "setup.evFcf.ttm/10yr",
    'EV/FCF SD 5yr' : "setup.evFcf.5stdev",
    'EV/FCF SD 10yr' : "setup.evFcf.10stdev",

    'FCF Yield' : "stockdata.0.fcfYield",
    'FCF Yield 3yr' : "setup.fcfYield.3yrAvg",
    'FCF Yield 5yr' : "setup.fcfYield.5yrAvg",
    'FCF Yield 10yr' : "setup.fcfYield.10yrAvg",
    'FCF Yield TTM/5yr' : "setup.fcfYield.ttm/5yr",
    'FCF Yield TTM/10yr' : "setup.fcfYield.ttm/10yr",
    'FCF Yield SD 5yr' : "setup.fcfYield.5stdev",
    'FCF Yield SD 10yr' : "setup.fcfYield.10stdev",

    'Rule of 40' : "calculations.rule_of_40",

    'FCF Spice' : "stockdata.0.fcfSpice",
    'FCF Spice 3yr' : "setup.fcfSpice.3yrAvg",
    'FCF Spice 5yr' : "setup.fcfSpice.5yrAvg",
    'FCF Spice 10yr' : "setup.fcfSpice.10yrAvg",
    'FCF Spice TTM/5yr' : "setup.fcfSpice.ttm/5yr",
    'FCF Spice TTM/10yr' : "setup.fcfSpice.ttm/10yr",
    'FCF Spice SD 5yr' : "setup.fcfSpice.5stdev",
    'FCF Spice SD 10yr' : "setup.fcfSpice.10stdev",

    'aEBITDA Spice' : "stockdata.0.aebitda_spice",
    'ROE Spice' : "stockdata.0.roe_spice",

    'URBEM VALUE' : "stockdata.0.urbem_value",
    'URBEM VALUE 3y' : "stockdata.3.urbem_value",
    'URBEM VALUE 5y' : "stockdata.5.urbem_value",

    'FCF/Employees' : "stockdata.0.fcfEmployee",
    'FCF/Employees 3yr' : "setup.fcfEmployee.3yrAvg",
    'FCF/Employees 5yr' : "setup.fcfEmployee.5yrAvg",
    'FCF/Employees 10yr' : "setup.fcfEmployee.10yrAvg",

    'Purchase of Business' : "stockdata.0.purchase_of_business",
    'Purchase of Business 3yr' : "setup.purchase_of_business.3yrAvg",
    'Purchase of Business 5yr' : "setup.purchase_of_business.5yrAvg",
    'Purchase of Business 10yr' : "setup.purchase_of_business.10yrAvg",
  };
  try{
      let splitString = keyvalues[column].split('.');
      if(keyvalues[column].split('.').length == 1){
          return { symbol: data.symbol, value: (''+data[keyvalues[column]]).replace(/[^a-z0-9,.\- ]/gi, '') };
      }
      else if (splitString[0] == 'stockdata'){
          return { symbol: data.symbol, value: (''+data[splitString[0]][0][splitString[1]]).replace(/[^a-z0-9,.\- ]/gi, '')};
      }
      else if(splitString[0] === 'setup'){
          return { symbol: data.symbol, value: ('' + data['setup'][splitString[1]][splitString[2]])}
      }
      else if(splitString[0] === 'calculations'){
        return { symbol: data.symbol, value: ('' + data['calculations'][splitString[1]])}
      }
      else{
          // let dcf = data[splitString[0]][splitString[1]].replace(/[^a-z0-9,. ]/gi, '');      
          return { symbol: data.symbol, value: data[splitString[0]][splitString[1]]};
      }
  }
  catch(e){
      return {error : column};
  }   
}

/**
* Edits the aggreagtions stored in the database
* @param {JSON} data - Original Aggregate Settings
* @param {JSON} result - User Input
*/
function editAggregations(data, result) {
  let to_send = {};
  let selected = '';
  for (let i in data) {
      if (result.value.trim() === data[i].aggregate_string.trim()) {
          selected = result.value.trim();
          break;
      }
  }
  console.log(`|${selected}|`)
  fetch("/aggregation?action=get_single", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aggregationString: selected })
  })
      .then(response => response.json())
      .then(data => {
          Swal.fire({
              title: 'Edit',
              showCancelButton: 'true',
              html: `
          <div class="row">
              <div class="col">
                  <label for="nameform">Name</label>
                  <input id="nameForm" type="text" class="form-control" value="${data[0].name}" readonly="readonly">
              </div>
          </div>
          <div class="row">
              <div class="col">
                  <label>Columns</label>
              </div>
          </div>
          <div class="row">
              <div class="col">
                  <label>Add [ !] At The End For greatest to least</label>
              </div>
          </div>
          ${SWAL_AggregationStringSet(data[0].aggregate_string.split(', '))}
          ${createColumnList()}
          `
          }).then((result) => {
              if (!result.dismiss) {
                  to_send.name = document.getElementById('nameForm').value;
                  to_send.columns = [];
                  for (let i of 10) {
                      if (document.getElementById(`columnForm${i + 1}`).value != "") {
                          to_send.columns.push(document.getElementById(`columnForm${i + 1}`).value);
                      }
                  }
                  fetch('/aggregation?action=edit', {
                      method: 'POST',
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(to_send)
                  }).then(response => response.json())
                      .then(data => {
                          console.log(data);
                      });
              }
          });
      });

  /**
   * Creates the custom sweetalert string for the original aggregate settings
   * @param {String} aggregate_string - comma seperated string
   */
  function SWAL_AggregationStringSet(aggregate_string) {
      let div_string = '';
      for (let i = 0; i < 10; i++) {
          if (aggregate_string[i]) {
              if (i % 2 == 0) {
                  div_string = div_string + `
                      <div class="row mt-3">
                          <div class="col">
                          <input id="columnForm${i + 1}" type="text" list="columnList" class="form-control" value="${aggregate_string[i]}">
                          </div>`;
              }
              else if (i % 2 == 1) {
                  div_string = div_string + `
                      <div class="col">
                      <input id="columnForm${i + 1}" type="text" list="columnList" class="form-control" value="${aggregate_string[i]}">
                      </div>
                  </div>`;
              }
          }
          else {
              if (i % 2 == 0) {
                  div_string = div_string + `
                      <div class="row mt-3">
                          <div class="col">
                          <input id="columnForm${i + 1}" type="text" list="columnList" class="form-control">
                          </div>`;
              }
              else if (i % 2 == 1) {
                  div_string = div_string + `
                  <div class="col">
                  <input id="columnForm${i + 1}" type="text" list="columnList" class="form-control">
                  </div>
              </div>`;
              }
          }

      }
      return (div_string);
  }
}

/**
* Deletes aggregation settings stored in the database
* @param {*} data - yes
* @param {*} result - User Input
*/
function deleteAggregations(data, result) {
  let to_send = {};
  let selected = '';
  for (let i in data) {
      if (result.value == data[i].aggregate_string) {
          selected = data[i].aggregation_id;
          break;
      }
  }
  fetch("/aggregation?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delete: selected })
  })
      .then(response => response.json())
      .then(data => {
          console.log('success');
      });
}