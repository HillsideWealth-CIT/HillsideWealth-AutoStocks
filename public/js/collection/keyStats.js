const open_stats = (stats) => {
    swal.fire({
      title: `KeyStats`,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Back',
      width: "90vw",
      html:`
      <div style="white-space: noWrap;">
        <div class="row">
          <div class="col">
            <label for="stockName">Stock Name</label>
            <input id="stockName" type="text" class="form-control" value="${stats.stockName}" disabled>
          </div>
          <div class="col">
            <label for="symbol">Symbol</label>
            <input id="symbol" type="text" class="form-control" value="${stats.symbol}" disabled>
          </div>
          <div class="col">
            <label for="currentPrice">Current Price</label>
            <input id="currentPrice" type="text" class="form-control" value="${stats.current_price}" disabled>
          </div>
          <div class="col">
            <label for="enterpriseValue">Enterprise Value</label>
            <input id="enterpriseValue" type="text" class="form-control" value="${stats.entVal}" disabled>
          </div>
          <div class="col">
            <label for="fcfSpice">FCF Spice</label>
            <input id="fcfSpice" type="text" class="form-control" value="${stats.fcfSpice}" disabled>
          </div>
          <div class="col">
            <label for="aebitdaSpice">aEBITDA Spice</label>
            <input id="aebitdaSpice" type="text" class="form-control" value="${stats.aebitdaSpice}" disabled>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <label for="evFcf">EV/FCF</label>
            <input id="evFcf" type="text" class="form-control" value="${stats.evFcf}" disabled>
          </div>
          <div class="col">
            <label for="fcfYield">FCF Yield</label>
            <input id="fcfYield" type="text" class="form-control" value="${stats.fcfYield}" disabled>
          </div>
          <div class="col">
            <label for="dividendYield">Dividend Yield</label>
            <input id="dividendYield" type="text" class="form-control" value="${stats.dividendYield}" disabled>
          </div>
          <div class="col">
            <label for="fcfRoic">FCFROIC%</label>
            <input id="fcfRoic" type="text" class="form-control" value="${stats.fcfRoic}" disabled>
          </div>
          <div class="col">
            <label for="fcfRoa">FCFROA%</label>
            <input id="fcfRoa" type="text" class="form-control" value="${stats.fcfRoa}" disabled>
          </div>
          <div class="col">
            <label for="jdv">JDViFCFROiIC% 3yr</label>
            <input id="jdv" type="text" class="form-control" value="${stats.jdv}" disabled>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <label for="grossMargin">Gross Margin%</label>
            <input id="grossMargin" type="text" class="form-control" value="${stats.grossMargin}" disabled>
          </div>
          <div class="col">
            <label for="fcfMargin">FCF Margin%</label>
            <input id="fcfMargin" type="text" class="form-control" value="${stats.fcfMargin}" disabled>
          </div>
          <div class="col">
            <label for="ndFcf">Net Debt/FCF 3yr</label>
            <input id="ndFcf" type="text" class="form-control" value="${stats.ndFcf}" disabled>
          </div>
          <div class="col">
            <label for="capexSales">Capex/Sales</label>
            <input id="capexSales" type="text" class="form-control" value="${stats.capexSales}" disabled>
          </div>
          <div class="col">
            <label for="capexFcf">Capex/FCF</label>
            <input id="capexFcf" type="text" class="form-control" value="${stats.capexFcf}" disabled>
          </div>
          <div class="col">
            <label for="fcfNet">fcf/Net Income</label>
            <input id="fcfNet" type="text" class="form-control" value="${stats.fcfNI}" disabled>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <label for="fcfShare">FCF/Share</label>
            <input id="fcfShare" type="text" class="form-control" value="${stats.fcfShare}" disabled>
          </div>
          <div class="col">
            <label for="yacktman">Forward ROR (Yacktman)%</label>
            <input id="yacktman" type="text" class="form-control" value="${stats.yackt}" disabled>
          </div>
          <div class="col">
            <label for="proj">Total Projected 10 yr ROR</label>
            <input id="proj" type="text" class="form-control" value="${stats.proj}" disabled>
          </div>
          <div class="col">
            <label for="cfre">CF Re-investment Rate 3yr</label>
            <input id="cfre" type="text" class="form-control" value="${stats.cfRe}" disabled>
          </div>
        </div>
      </div>
      `
    })
}