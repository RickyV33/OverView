/* eslint-env browser */

document.addEventListener('DOMContentLoaded', function () {
  let selected;
  document.getElementById('itemHierarchy').addEventListener('click', (event) => {
    if (event.target.nodeName === 'LI') {
      selected = event.target.id;
    }
  });
  document.getElementById('renderButton').addEventListener('click', (event) => {
    // TODO call render_Graph with selected as argument
    console.log(selected);
  });
  document.getElementById('itemHierarchy').onkeydown = (event) => {
    if (event.keyCode === 13) {
      selected = event.target.id;
      // TODO call render_Graph with selected as argument
      console.log(selected);
    }
  };
});
