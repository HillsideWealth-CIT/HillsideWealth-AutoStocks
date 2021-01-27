let $table;
let headerInfo = [];
let config_string;
let id;
let configName;
let fallback;

console.log(window.location.href)

/**
 * Initializes table
 * Defaults to a premade table if user does not have one
 */
const Initialize_table = async () => {
  let stockdb = await fetchData();
  console.log(stockdb);
  if (!stockdb.error) {
    config_string = stockdb.config_string;
    id = stockdb.id;
    configName = stockdb.name;
    fallback = stockdb.fallback;
    console.log(fallback)
    setTableHeader(stockdb.data[0].stock_data)
    $table = fill_table(stockdb.data);
  }
}

/**
 * Fetches Initial table data from the server
 * @returns {Promise Object} - Initial Server Data
 */
const fetchData = () => {
  return new Promise((resolve, reject) => {
    fetch(initLink, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "init_custom" })
    }).then(response => response.json())
      .then(data => {
        resolve(data)
      });
  })
}

/**
 * Creates Table headers using key-value pairs
 * @param {Object} obj - Object Keys used to create table header
 */
const setTableHeader = (obj) => {
  $(`<th>Symbol</th>`).appendTo("#headerRow");
  $(`<th>${configName} - (${tableType})</th>`).appendTo("#headerRow");
  $(`<th>Buttons</th>`).appendTo("#headerRow");
  for (let [key] of Object.entries(obj)) {
    // console.log(key)
    headerInfo.push(key);
    $(`<th>${key}</th>`).appendTo("#headerRow")
  }
}

/**
 * Creates a datatable then Fills the table with JSON data
 * Link to Library: Datatables.net
 * @param {JSON} data - Database Data
 * @returns {object} Datatable
 */
const fill_table = (data) => {
  let datatable = $("#datatable").DataTable({
    processing: true,
    data: data,
    dom: 'Bfrtip',
    rowId: `stock_id`,
    select: { selector: 'td:first-child', style: 'multi' },
    buttons: button_builder(),
    columns: column_builder(),
    fixedColumns: { leftColumns: 2 },
    scrollX: true,
    scrollY: '70vh',
    deferRender: true,
    scroller: true,
    colReorder: { realtime: false },
    columnDefs: {
      type: 'natural', targets: '_all'
    }
  })
  return datatable;
}

/**
 * Builds the column array for the table
 * @returns {List}
 */
const column_builder = () => {
  //check
  let columns = [
    { data: "symbol" },
    { data: "stock_name" },
    { data : null,
      orderable : false,
      className: 'setting_cell',
      render: function( data, type, row, meta){
          // Edit Buttons: 
          // 1: Saves comments and links
          // 2: View Key Stats
          // 3: Open Gurufocus Chart
          // 4: Opens DFC calculator
          // 5: 15 Year historical Financial Data
          
          return `
          <div>
              <button type="button" onclick='openNotes("${row.stock_id}", "${row.symbol}")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>
              <button type="button" onclick='open_chart("${row.symbol}")' class="btn btn-link btn-sm"><span class="fas fa-chart-line"></span></button>
              <button type="button" onclick='show_financials("${row.symbol}", "${row.stock_id}")' class="btn btn-link btn-sm"><span class="fas fa-history"></span></button>
          </div>
          `;
      }    
    },
  ]
  headerInfo.forEach(value => {
    columns.push({ data: `stock_data.${value}` })
  })
  return columns;
}

/**
 * Builds the button array for the table
 * @returns {list}
 */
const button_builder = () => {
  return [
    {
      text: 'Edit', className: "btn-sm", action: () => edit_button(config_string, "edit", configName, fallback)
    },
    {
      text: 'Add', className: "btn-sm", action: () => edit_button("", "add")
    },
    {
      text: 'Switch', className: "btn-sm", action: () => switch_config()
    },
    {
      text: 'Delete Config', className: "btn-sm", action: () => delete_config(fallback)
    },
  ]
}

Initialize_table();