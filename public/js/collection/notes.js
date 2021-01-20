const openNotes = () => {
  swal.fire({
    title: 'comments',
    showConfirmButton: true,
    confirmButtonText: 'Save Changes',
    showCancelButton: true,
    cancelButtonText: 'Back',
    width: '80vw',
    html: `
      <div class="row">
        <div class="col">
          <label for="insideOwnership">Inside Ownership</label>
          <input id="insideOwnership" type="text" class="form-control">
        </div>
        <div class="col">
          <label for="institutionalOwnership">Institutional Ownership</label>
          <input id="institutionalOwnership" type="text" class="form-control">
        </div>
        <div class="col">
          <label for="founderRunBoard">Founder run/Board</label>
          <select id="founderRunBoard" type="text" class="form-control">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div class="col">
          <label for="sourceOfMoat">Source of Moat</label>
          <select id="sourceOfMoat" type="text" class="form-control">
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>
      `
  })
}