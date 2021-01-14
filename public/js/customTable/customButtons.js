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
        <label for="historicalDataConfig">Format:Header|column, Header(Sign)|Column Column| A + B</label>
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