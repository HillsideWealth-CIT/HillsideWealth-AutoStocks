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
    width: '80vw',
    html: `
        <div class="form-group">
        <label for="configName">${(fallback) ? "Create a New Configuration From [Add] or [Switch] to a different Configuration" : "Configuration Name"}</label>
        <input ${(fallback) ? "ReadOnly" : ""} type="text" class="form-control" id="configName" value="${name}">
        <label for="historicalDataConfig"><a href="https://docs.google.com/document/d/1hUCcQ-ukB-1T10g2-iqrcvEhW97S6JUV7f8ubryG84w/edit?usp=sharing">Click Here For Instructions</a></label>
        <textarea
            style="height:25em;"
            id="historicalDataConfig"
            spellcheck="false" 
            type="text" 
            class="form-control"
            ${(fallback) ? "ReadOnly" : ""}
            >${configString.replaceAll(',', ',\r\n')}</textarea>
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
      fetch(`/tableconfig`, {
        method: "POST",
        body: JSON.stringify({
          action: action,
          table: 'custom',
          configString: $("#historicalDataConfig").val().replaceAll(",\n", ","),
          configName: $("#configName").val(),
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

/**
 * Used to switch configurations for the table
 * Refreshes the page when finished
 */
const switch_config = async () => {
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
      action: "switchCustom",
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
  console.log(json)
  if (json.error !== true) {
      let historicData = json.data;
      let configString = json.test.split(',');
      let headers = "";
      let financials = "";
      for (let i of configString) headers += `<th>${i.split('|')[0]}</th>`;
      for (let i = 0; i <= historicData.length; i++) {
          let rowString = '';
          for (let y in historicData[i]) {
              try {
                  rowString += `<td>${historicData[i][y]}</td>`
              }
              catch (e) {
                  break;
              }
          }
          financials += `<tr>${rowString}</tr>`
      }
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
              <button class="btn btn-secondary" onClick="historicalCustomization('${json.test.replaceAll('\n', '')}', '${json.id}', '${json.name}', ${json.fallback})">Customize</button>
              <button class="btn btn-secondary" onClick="switch_config()">Switch</button>
              `
      });
  }
  else {
      historicalCustomization('');
  }
}