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
          $table.cell({ row: index, column: columnNum }).data(data.score[stockIndex]).invalidate();
      });
      $table.draw();
  });

}

//format aggregation data
function FAD(data, column) {
  let keyvalues = {
      'Symbol': 'symbol',
      'Stock Name': 'stock_name',
      'Market Cap (M)': 'stockdata market_cap_format',
      'Sector': 'stocksector',
      'aEBITDA Spice': 'stockdata aebitda_spice',
      'Current Price': 'stock_current_price',
      'Value Conditions': 'valueConditions',
      'Yield': 'stockdata yield_format',
      'Comment': 'note',
      'Emoticon': 'emoticon',
      'Categories': 'categories',

      'Date': 'stockdata datestring',
      'Shares Outstanding(M)': 'stockdata shares_outstanding_format',
      'Enterprise Value(M)': 'stockdata enterprise_value_format',
      'Revenue(M)': 'stockdata revenue_format',
      'aEBITDA(M)': 'stockdata aebitda_format',
      'aEBITDA/Share': 'stockdata aeXsho_format',
      'aEBITDA%': 'stockdata aebitda_percent',
      'Asset Turn': 'stockdata asset_turnover',
      'aEBITDA AT': 'stockdata aebitda_at',
      'EV/aEBITDA': 'stockdata ev_aebita',
      'Net Debt(M)': 'stockdata net_debt_format',
      'ND/aEBITDA': 'stockdata nd_aebitda',
      'ROE': 'stockdata roe_format',
      'ROE Spice': 'stockdata roe_spice',
      'Effective Tax Rate': 'stockdata effective_tax_rate',

      'Guru Rating': 'gfrating',
      'JDV Rating': 'jdv',
      'MS Moat Rating': 'moat',
      'MS FV Est': 'fairvalue',
      'MS 5* Price': 'fivestar',
      'MS 1* Price': 'onestar',

      'EPS': 'stockdata eps_without_nri_string_format',
      'Growth Years': 'stockdata growth_years_format',
      'Growth % 5Y': 'growth_rate_5y',
      'Growth % 10Y': 'growth_rate_10y',
      'Growth % 15Y': 'growth_rate_15y',
      'terminalyears': 'stockdata terminal_years_format',
      'Terminal Growth %': 'stockdata terminal_growth_rate_string_format',
      'Discount Rate': 'stockdata discount_rate_string_format',
      'Growth Value 5Y': 'dcf_values_5y growth_value',
      'Terminal Value 5Y': 'dcf_values_5y terminal_value',
      'DCF Fair Value 5Y': 'dcf_values_5y fair_value',
      'Growth Value 10Y': 'dcf_values_10y growth_value',
      'Terminal Value 10Y': 'dcf_values_10y terminal_value',
      'DCF Fair Value 10Y': 'dcf_values_10y fair_value',
      'Growth Value 15Y': 'dcf_values_15y growth_value',
      'Terminal Value 15Y': 'dcf_values_15y terminal_value',
      'DCF Fair Value 15Y': 'dcf_values_15y fair_value',

      'FCF (M)': 'stockdata fcf_format',
      'FCF Yield': 'stockdata fcf_yield',
      'FCF Growth(1Y)': 'fcf_growth_1',
      'FCF Growth(3Y)': 'fcf_growth_3',
      'FCF Growth(5Y)': 'fcf_growth_5',
      'FCF Growth(10Y)': 'fcf_growth_10',

      'Capex (M)': 'stockdata capex',
      'Capex/FCF 5Y': 'capeXfcfAverage5',
      'Capex/FCF 10Y': 'capeXfcfAverage10',
      'Capex/aEBITDA': 'stockdata capeXae_format',
      'Capex/aEBITDA 5Y': 'capeXaeAverage5',
      'Capex/aEBITDA 10Y': 'capeXaeAverage10',

      'FCF/aEBITDA': 'stockdata fcfXae_format',
      'Price Growth (1y)': 'price_growth_1',
      'Price Growth (3y)': 'price_growth_3',
      'Price Growth (5y)': 'price_growth_5',
      'Price Growth (10y)': 'price_growth_10',
      'S/O Change (1Y)(M)': 'so_change_1',
      'S/O Change (3Y)(M)': 'so_change_3',
      'S/O Change (5Y)(M)': 'so_change_5',
      'S/O Change (10Y)(M)': 'so_change_10',
      'S/O Change (1Y)(%)': 'soChangePercent_1',
      'S/O Change (3Y)(%)': 'soChangePercent_3',
      'S/O Change (5Y)(%)': 'soChangePercent_5',
      'S/O Change (10Y)(%)': 'soChangePercent_10',
      'Revenue Growth (1Y)': 'revenue_growth_1',
      'Revenue Growth (3Y)': 'revenue_growth_3',
      'Revenue Growth (5Y)': 'revenue_growth_5',
      'Revenue Growth (10Y)': 'revenue_growth_10',
      'aEBITDA Growth(1Y)': 'aebitda_growth_1',
      'aEBITDA Growth(3Y)': 'aebitda_growth_3',
      'aEBITDA Growth(5Y)': 'aebitda_growth_5',
      'aEBITDA Growth(10Y)': 'aebitda_growth_10',
      'ROIC %': 'stockdata roic_format',
      'WACC %': 'stockdata wacc_format',
      'ROIC-WACC': 'stockdata roicwacc_format',
  };
  try{
      let splitString = keyvalues[column].split(' ');
      if(keyvalues[column].split(' ').length == 1){
          return { symbol: data.symbol, value: (''+data[keyvalues[column]]).replace(/[^a-z0-9,.\- ]/gi, '') };
      }
      else if (splitString[0] == 'stockdata'){
          return { symbol: data.symbol, value: (''+data[splitString[0]][0][splitString[1]]).replace(/[^a-z0-9,.\- ]/gi, '')};
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