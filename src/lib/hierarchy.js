/* eslint-env browser */

import * as graph from '../graph';
import * as project from './project';
import renderGraph from './displayProjectsGraph';

export let selectedHierarchyItem = null;

document.addEventListener('DOMContentLoaded', () => {
  /**
   * Toggles the hierarchy div and displays the D3 graph representation of the data based on the passed in parameters
   */
  document.getElementById('renderButton').addEventListener('click', () => {
    selectedHierarchyItem = isNaN(parseInt(selectedHierarchyItem)) ? null : parseInt(selectedHierarchyItem);
    graph.toggle(document.querySelector('#hierarchy'));
    graph.toggle(document.querySelector('#d3Container'));
    renderGraph(graph.graphData, project.selectedProject, selectedHierarchyItem);
  });
});

/**
 * Makes an AJAX request to the provided endpoint for the item hierarchy tree.
 *
 * @param projectId
 * @returns {*}
 */
export function getHierarchy (projectId) {
  // TODO: Refactor to use the request module?
  return new Promise((resolve, reject) => {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          resolve(JSON.parse(httpRequest.responseText));
        } else {
          console.log('There was a problem requesting to the hierarchy endpoint.');
          reject({status: httpRequest.status, response: httpRequest.responseText});
        }
      }
    };
    httpRequest.open('GET', '/hierarchy?project=' + projectId);
    httpRequest.send();
  });
}

/**
 * Takes in a JSON containing the item hierarchy structure, then creates the item hierarchy anchor list in the
 * hierarchy partial. If no items exist for the project, then it adds text to the item hierarchy list that says so.
 *
 * @param hierarchyPayload the JSON object containing the item hierarchy that will be displayed
 */
export function renderHierarchy (hierarchyPayload) {
  let itemHierarchyList = document.getElementById('itemHierarchyList');
  destroyHierarchy(); // Refresh the list every time renderHierarchy is called
  if (hierarchyPayload) {
    hierarchyPayload.items.forEach(item => {
      itemHierarchyList.appendChild(createHierarchyItemWithChildren(item));
    });
  } else {
    itemHierarchyList.appendChild(document.createTextNode('Sorry, this project has no items to display.'));
  }
}

/**
 * Iterates through the ItemHierarchyList and destroys every list item in preparation for a new project's hierarchy
 * list to be rendered.
 */
function destroyHierarchy () {
  let hierarchyListItems = document.getElementById('itemHierarchyList');
  Array.from(hierarchyListItems.children).forEach(item => {
    hierarchyListItems.removeChild(item);
  });
}
/**
 * Takes a hierarchy item and recursively creates a list item for itself and all of it's children, where the project items
 * are anchors. It then returns the hierarchy item with all it's children as an HTML element.
 *
 * @param item the hierarchy item with children
 * @returns {Element} the HTML element composed from the hierarchy item with children
 */
function createHierarchyItemWithChildren (item) {
  let listItem = document.createElement('li');
  if (item.isSet === false) {
    let itemAnchor = document.createElement('a');
    itemAnchor.setAttribute('href', '#rootId=' + item.id);
    itemAnchor.appendChild(document.createTextNode(item.name + ' (' + item.docKey + ')'));
    itemAnchor.setAttribute('data-id', item.id);
    listItem.appendChild(itemAnchor);
  } else {
    listItem.appendChild(document.createTextNode(item.name));
  }
  if (item.children) {
    let unorderedList = document.createElement('ul');
    item.children.forEach(function (subItem) {
      unorderedList.appendChild(createHierarchyItemWithChildren(subItem));
    });
    listItem.appendChild(unorderedList);
  }
  return listItem;
}

/**
 * Listens for mouse clicks on the Item hierarchy list and sets the selectedHierarchyItem
 * variable to that item's ID, and adds the selected class to the selected item
 */
export function addItemHierachyClickHandler () {
  graph.querySelectorAll('#itemHierarchyList a').forEach(hierarchyAnchor => {
    hierarchyAnchor.addEventListener('click', event => {
      let selectedItem = document.querySelector('#itemHierarchyList li.selected');
      if (selectedItem) {
        selectedItem.classList.remove('selected');
      }
      selectedHierarchyItem = event.target.getAttribute('data-id');
      event.target.classList.add('selected');
    });
  });
}

/**
 * Sets the value of the selectedHierarchyItem variable to the value that is supplied
 *
 * @param value can be null or some root id (integer)
 */
export function setSelectedHierarchyItem (value) {
  selectedHierarchyItem = value;
}
