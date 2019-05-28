var add_list = [];
var rm_list = [];
/** Adds stock info from the page to the server and opens a sweet alert
    Note: Stock exchange is a required column
 */
function add() {
    $("#myTable1 tbody input:checked").each(function() {
        var cur = $(this).parents("tr:first").data("cur");
        if(cur == "NYSE" || cur == "NAS"){
            var sym = $(this).parents("tr:first").data("val");
        }
        else{
            var sym = `${cur}:`+$(this).parents("tr:first").data("val");
        }
        var sym_commment = document.getElementById(`${$(this).parents("tr:first").data("val")}_comment`).value;
        var sym_company = document.getElementById(`${$(this).parents("tr:first").data("val")}_comment`).dataset.company;
        var sym_exchange = document.getElementById(`${$(this).parents("tr:first").data("val")}_comment`).dataset.ex;
        add_list.push({ "symbol" : sym.toString() , "comment" : sym_commment.toString(), "company": sym_company.toString(), "exchange": sym_exchange.toString()});
        console.log(JSON.stringify(add_list))
});
    ajax_func(add_list, 'Append')
    Swal.fire({
        position:'center',
        type: 'success',
        title: 'The selected stocks are currently being added!',
        text: 'The page will reload shortly.',
        showConfirmButton: false,
    });
};
/** Adds stock info from the page to the server and opens a sweet alert */
function rm() {
    $("#myTable2 tbody input:checked").each(function() {
        var sym = $(this).parents("tr:first").data("val");
        rm_list.push({"symbol" : sym.toString()});
        $(`#${sym.toString()}`).remove();
    });
    ajax_func(rm_list, 'Remove');
    Swal.fire({
        position:'center',
        type: 'success',
        title: 'The selected stocks are currently being removed!',
        text: 'The page will reload shortly.',
        showConfirmButton: false,
    });
};
/**
* Accepts list of stock symbols, does a gurufocus search on them, and returns a list of objects with stock data.
* @param {Array} list List of stock symbols
* @param {Boolean} summary_call Whether summary call should be used.
*/
function ajax_func(list, action){
    var data = {};
    data.stocks = list;
    data.action = action;
    console.log(data)
    $.ajax({
        type:"POST",
        data:JSON.stringify(data),
        contentType: 'application/json',
        url:"/upload",
    }).done(function(returned_data){
        location.reload()
    });
}
