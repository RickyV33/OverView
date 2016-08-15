/* eslint-env browser */
//

import { querySelectorAll } from '../graph';

export let selectedHierarchyItem = null;

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

export function renderHierarchy (hierarchyPayload) {
  let itemHierarchyList = document.getElementById('itemHierarchyList');
  if (hierarchyPayload) {
    hierarchyPayload.forEach(item => {
      itemHierarchyList.appendChild(getHierarchyItemWithChildren(item));
    });
  } else {
    itemHierarchyList.appendChild(document.createTextNode('Sorry, this project has no items to display.'));
  }
}

function getHierarchyItemWithChildren (item) {
  let listItem = document.createElement('li');
  let itemAnchor = document.createElement('a');
  itemAnchor.setAttribute('href', '#rootId=' + item.id);
  itemAnchor.appendChild(document.createTextNode(item.name));
  itemAnchor.setAttribute('data-id', item.id);
  listItem.appendChild(itemAnchor);
  if (item.children) {
    let unorderedList = document.createElement('ul');
    item.children.forEach(function (subItem) {
      unorderedList.appendChild(getHierarchyItemWithChildren(subItem));
    });
    listItem.appendChild(unorderedList);
  }
  return listItem;
}

/**
 * Listens for mouse clicks on the Item hierarchy list and sets the selected
 * variable to that items ID
 */
export function buildItemHierarchyAnchors () {
  querySelectorAll('#itemHierarchyList a').forEach(hierarchyAnchor => {
    hierarchyAnchor.addEventListener('click', event => {
      selectedHierarchyItem = event.target.getAttribute('data-id');
    });
  });
}
