/**
 * Used to edit configurations or create new configurations
 * @param {String} configString - Configuration String
 * @param {String} action - Determines what happens on the backend, if edit: will reload the page
 * @param {String} name - Name of the configuration
 * @param {Boolean} fallback - Determines if the configuration is editable
 */
const edit_button = (configString, action, name = "", fallback = false) => {
  swal.fire({
    title: `${(fallback) ? "This Is a Default Example And Cannot Be Edited" : "Historical Edit"}`,
    showConfirmButton: true,
    showCancelButton: true,
    width: '90vw',
    html: `
        <div class="form-group">
        <label for="configName">${(fallback) ? "Create a New Configuration From [Add] or [Switch] to a different Configuration" : "Configuration Name"}</label>
        <input ${(fallback) ? "ReadOnly" : ""} type="text" class="form-control" id="configName" value="${name}">
        <label for="historicalDataConfig"><a href="https://docs.google.com/document/d/1hUCcQ-ukB-1T10g2-iqrcvEhW97S6JUV7f8ubryG84w/edit?usp=sharing">Click Here For Instructions</a></label>
        <div id="historicalDataConfig" class="form-control" style="height:300px; overflow:auto;">
        ${endlessRows("historicalDataConfigTable", configString, fallback)}
        </div>
        ${ (fallback)
          ? ''
          : '<button onClick="createRow()" type="button" style="margin-top: 5px;"  class="btn btn-info">Add Row</button>'
        }
        
        <div>
        `
  }).then((result) => {
    if (result.value) {
      if (fallback) {
        swal.fire({
          type: "error",
          title: "Default Table Cannot be Edited",
          text: "Please Create a New Configuration"
        })
        return
      }
      let data = formatConfigData();
      fetch(`/tableconfig`, {
        method: "POST",
        body: JSON.stringify({
          action: action,
          table: 'custom',
          configString: JSON.stringify(data.configRows),
          configName: data.configName,
          id: id
        }),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }).then(response => response.json())
        .then(data =>{
          if(action === "edit"){
            setTimeout(() => document.location.reload(), 1500)
          }
        })
    }
  })
}

  function endlessRows(id, data, fallback = false){
    console.log(fallback)
    let formatString = '';
    if(data !== ""){
      for(let i in data){
        formatString += `
        <tr>
          <td><input class="form-control" ${(fallback === true) ? 'disabled' : ""} placeholder="HeaderName" type="text" value="${data[i].rowName}"></td>
          <td><input class="form-control" ${(fallback === true) ? 'disabled' : ""} placeholder="Decimal" type="text" value="${data[i].decimal}"></td>
          <td><input class="form-control" ${(fallback === true) ? 'disabled' : ""} placeholder="Sign" type="text" value="${data[i].sign}"></td>
          <td><input class="form-control" ${(fallback === true) ? 'disabled' : ""} placeholder="Columns" type="text" value="${data[i].columns}"></td>
          <td><input class="form-control" ${(fallback === true) ? 'disabled' : ""} placeholder="Equation" type="text" value="${data[i].equation}"></td>
        </tr>
        `
      }
    }
    return(`
      <table>
      <col style="width:10%" />
      <col style="width:8%" />
      <col style="width:8%" />
      <col style="width:37%" />
      <col style="width:37%" />
      <thead>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      </thead>
      <tbody id="${id}">
        ${formatString}
      </tbody>
      </table>
    `)
  }

function formatConfigData(){
  let toSave = {
    configName: $("#configName").val(),
    configRows: []
  };

  $("#historicalDataConfigTable tr").each((i, row) => {
    let rowData = $(row).find('input');
    if(rowData[0].value.length > 0){
      toSave.configRows.push({
        rowName: rowData[0].value,
        decimal: rowData[1].value,
        sign: rowData[2].value,
        columns: rowData[3].value,
        equation: rowData[4].value
      })
    }
  })

  return toSave
}

function createRow(){
  $('#historicalDataConfigTable').append(`
    <tr>
      <td><input class="form-control" placeholder="HeaderName" type="text"></td>>
      <td><input class="form-control" placeholder="Decimal" type="text"></td>
      <td><input class="form-control" placeholder="Sign" type="text"></td>
      <td><input class="form-control" placeholder="Columns" type="text"></td>
      <td><input class="form-control" placeholder="Equation" type="text"></td>
    </tr>
  `)
}

/**
 * Used to switch configurations for the table
 * Refreshes the page when finished
 */
const switch_config = async (action = "switchCustom") => {
  let configList = await fetchConfigs({ action: "getConfigs" });
  const { value: config } = await Swal.fire({
    title: "Config Selection",
    input: "select",
    inputOptions: configList,
    showCancelButton: true,
    inputPlaceholder: "Select a Configuration"
  })
  if (config) {
    let returned = await fetchConfigs({
      action: action,
      id: config
    })
    if (returned.success === true) {
      swal.fire({
        type: 'success',
        title: "Success",
        text: "Page will Now Reload",
        showConfirmButton: false
      });
      setTimeout(() => document.location.reload(), 1500)
    }
  }
}

/**
 * Deletes the currently used configuration
 * Refreshes the page when finished
 */
const delete_config = async (fallback) => {
  if (fallback) {
    swal.fire({
      type: "error",
      title: "Default Table Cannot be Edited",
      text: "Please Create a New Configuration"
    })
    return
  }
  let returned = await fetchConfigs({ action: "delete", id: id })
  if (returned.success === true) {
    swal.fire({
      type: 'success',
      title: "Success",
      text: "Page will Now Reload",
      showConfirmButton: false
    });
    setTimeout(() => document.location.reload(), 1500)
  }

}
/**
 * Fetches Configs
 * @param {Object} data - Object that gets sent to the backend
 */
async function fetchConfigs(data) {
  return new Promise(resolve => {
    fetch("/tableconfig", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    }).then(response => response.json())
      .then(data => { resolve(data) })
  })
}

/**
 * Opens a page that navigates to the gurufocus graph
 * @param {String} symbol - The Stock Symbol
 */
function open_chart(symbol) {
  window.open(`https://www.gurufocus.com/chart/${symbol}`, `_blank`);
  return;
}

/**
 * displays historical data in a sweet alert
 * @param {String} symbol 
 * @param {JSON} stockdata 
 * @param {Integer} years 
 */
async function show_financials(symbol, stock_id) {
  swal.fire({
      type: 'question',
      title: 'Loading Data...',
  })
  let response = await fetch(`/historic?id=${stock_id}`);
  let json = await response.json();
  if (json.error !== true) {
      let configString = JSON.parse(json.test);
      let historicData = json.data;
      let headers = "";
      let financials = "";
      for(let i of configString){
          headers += `<th>${i.rowName}</th>`
      }
      for(let i = 0; i <= historicData.length; i++){
          let rowString = '';
          for(let y in historicData[i]){
              try{
                  rowString += `<td>${historicData[i][y]}</td>`
              }
              catch{
                  break;
              }
             
          }
          financials += `<tr>${rowString}</tr>`
      }
      console.log(configString)
      swal.fire({
          title: `${symbol} Historical Data`,
          showConfirmButton: true,
          width: '90vw',
          html:
              `
              <table class="table table-sm table-bordered table-light table-responsive">
                  <thead class="thead-dark">
                      <tr>
                          <th>Date</th>
                          ${headers}
                      </tr>
                  </thead>
                  ${financials}
              </table>
              <button class="btn btn-secondary" onClick="switch_config('switchHistoric')">Switch</button>
              `
      });
  }
  else {
      historicalCustomization('');
  }
}