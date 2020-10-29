function linksMenu(links, symbol){
  let noLinks = false;
  let allLinks = links.split(',');
  let linkString = '';
  for(let i = 0; i < allLinks.length; i++){
    if(allLinks[i] === 'null'){
      noLinks = true;
      break;
    }
    let format = allLinks[i].split('|');
    if(format[0].indexOf('http') === -1) format[0] = `http://${format[0].replace(/\s/g, '')}`
    linkString += `<div><a href="${format[0].replace(/\s/g, '')}" target="_blank">${format[format.length === 1 ? 0 : 1].trim()}</a></div>`
  }
  console.log(linkString)
  let swalConfig = {};
  if(noLinks){
    swalConfig = {
      type: 'error',
      title: 'No Links Stored',
      text: 'Add links in the edit menu'
    }
  }
  else {
    swalConfig = {
      title: `${symbol} Links`,
      html:`
        <div>
          ${linkString}
        <div>
      `,
    }
  }
  swal.fire(swalConfig);
}