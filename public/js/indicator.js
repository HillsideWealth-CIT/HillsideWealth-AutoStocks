var $table

document.addEventListener("DOMContentLoaded", function (event) {
    Initialize_table();
})

function Initialize_table() {
    retrieve_data().then(res => {
        console.log(res)
        fill_table(res)
        $table.order([1, 'asc']).draw()
    })
}

function retrieve_data() {
    return new Promise((resolve, reject) => {
        fetch('/indicators/get', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: 'retrieveIndicatorData' })
        })
            .then(response => response.json())
            .then(data => {
                resolve(data)
            })
    })
}

function fill_table(data) {
    $table = $('#datatable').DataTable({
        processing : true,
        data: data,
        scrollX : true,
        scrollY: '70vh',
        deferRendering : true,
        scroller: true,
        rowId: 'indicator_id',
        columns: columnBuilder(),
        dom: 'Brti',
        buttons: button_builder(),
    })
}

function columnBuilder() {
    let columns = [
        { data: "indicators" },
        { data: "leadtime" },
        { data: "months_since_peak" },
        { data: "recession_level" },
        { data: "current_level" },
        {
            data: null,
            orderable: false,
            render: function (data, type, row, meta) {
                return `<button type="button" id="edit${row.indicator_id}" onclick='edit("${row.indicator_id}", "${row.indicators}" , "${row.links}", "${row.leadtime}", "${row.months_since_peak}", "${row.recession_level}", "${row.current_level}", "/indicators/edit")' class="btn btn-link btn-sm"><span class="far fa-edit"></span></button>`
            }
        },
        {
            data: null,
            orderable: false,
            render: function (data, type, row, meta) {
                return `<button type="button" id="open${row.indicator_id}" onclick='openLink("${row.links}")' class="btn btn-link btn-sm"><span class="fas fa-external-link-alt"></span></button>`
            }
        },
        {
            data: null,
            orderable: false,
            render: function (data, type, row, meta) {
                return `<button type="button" id="open${row.indicator_id}" onclick='deleteIndicator("${row.indicator_id}")' class="btn btn-link btn-sm"><span class="fas fa-trash-alt"></span></button>`
            }
        },
    ]
    return columns
}

function button_builder() {
    let buttons = [
        { text: '<span class="fas fa-plus"></span> Add', className: "btn-sm", action: function () { add(); } }
    ]
    return buttons
}

const add = async () => {
    let added = await sweetalert('', '', '', '', '', '', '', '/indicators/append')
    $table.row.add(added[0]).draw();
}

const edit = async(id, indicator, siteLink, leadTime, monthsSince, recessionLevel, currentLevel, link) => {
    let edited = await sweetalert(id, indicator, siteLink, leadTime, monthsSince, recessionLevel, currentLevel, link)
    $table.row(document.getElementById(`${id}`)).data(edited[0]).invalidate();
}

function sweetalert(id, indicator, siteLink, leadTime, monthsSince, recessionLevel, currentLevel, link) {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Test',
            showConfirmButton: true,
            showCancelButton: true,
            html:
                `<div class="row">
                <div class="col">
                    <label for="indicatorInput">Indicator</label>
                    <input id="indicatorInput" type="text" class="form-control" value="${indicator}">
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <label for="linkInput">Link</label>
                    <input id="linkInput" type="text" class="form-control" value="${siteLink}">
                </div>
            </div>  
            <div class="row">
                <div class="col">
                    <label for="leadTimeInput">Median Lead Time of Peak</label>
                    <input id="leadTimeInput" type="text" class="form-control" value="${leadTime}">
                </div>
                <div class="col">
                <label for="monthsSinceInput">Months Since Recent Peak</label>
                <input id="monthsSinceInput" type="text" class="form-control" value="${monthsSince}">
            </div>
            </div>
            <div class="row">
                <div class="col">
                    <label for="recessionLevelInput">Key Recession Level</label>
                    <input id="recessionLevelInput" type="text" class="form-control" value="${recessionLevel}">
                </div>
                <div class="col">
                <label for="currentInput">Current Level</label>
                <input id="currentInput" type="text" class="form-control" value="${currentLevel}">
            </div>
            <div>
            `,
            preConfirm: (userInput) => {
                if (userInput) {
                    let data = {
                        indicator: document.getElementById('indicatorInput').value,
                        link: document.getElementById('linkInput').value,
                        leadTime: document.getElementById('leadTimeInput').value,
                        monthsSince: document.getElementById('monthsSinceInput').value,
                        recessionLevel: document.getElementById('recessionLevelInput').value,
                        currentLevel: document.getElementById('currentInput').value,
                        indicator_id: id
                    }
                    fetch(link, {
                        method: 'POST',
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    })
                        .then(response => response.json())
                        .then(data => {
                            resolve(data)
                        })
                }
            }
        })
    })
}

function openLink(link) {
    window.open(link, `_blank`)
}

function deleteIndicator(id) {
    fetch('/indicators/delete', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indicatorId: id })
    })
        .then(response => response.json())
        .then(data => {
            $table.row(document.getElementById(`${id}`)).remove().draw()
        })
}