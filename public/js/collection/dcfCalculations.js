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
function calc_menu(eps, gr5, gr10, gr15, tgr, dr, gy, ty, fv) {
  return new Promise((resolve, reject) => {
      let user_input = {};
      swal.fire({
          title: 'DCF INPUTS',
          showConfirmButton: true,
          html:
              `<div class="row">
                  <div class="col">
                      <label for="eps_form">EPS ($)</label>
                      <input id="eps_form" type="text" class="form-control" value="${eps}" oninput="eps_onchange()">
                  </div>
                  <div class="col">
                      <label for="gr_form">Growth Rate (%)</label>
                      <input id="gr_form" list="gr_list" type="text" class="form-control" placeholder="press y for years" oninput="eps_onchange(${gr5}, ${gr10}, ${gr15})">
                      <datalist id="gr_list">
                          <option value="years 5">
                          <option value="years 10">
                          <option value="years 15">
                      </datalist>
                      
                  </div>        
              </div>
              <div class="row">
                  <div class="col">
                      <label for="tgr_form">Terminal Growth Rate (%)</label>
                      <input id="tgr_form" type="text" class="form-control" value="${tgr * 100}" oninput="eps_onchange()">
                  </div>
                  <div class="col">
                      <label for="dr_form">Discount Rate(%)</label>
                      <input id="dr_form" type="text" class="form-control" value="${dr * 100}" oninput="eps_onchange()">
                  </div>        
              </div>
              <div class="row">
                  <div class="col">
                      <label for="gy_form">Growth Years</label>
                      <input id="gy_form" id="eps_form" type="text" class="form-control" value="${gy}" oninput="eps_onchange()">
                  </div>
                  <div class="col">
                      <label for="ty_form">Terminal Years</label>
                      <input id="ty_form" type="text" class="form-control" value="${ty}" oninput="eps_onchange()">
                  </div>        
              </div>

              <div class="row">
                  <div class="col">
                      <label for="gv_form">Growth Value</label>
                      <input id="gv_form" type="text" class="form-control" value="${fv.growth_value}" readonly>
                  </div>
                  <div class="col">
                      <label for="tv_form">Terminal Value</label>
                      <input id="tv_form" type="text" class="form-control" value="${fv.terminal_value}" readonly>
                  </div>
                  <div class="col">
                      <label for="fv_form">Fair Value</label>
                      <input id="fv_form" type="text" class="form-control" value="${fv.fair_value}" readonly>
                  </div>           
              </div>

              <div class="row">
                  <div class="col">
                      <label for="gv_form">Average</label>
                      <input id="gv_form" type="text" class="form-control" value="${dfcAverage([gr5, gr10, gr15])}" readonly>
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
function open_calc(eps, gr5, gr10, gr15, tgr, dr, gy, ty) {
  // console.log(`${eps} ${gr5} ${gr10} ${gr15} ${tgr} ${dr} ${gy} ${ty} `)
  let fv = dcf(eps, Math.round((gr5.replace(/[^a-z0-9,. ]/gi, '') / 100) * 100000) / 100000, tgr, dr, gy, ty);
  // console.log(fv)
  calc_menu(eps, gr5.replace(/[^a-z0-9,. ]/gi, ''), gr10.replace(/[^a-z0-9,. ]/gi, ''), gr15.replace(/[^a-z0-9,. ]/gi, ''), tgr, dr, gy, ty, fv);
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
  let arr = ['tgr', 'dr', 'gy', 'ty'];
  return new Promise((resolve) => {
      swal.fire({
          title: 'DCF INPUTS',
          showConfirmButton: true,
          showCancelButton: true,
          html:
              `
          <div class="row">
              <p class="col">*EMPTY FIELDS WILL BE TREATED AS 5</p>
          </div>
          <div class="row">
              <div class="col">
                  <label for="tgr_form">Terminal Growth Rate (%)</label>
                  <input id="tgr_form" type="text" class="form-control" value="4">
              </div>
              <div class="col">
                  <label for="dr_form">Discount Rate(%)</label>
                  <input id="dr_form" type="text" class="form-control" value="12">
              </div>        
          </div>
          <div class="row">
              <div class="col">
                  <label for="gy_form">Growth Years</label>
                  <input id="gy_form" id="eps_form" type="text" class="form-control" value="10">
              </div>
              <div class="col">
                  <label for="ty_form">Terminal Years</label>
                  <input id="ty_form" type="text" class="form-control" value="10">
              </div>        
          </div>
          `,
      }).then((result) => {
          if (!result.dismiss) {
              // values.tgr = document.getElementById('tgr_form').value / 100;
              // values.dr = document.getElementById('dr_form').value / 100;
              // values.gy = document.getElementById('gy_form').value;
              // values.ty = document.getElementById('ty_form').value;
              for (let i in arr) {
                  if (document.getElementById(`${arr[i]}_form`).value.length != 0) {
                      values[arr[i]] = document.getElementById(`${arr[i]}_form`).value;
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
