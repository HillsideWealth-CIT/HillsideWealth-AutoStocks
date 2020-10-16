var compare_table

$(document).ready(function(){
    compare_table = $("#comparetable").DataTable({
        processing : true,
        dom : 'Bfrtip',
        buttons : button_builder(),
        select : { selector: 'td:first-child', style : 'multi' },
        scrollY : '70vh',
        paging: false,
        columnDefs: [{
            orderable: false,
            className: 'select-checkbox',
            targets: 0
        }],
        order : [[1, 'desc']],
    })
})

function button_builder(){
    let buttons = [
        'selectAll', 'selectNone',
        {text: '<span class="fas fa-plus"></span> Add', className:"btn-sm", action: function(){add();}},
    ]
    return buttons
}

async function add(){
    //[ { symbol: 'AAON', comment: '', company: '', exchange: '' } ]
    let to_add = [];
    let selected = compare_table.rows({selected: true}).data();
    // console.log(selected)
    for(i in selected){
        console.log(selected[i])
        if(selected[i][1]){
            if(selected[i][3] !== 'NAS'){
                to_add.push(`${selected[i][3]}:${selected[i][1]}`)
            }
            else{
                to_add.push(selected[i][1]);
            }
        }
        else{
            break
        }
    }
    console.log(to_add)
    await Swal.fire({
        title: 'Which database do you want to save to?',
        showCancelButton: true,
        html: `
        <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="specialdb">
                <label class="form-check-label" for="checkbox1" style="width: 6em">
                    SpecialDB
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="commondb">
                <label class="form-check-label" for="checkbox2" style="width: 6em">
                    CommonDB
                </label>
            </div>
        `,
        preConfirm: async () => {
            let specialdb = document.getElementById('specialdb').checked;
            let share = document.getElementById('commondb').checked;
            
            Swal.fire({
                position:'center',
                type: 'question',
                title: 'The selected stocks are currently being updated!',
                text: `Progress: ${0}/${to_add.length}`,
                footer: 'This might take a while, you might want to do something else',
                showConfirmButton: false,
            });

            for(let i in to_add){
                swal.update({ text: `Progress: ${Number(i)+1}/${to_add.length} - Current: ${to_add[i]}` });
                await ajax_request(to_add[i], `/append?share=${share}&placeholder=${specialdb}`)
            }
            Swal.update({
                type: 'success',
                text: 'Update Complete'
            });
            setTimeout(function () {
                Swal.close();
            }, 3000);
            return
        }
    });
    
    function ajax_request(stock, link){
        return $.ajax({
            type: 'POST',
            url: link,
            data: {action: [{
                'symbol': stock,
                'comment': '',
                'company':'',
                'exchange': ''}]},
            success: function(stockinfo){
                console.log(stockinfo)
            }
        })
    }

    // adder_ajax(0, to_add.length, to_add, '/append')
}

function adder_ajax(active_num, end_num, list, link){
    swal.update({text: `Progress: ${active_num}/${end_num}`})
    if (active_num == end_num){
        Swal.update({
            type:'success',
            text: 'Update Complete'
        })
        setTimeout(function(){
            Swal.close();
        }, 3000)
        return
    };
    $.ajax({
        type: 'POST',
        url: link,
        data: {action: [{'symbol': list[active_num].toUpperCase(), 'comment': '', 'company':'', 'exchange': ''}]},
        success: function(stockinfo){
            console.log(stockinfo)
            try{
                // $table.row.add(stockinfo.data[0]).draw();
            }
            catch(e){
                console.log(e)
            }
            adder_ajax(active_num + 1, end_num, list, link)
        }
    })
}
