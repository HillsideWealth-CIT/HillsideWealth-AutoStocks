'use strict';

console.log('hello there')

const e = React.createElement;

const EditView = () => {
  return ( 
    <div>
      <h1>Hello There</h1>
    </div>
   );
}

const domContainer = document.querySelector('#editContainer');
ReactDOM.render(e(EditView), domContainer);