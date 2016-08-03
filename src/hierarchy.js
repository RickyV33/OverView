/* eslint-env browser */

/**
 * Event listeners for hierarchy.ejs view handles selection on item hierarchy
 * and sends the selected item, via its ID, to the render_graph function
 */
document.addEventListener('DOMContentLoaded', function () {
  let selected;
  /**
   * Listens for mouse clicks on the Item hierarchy list and sets the selected
   * variable to that items ID
   */
  document.getElementById('itemHierarchy').addEventListener('click', event => {
    if (event.target.nodeName === 'LI') {
      selected = event.target.id;
    }
  });
  /**
   * Listens for mouse click on the render graph button and sends the selected
   * item to the render graph function
   */
  document.getElementById('renderButton').addEventListener('click', event => {
    if (selected !== undefined) {
      //  TODO-update rootID
      window.location = './graph?rootId=' + selected;
    }
  });
  /**
   * Listens for 'enter' button pressing for the Item hierarchy
   * Sets the  selected variable to the item id, nd sends the selected
   * Item to the render graph function
   */
  document.getElementById('itemHierarchy').addEventListener('keydown', event => {
    if (event.keyCode === 13) {
      selected = event.target.id;
      if (selected !== undefined) {
        //  TODO-update rootID
        window.location = './graph?rootId=' + selected;
      }
    }
  });
});
