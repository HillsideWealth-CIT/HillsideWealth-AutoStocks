const openNotes = async (id, symbol) => {
  let initData = await (await fetch(`/comments/?id=${id}`)).json();
  console.log(initData)
  let cDate = new Date();
  let CurrentDate = `${cDate.getDate()}/${cDate.getMonth() + 1}/${cDate.getFullYear()}`
  swal.fire({
    title: `${symbol} Comments`,
    showConfirmButton: true,
    confirmButtonText: 'Save Changes',
    showCancelButton: true,
    cancelButtonText: 'Back',
    width: '90vw',
    html: `
      <div class="row">
        <div class="col">
          <label for="insideOwnership">Inside Ownership</label>
          <input id="insideOwnership" type="text" class="form-control" value="${initData.inside_ownership !== null ? initData.inside_ownership : "0"}%">
        </div>
        <div class="col">
          <label for="institutionalOwnership">Institutional Ownership</label>
          <input id="institutionalOwnership" type="text" class="form-control" value="${initData.institutional_ownership !== null ? initData.institutional_ownership : "0"}%">
        </div>
        <div class="col">
          <label for="link">
          ${initData.link !== null 
            ? `<a href="${initData.link}">Link to IR Page</a>` 
            : 'Link to IR Page'}
            
          </label>
          <input id="link" type="text" class="form-control" value="${initData.link !== null ? initData.link : ''}">
        </div>
        <div class="col">
          <label for="founderRunBoard">Founder run/Board</label>
          <select id="founderRunBoard" type="text" class="form-control">
            <option selected hidden>${initData.founder_run_board}</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label for="Competitors">Competitors
          <button onClick="createCompetitors()" type="button" style="padding:0px;"  class="btn btn-link btn-sm"><span class="fas fa-plus"></span></button>
          </label>
          <div id="Competitors" class="form-control" style="height:100px; overflow:auto;">
            ${endlessCompetitors("competitors", initData.competitors)}
          </div>
        </div>
        <div class="col">
          <label for="competitivePosition">Competitive position
            <button onClick="createNoteWithDate('${CurrentDate}', '#competativePosition')" type="button" style="padding:0px;"  class="btn btn-link btn-sm"><span class="fas fa-plus"></span></button>
            </label>
          <div id="Competitors" class="form-control" style="height:100px; overflow:auto;">
            ${endlessNotes("competativePosition", initData.competative_position)}
          </div>
        </div>
        <div class="col">
          <label for="moats">Source of Moat
            <button onClick="createMoat('#sourceOfMoats')" type="button" style="padding:0px;"  class="btn btn-link btn-sm"><span class="fas fa-plus"></span></button>
            </label>
          <div id="moats" class="form-control" style="height:100px; overflow:auto;">
            ${endlessMoats('sourceOfMoats', initData.source_of_moats)}
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label for="insider">Insider Activity
            <button type="button" onClick="createNoteWithDate('${CurrentDate}', '#insiderActivity')" style="padding:0px;"  class="btn btn-link btn-sm"><span class="fas fa-plus"></span></button>
          </label>
          <div id="insider" class="form-control" style="height:100px; overflow:auto;">
            ${endlessNotes("insiderActivity", initData.insider_activity)}
          </div>
      </div>
      <div class="col">
        <label for="mgmt">Mgmt Compensation
          <button type="button" onClick="createNoteWithDate('${CurrentDate}', '#mgmtComp')" style="padding:0px;" class="btn btn-link btn-sm"><span class="fas fa-plus"></span></button>
          </label>
          <div id="mgmt" class="form-control" style="height:100px; overflow:auto;">
            ${endlessNotes("mgmtComp", initData.mgmt_comp)}
          </div>
        </div>  
      </div>

      <div class="row">
        <div class="col">
          <label for="funds">Funds Who Own Shares
            <button type="button" onClick="createNoteWithLink('#fundsShares')" style="padding:0px;"  class="btn btn-link btn-sm"><span class="fas fa-plus"></span></button>
          </label>
          <div id="funds" class="form-control" style="height:100px; overflow:auto;">
            ${endlessLinks("fundsShares", initData.funds)}
        </div>
      </div>
      <div class="col">
        <label for="articles">Articles Of Interest
          <button type="button" onClick="createNoteWithLink('#articlesInterest')" style="padding:0px;"  class="btn btn-link btn-sm"><span class="fas fa-plus"></span></button>
          </label>
          <div id="articles" class="form-control" style="height:100px; overflow:auto;">
            ${endlessLinks("articlesInterest", initData.articles)}
          </div>
        </div>  
      </div>
      `})
    .then((result) => {
      if (!result.dismiss) {
        let data = formatData();
        fetch('/comments', {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({action: "set", data: data, id: id})
        })
        .then(response => response.json())
        .then(returnedData => {
          openNotes(id,symbol)
        })
      }
    })

  function endlessNotes(id, data) {
    let formatString = '';
    if(data !== null){
      for(let i in data){
        formatString += `
        <tr>
          <td><input class="form-control" type="text" value="${data[i].note}"></td>
          <td><input class="form-control" type="text" value="${data[i].date}"></td>
        </tr>
        `
      }
    }
    return (`
    <table>
    <col style="width:75%" />
    <col style="width:25%" />
    <thead>
      <tr>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody id="${id}">
      ${formatString}
    </tbody>
  </table>
    `)
  }

  function endlessCompetitors(id, data) {
    let formatString = '';
    if(data !== null){
      for(let i in data){
        formatString += `
        <tr>
          <td><input class="form-control" placeholder="Symbol" type="text" value="${data[i]}"></td>
          <td><a href="https://www.gurufocus.com/chart/${data[i]}" target="_blank"/>GuruFocus Chart</a></td>
      </tr>
        `
      }
    }
    return (`
    <table>
    <col style="width:75%" />
    <col style="width:25%" />
    <thead>
      <tr>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody id="${id}">
      ${formatString}
    </tbody>
  </table>
    `)
  }

  function endlessMoats(id, data) {
    let formatString = '';
    if(data !== null){
      for(let i in data){
        console.log(data[i])
        formatString += `
      <tr>
        <td>
          <select id="moat" type="text" class="form-control">
          <option selected hidden>${data[i].source}</option>
          <option value="Network effect – marketplace">Network effect – marketplace</option>
          <option value="Network effect – data">Network effect – data</option>
          <option value="Network effect - platform">Network effect - platform</option>
          <option value="Cultural – brand">Cultural – brand</option>
          <option value="Cultural – tradition">Cultural – tradition</option>
          <option value="Cost – switching cost">Cost – switching cost</option>
          <option value="Cost – sunk cost">Cost – sunk cost </option>
          <option value="Cost – cost advantage">Cost – cost advantage</option>
          <option value="Resource – intellectual property">Resource – intellectual property</option>
          <option value="Resource – knowledge">Resource – knowledge</option>
          <option value="Resource – regulatory">Resource – regulatory</option>
          <option value="remove">remove</option>
          </select>
        </td>
        <td>
          <select id="moat" type="text" class="form-control">
          <option selected hidden>${data[i].status}</option>
          <option value="Stable">Stable</option>
          <option value="Increasing">Increasing</option>
          <option value="Decreasing">Decreasing</option>
        </select>
        </td>
      </tr>
        `
      }
    }
    return (`
    <table style="width:100%">
    <col style="width:70%" />
    <col style="width:30%" />
    <thead>
      <tr>
        <th></th>
      </tr>
    </thead>
    <tbody id="${id}">
      ${formatString}
    </tbody>
  </table>
    `)
  }

  function endlessLinks(id, data) {
    let formatString = ''
    if(data !== null){
      for(let i in data){
        formatString += `
        <tr>
          <td><input class="form-control" placeholder="Comment" type="text" value="${data[i].note}"></td>
          <td><input class="form-control" placeholder="Link" type="text" value="${data[i].link}"></td>
          <td><a href="${data[i].link}" target="_blank" />Go</a></td>
        </tr>
      `
      }
    }
    return (`
    <table>
    <col style="width:70%" />
    <col style="width:25%" />
    <col style="width:5%" />
    <thead>
      <tr>
        <th></th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody id="${id}">
      ${formatString}
    </tbody>
  </table>
    `)
  }

  //formats data to transfer to server
  function formatData(){
    let toSave = {
      inside_ownership: $("#insideOwnership").val().replace(/[^0-9.-]/g, ""),
      institutional_ownership: $("#institutionalOwnership").val().replace(/[^0-9.-]/g, ""),
      link: $("#link").val(),
      founder_run_board: $("#founderRunBoard").val(),
      competitors: [],
      competative_position: [],
      source_of_moats: [],
      insider_activity: [],
      mgmt_comp: [],
      funds: [],
      articles: [],
    };
    //get Competitors
    $("#competitors tr").each((i, row) => {
      let symbol = $(row).find("input").val();
      if (symbol.length > 0) toSave.competitors.push(symbol)
    });
    //get Competative Position
    $("#competativePosition tr").each((i, row) => {
      if ($(row).find('input')["0"].value.length > 0) {
        toSave.competative_position.push({
          note: $(row).find('input')["0"].value,
          date: $(row).find('input')["1"].value
        })
      }
    });
    //get Moat
    $('#sourceOfMoats tr').each((i, row) => {
      // console.log($(row).find('select')[0].value)
      // console.log($(row).find('select')[1].value)
      // let value = $(row).find("select").val();
      if ($(row).find('select')[0].value !== "remove"){
        toSave.source_of_moats.push({
          source: $(row).find('select')[0].value,
          status: $(row).find('select')[1].value
        })
      }
    });
    //gets insider activity
    $("#insiderActivity tr").each((i, row) => {
      if ($(row).find('input')["0"].value.length > 0) {
        toSave.insider_activity.push({
          note: $(row).find('input')["0"].value,
          date: $(row).find('input')["1"].value
        })
      }
    });
    //gets management comp
    $("#mgmtComp tr").each((i, row) => {
      if ($(row).find('input')["0"].value.length > 0) {
        toSave.mgmt_comp.push({
          note: $(row).find('input')["0"].value,
          date: $(row).find('input')["1"].value
        })
      }
    });
    //gets Funds Shares
    $("#fundsShares tr").each((i, row) => {
      if ($(row).find('input')["0"].value.length > 0) {
        toSave.funds.push({
          note: $(row).find('input')["0"].value,
          link: $(row).find('input')["1"].value
        })
      }
    });
    //gets Articles of Interest
    $("#articlesInterest tr").each((i, row) => {
      if ($(row).find('input')["0"].value.length > 0) {
        toSave.articles.push({
          note: $(row).find('input')["0"].value,
          link: $(row).find('input')["1"].value
        })
      }
    });
    return toSave;
  }
}

function createCompetitors() {
  if($('#competitors > tr').length < 5){
    $('#competitors').append(`
    <tr>
      <td><input class="form-control" placeholder="Symbol" type="text"></td>
      <td>GuruFocus Chart</td>
    </tr>
    `)
  }
}

function createNoteWithDate(currentDate, id) {
  if($(`${id} > tr`).length < 10){
    $(id).append(`
    <tr>
      <td><input class="form-control" type="text"></td>
      <td><input class="form-control" type="text" value="${currentDate}"></td>
    </tr>
    `)
  }
}

function createNoteWithLink(id) {
  if($(`${id} > tr`).length < 10){
  $(id).append(`
  <tr>
    <td><input class="form-control" placeholder="Comment" type="text"></td>
    <td><input class="form-control" placeholder="Link" type="text"></td>
    <td>Go</td>
  </tr>
  `)
  }
}

function createMoat(id) {
  $(id).append(`
  <tr>
    <td>
      <select id="moat" type="text" class="form-control">
      <option value="Network effect – marketplace">Network effect – marketplace</option>
      <option value="Network effect – data">Network effect – data</option>
      <option value="Network effect - platform">Network effect - platform</option>
      <option value="Cultural – brand">Cultural – brand</option>
      <option value="Cultural – tradition">Cultural – tradition</option>
      <option value="Cost – switching cost">Cost – switching cost</option>
      <option value="Cost – sunk cost">Cost – sunk cost </option>
      <option value="Cost – cost advantage">Cost – cost advantage</option>
      <option value="Resource – intellectual property">Resource – intellectual property</option>
      <option value="Resource – knowledge">Resource – knowledge</option>
      <option value="Resource – regulatory">Resource – regulatory</option>
      <option value="remove">remove</option>
      </select>
    </td>
    <td>
      <select id="moat" type="text" class="form-control">
        <option value="Stable">Stable</option>
        <option value="Increasing">Increasing</option>
        <option value="Decreasing">Decreasing</option>
      </select>
    </td>
  </tr>
  `)
}

