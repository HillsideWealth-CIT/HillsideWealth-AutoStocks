/**
 * Opens a menu that calculates dfc's
 * @param {Float} eps 
 * @param {Float} gr5 
 * @param {Float} gr10 
 * @param {Float} gr15 
 * @param {Float} tgr 
 * @param {Float} dr 
 * @param {Float} gy 
 * @param {Float} ty 
 * @param {Float} fv 
 */
function calc_menu(input, output) {
  return new Promise((resolve, reject) => {
      let user_input = {};
      swal.fire({
          title: 'DCF INPUTS',
          showConfirmButton: true,
          html:
              `
              <h5>*Change Values With The DCF Button In The Toolbar</h5>
              <div class="row">
                <div class="col">
                    <label for="growthYears">Growth Years</label>
                    <input disabled id="growthYears" type="text" class="form-control" value="${input.growthYears}">
                </div>
                <div class="col">
                    <label for="terminalMultiple">Terminal Multiple</label>
                    <input disabled id="terminalMultiple" type="text" class="form-control" value="${input.terminalMultiple}">
                </div>
              </div>
              <div class="row">
                <div class="col">
                    <label for="growthRateStart">Growth Rate Start</label>
                    <input disabled id="growthRateStart" type="text" class="form-control" value="${input.growthRateStart}">
                </div>
                <div class="col">
                    <label for="growthRateEnd">Growth Rate End</label>
                    <input disabled id="growthRateEnd" type="text" class="form-control" value="${input.growthRateEnd}">
                </div>
              </div>
              <div class="row">
                <div class="col">
                    <label for="Discount Rate">Discount Rate</label>
                    <input disabled id="Discount Rate" type="text" class="form-control" value="${input.discountRate}">
                </div>
                <div class="col">
                    <label for="fcf">FCF</label>
                    <input disabled id="fcf" type="text" class="form-control" value="${input.fcf}">
                </div>
              </div>

              <div class="row">
                <div class="col">
                    <label for="fv">FV</label>
                    <input disabled id="fv" type="text" class="form-control" value="${output.fv}">
                </div>
                <div class="col">
                    <label for="fvMultiple">FV Multiple</label>
                    <input disabled id="fvMultiple" type="text" class="form-control" value="${output.fvMultiple}">
                </div>
              </div>
              <div class="row">
                <div class="col">
                    <label for="currentMultiple">Current Multiple</label>
                    <input disabled id="currentMultiple" type="text" class="form-control" value="${output.currentMultiple}">
                </div>
                <div class="col">
                    <label for="premiumDiscount">Premium/Discount</label>
                    <input disabled id="premiumDiscount" type="text" class="form-control" value="${output.premiumDiscount}">
                </div>
              </div>
              `,
      });
  });
}

function dfcAverage(arrList) {
  let total = 0;
  let counter = 0;
  let finalString = '';
  for (let i in arrList) {
      if (arrList[i] != 'null') {
          total += parseFloat(arrList[i]);
          counter++;
          finalString = `${finalString} + ${arrList[i]}`;
      }
  }
  return `${finalString.substr(2)} / ${counter} = ${Math.round((total/counter) * 100) / 100}`;
}

/**
* Calculates initial dfc's 
* @param {String} eps 
* @param {String} gr5 
* @param {String} gr10 
* @param {String} gr15 
* @param {String} tgr 
* @param {String} dr 
* @param {String} gy 
* @param {String} ty 
*/
async function open_calc(npv) {
  let response = await fetch(`/dcf?id=${npv}`);
  let json = await response.json();
  calc_menu(json.npv, json.npvoutput);
}

/**
* calculates on input change
* @param {String} gr5 
* @param {String} gr10 
* @param {String} gr15 
*/
function eps_onchange(gr5, gr10, gr15) {
  if (isNaN($('#gr_form').val()) == true) {
      if ($('#gr_form').val() == 'years 5') {
          $('#gr_form').val(gr5);
      }
      else if ($('#gr_form').val() == 'years 10') {
          $('#gr_form').val(gr10);
      }
      else if ($('#gr_form').val() == 'years 15') {
          $('#gr_form').val(gr15);
      }
  }
  dcf_results = dcf(
      $('#eps_form').val(),
      Math.round(($('#gr_form').val() / 100) * 10000) / 10000,
      $('#tgr_form').val() / 100,
      $('#dr_form').val() / 100,
      $('#gy_form').val(),
      $('#ty_form').val(),
  );
  $('#gv_form').val(dcf_results.growth_value);
  $('#tv_form').val(dcf_results.terminal_value);
  $('#fv_form').val(dcf_results.fair_value);
}

/**
* Sends changes for the dfc options to the server
*/
function calc_edit() {

  let stock_id_list = [];
  let selected = $table.rows('.selected').data();
  for (let i in selected) {
      if (selected[i].symbol) {
          stock_id_list.push(selected[i].stock_id);
      }
      else {
          break;
      }
  }
  if (stock_id_list.length != 0) {
      calc_edit_menu().then((values) => {
          let to_send = { stock_id_list: stock_id_list, values: values };
          fetch('/calc_edit', {
              method: 'POST',
              headers: { "Content-Type" : "application/json"},
              body: JSON.stringify(to_send)
          })
          .then(response => response.json)
          .then(data => {
              location.reload();
          });
      });
  }
  else {
      alert("NO ROWS SELECTED");
  }
}

/**
* Opens the calc edit menu
*/
function calc_edit_menu() {
  let values = {};
  let arr = ['growthYears', 'terminalMultiple', 'growthRateStart', 'growthRateEnd', 'discountRate', 'FCF'];
  return new Promise((resolve) => {
      swal.fire({
          title: 'DCF INPUTS',
          showConfirmButton: true,
          showCancelButton: true,
          html:
              `
          <div class="row">
              <p class="col">*Set FCF to 0 for current FCF</p>
          </div>
          <div class="row">
              <div class="col">
                  <label for="growthYears_form">Growth Years</label>
                  <input id="growthYears_form" type="text" class="form-control" value="10">
              </div>
              <div class="col">
                  <label for="terminalMultiple_form">Terminal Multiple</label>
                  <input id="terminalMultiple_form" type="text" class="form-control" value="20">
              </div>        
          </div>
          <div class="row">
              <div class="col">
                  <label for="growthRateStart_form">Growth Rate Start</label>
                  <input id="growthRateStart_form" type="text" class="form-control" value="0.15">
              </div>
              <div class="col">
                  <label for="growthRateEnd_form">Growth Rate End</label>
                  <input id="growthRateEnd_form" type="text" class="form-control" value="0.1">
              </div>        
          </div>
          <div class="row">
              <div class="col">
                  <label for="discountRate_form">Discount Rate</label>
                  <input id="discountRate_form"  type="text" class="form-control" value="0.15">
              </div>
              <div class="col">
                  <label for="FCF_form">FCF</label>
                  <input id="FCF_form"  type="text" class="form-control" value="0">
              </div>
          </div>
          `,
      }).then((result) => {
          if (!result.dismiss) {
              for (let i in arr) {
                  if ($(`#${arr[i]}_form`).val().length != 0) {
                      values[arr[i]] = $(`#${arr[i]}_form`).val();
                  }
                  else {
                      values[arr[i]] = 5;
                  }
              }
              resolve(values);
          }
      });
  });
}

function dcf(eps, growth_rate, terminal_growth, discount_rate, g_years = 10, t_years = 10) {
  // console.log(`${eps} ${growth_rate} ${terminal_growth} ${discount_rate} ${g_years} ${t_years}`)
  let results = {};
  let x = (1 + parseFloat(growth_rate)) / (1 + parseFloat(discount_rate));
  let y = (1 + parseFloat(terminal_growth)) / (1 + parseFloat(discount_rate));
  results.growth_value = dfc_growth(x, parseFloat(eps), g_years);
  results.terminal_value = dcf_terminal(x, y, parseFloat(eps), g_years, t_years);
  results.fair_value = Math.round((results.growth_value + results.terminal_value) * 100) / 100;
  results.growth_value = Math.round((results.growth_value) * 100) / 100;
  results.terminal_value = Math.round((results.terminal_value) * 100) / 100;
  return results;

  /**
   * calculates the growth value
   * @param {float} x - growth rate devided by discount rate
   * @param {float} eps - earnings per share
   * @param {Integer} years 
   * @returns {float} growth_value
   */
  function dfc_growth(x, eps, years) {
      let growth_value = 0;
      //console.log(`X: ${x} ; Y: ${y}`)
      for (let i = 1; i <= years; i++) {
          let pow = Math.pow(x, i);
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
  function dcf_terminal(x, y, eps, g_years, t_years) {
      let terminal_value = 0;
      for (let i = 1; i <= t_years; i++) {
          part1 = Math.pow(x, g_years);
          part2 = Math.pow(y, i);
          terminal_value += part1 * part2 * eps;
      }
      return terminal_value;
  }
}
