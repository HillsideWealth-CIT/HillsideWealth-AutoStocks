// console.log(dbdata)

$(document).ready(function(){
Initialize_table();

})

function Initialize_table(){
    ajax_Call("init_user", "/init_table").then((resolve) => {
        console.log(resolve.data)
        fill_table(resolve.data)
    })
}
function fill_table(data){
    $('#datatable').DataTable({
        processing: true,
        data: data,
        columns: column_builder(),
    });
}

function column_builder(){
    let columns = [
        {data: 'symbol'},
        {data: 'stock_name'},
        {data: 'stockdata.0'}
    ]
    return columns
}

/**
 * The ajax function used to send info to the server and accept responses
 * @param {String} action - What the server will do with the request
 * @param {String} id - The Primary key of the stock for the database
 * @param {JSON} userInput - What the user inputs into the app
 */
function ajax_Call(action, link) {
    return new Promise((resolve, reject) => {
        var data = {};
        data.action = action;
        $.ajax({
            type: "POST",
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: link,
        }).done(function (returned_data) {
            resolve(returned_data);
        })
    })
}