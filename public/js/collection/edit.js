/**
 * Opens a sweet alert for editing certain parameters for a stock
 * @param {Float} symbol 
 * @param {Float} id 
 * @param {Float} comment 
 * @param {Float} emote 
 * @param {Float} ms_1_star 
 * @param {Float} ms_5_star 
 * @param {Float} ms_fv 
 * @param {Float} moat 
 * @param {Float} jdv 
 * @param {Float} price 
 * @param {Float} gf_rating 
 */
function edit_menu(symbol, id, comment, emote, ms_1_star, ms_5_star, ms_fv, moat, jdv, price, gf_rating, ownership, msse, mcap5, mcap10, mcap15, links) {
    // console.log(`${symbol} ${id} ${comment} ${emote} ${ms_1_star} ${ms_5_star} ${ms_fv} ${moat} ${jdv} ${price} ${gf_rating} ${ownership} ${msse} ${mcap5} `)
    // console.log(fill_0(ms_1_star))

    /**
 * Determines if a field is null and fills it with 0
 * @param {String} field
 * @returns {String}
 */
    function fill_0(field) {
        if (field == 'null') {
            return 0;
        }
        else {
            return field;
        }
    }

    let edits = {};
    return new Promise((resolve, reject) => {
        swal.fire({
            title: symbol,
            showConfirmButton: true,
            confirmButtonText: 'Save Changes',
            showCancelButton: true,
            cancelButtonText: 'Back',
            width: '80vw',
            html:
                `<div class="row">
              <div class="col">
                  <label for="jdv">JDV</label>
                  <select id="jdv" class="form-control">
                  <option selected hidden>${fill_0(jdv)}</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
              </select>
              </div>
              <div class="col">
                  <label for="ownership">Ownership %</label>
                  <input id="ownership" type="text" class="form-control" value="${fill_0(ownership)}">
              </div> 
              <div class="col">
                  <label for="emoticon">Emoticon</label>
                  <select id="emote" class="form-control">
                      <option selected hidden>${emote === 'null' ? '---' : emote}</option>
                      <option value="😃">😃</option>
                      <option value="🤑">🤑</option>
                      <option value="😫">😫</option>
                      <option value="💩">💩</option>
                  </select>
              </div> 
              <div class="col">
                  <label for="gfrating">GuruFocus Rating</label>
                  <input id="gfrating" type="text" class="form-control" value="${gf_rating}" readonly>
              </div>
              <div class="col">
                  <label for="cur_price">Current Price</label>
                  <input id="cur_price" type="text" class="form-control" value="${price}">
              </div>      
          </div>

          <div class="row">
              <div class="col">
                  <label for="Comment">Comment</label>
                  <textarea id="Comment" type="text" class="form-control">${comment}</textarea>
              </div>
          </div>
          <div class="row">
          <div class="col">
              <label for="Websites">Websites</label>
              <input id="Websites" placeholder="Format: [Link]|[Title],[Link]" type="text" class="form-control" value="${links === 'null' ? "" : links}">
          </div>
      </div>
          <div>
              <div class="col">
                  <label><b>Maintenance Capex Average</b></label>
              </div>
          </div>
          <div class="row">
              <div class="col">
                  <label for="gfrating">5Y</label>
                  <input id="gfrating" type="text" class="form-control" value="$${fill_0(mcap5 * -1).toLocaleString()}" readonly>
              </div>
              <div class="col">
                  <label for="gfrating">10Y</label>
                  <input id="gfrating" type="text" class="form-control" value="$${fill_0(mcap10 * -1).toLocaleString()}" readonly>
              </div>
              <div class="col">
                  <label for="gfrating">15Y</label>
                  <input id="gfrating" type="text" class="form-control" value="$${fill_0(mcap15 * -1).toLocaleString()}" readonly>
              </div>
          </div>
          `,
        }
        ).then((result) => {
            if (!result.dismiss) {
                edits.id = id;
                edits.ownership = $('#ownership').val().replace(/[^a-z0-9,. ]/gi, '');
                edits.comment = $('#Comment').val()
                edits.emoticon = $('#emote').val();
                edits.jdv = $('#jdv').val();
                edits.price = $('#cur_price').val().replace(/[^a-z0-9,. ]/gi, '');
                edits.msse = $('#ms_stock_exchange').val();
                edits.links = $('#Websites').val();
                resolve(edits);
            }
        });
    });
}

function replaceNewLine(input) {
    var newline = String.fromCharCode(13, 10);
    console.log(input.replaceAll('\\n', newline))
    return input.replaceAll('\\n', newline);
}

/**
* Opens the edit menu then passes data to the server
* @param {String} symbol 
* @param {String} id 
* @param {String} comment 
* @param {String} emote 
* @param {String} ms_1_star 
* @param {String} ms_5_star 
* @param {String} ms_fv 
* @param {String} moat 
* @param {String} jdv 
* @param {String} price 
* @param {String} gf_rating 
*/
function open_edit(symbol, id, comment, emote, ms_1_star, ms_5_star, ms_fv, moat, jdv, price, gf_rating, ownership, msse, mcap5, mcap10, mcap15, links) {
    console.log(comment)
    edit_menu(symbol, id, comment.replaceAll('\n', '&#13;&#10;'), emote, ms_1_star, ms_5_star, ms_fv, moat, jdv, price, gf_rating, ownership, msse, mcap5, mcap10, mcap15, links).then((resolve) => {
        fetch('/edits', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resolve)
        })
            .then(response => response.json())
            .then(data => {
                $table.row(document.getElementById(`${id}`)).data(data.data[0]).invalidate();
            });
    });
}

{/* <div class="row">
<div class="col">
    <label for="ms_1_star">MS 1 Star</label>
    <input id="ms_1_star" type="text" class="form-control" value="${fill_0(ms_1_star)}">
</div>
<div class="col">
    <label for="ms_5_star">MS 5 Star</label>
    <input id="ms_5_star" type="text" class="form-control" value="${fill_0(ms_5_star)}">
</div>    
<div class="col">
    <label for="ms_fair_value">MS Fair Value</label>
    <input id="ms_fair_value" type="text" class="form-control" value="${fill_0(ms_fv)}">
</div>    
<div class="col">
<label for="ms_moat">MS Moat</label>
<select id="ms_moat" type="text" class="form-control">
    <option selected hidden>${moat === 'null' ? '---' : moat}</option>
    <option value="No Moat">No Moat</option>
    <option value="Narrow">Narrow</option>
    <option value="Wide">Wide</option>
</select>
</div>
<div class="col">
<label for="ms_stock_exchange">MS Stock Exchange</label>
<input id="ms_stock_exchange" type="text" class="form-control" value="${msse === 'null' ? '' : msse}">
</div>    
</div> */}