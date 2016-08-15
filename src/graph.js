/* eslint-env browser */

import renderGraph from './lib/displayProjectsGraph';

let projects = document.querySelector('#projects');
let hierarchy = document.querySelector('#hierarchy');
let selectedProject;
let selectedHierarchyItem = null;
let graphData;

// TODO: Hook this up to the log out button on the graph view. It is currently not hooked up to anything,
// but functions properly
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logOut').addEventListener('click', () => {
    document.location.href = '/logout';
  });

  // Manage the selection of a project and item hierarchy
  buildProjectAnchors().then(() => getGraph(selectedProject)).then(graphJSON => {
    graphData = graphJSON;
    console.log(graphData);
    buildItemHierarchyAnchors();
  });

  document.getElementById('renderButton').addEventListener('click', event => {
    toggle(hierarchy);
    console.log(selectedHierarchyItem);
    renderGraph(graphData, selectedProject, parseInt(selectedHierarchyItem));
  });
});

function buildProjectAnchors () {
  return new Promise((resolve) => {
    querySelectorAll('#projects a').forEach(projectAnchor => {
      projectAnchor.addEventListener('click', event => {
        selectedProject = event.target.getAttribute('data-id');
        // Wait until loadHierarchy retrieves the new partial view and updates it with the item hierarchy
        // to display the hierarchy selection div and toggle projects view
        document.body.style.cursor = 'wait';
        getHierarchy(selectedProject).then(hierarchyPayload => {
          renderHierarchy(hierarchyPayload);
          toggle(projects);
          toggle(hierarchy);
          document.body.style.cursor = 'default';
          resolve(true);
        });
      });
    });
  });
}

/**
 * Listens for mouse clicks on the Item hierarchy list and sets the selected
 * variable to that items ID
 */
function buildItemHierarchyAnchors () {
  querySelectorAll('#itemHierarchyList a').forEach(hierarchyAnchor => {
    hierarchyAnchor.addEventListener('click', event => {
      selectedHierarchyItem = event.target.getAttribute('data-id');
    });
  });
}

/**
 * Query the page for a set of elements given a CSS selector.
 *
 * @param selector CSS selector
 * @returns {*} Array of matched elements
 */
function querySelectorAll (selector) {
  return Array.from(document.querySelectorAll(selector));
}

function toggle (element) {
  if (element.classList.contains('hidden')) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}

/**
 * Makes an AJAX request to the provided endpoint for the item hierarchy tree.
 *
 * @param projectId
 * @returns {*}
 */
function getHierarchy (projectId) {
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

function renderHierarchy (hierarchyPayload) {
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
 * Makes an AJAX request to the provided endpoint for the project graph.
 *
 * @param projectId
 * @returns {*}
 */
function getGraph (projectId) {
  // TODO: Refactor to use the request module and promises
  return new Promise((resolve, reject) => {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          resolve(JSON.parse(httpRequest.responseText));
        } else {
          console.log('There was a problem requesting to the graph endpoint.');
          reject({status: httpRequest.status, response: httpRequest.responseText});
        }
      }
    };
    httpRequest.open('GET', '?project=' + projectId);
    httpRequest.send();
    let graphContainer = document.getElementById('d3Container');
    graphContainer.className = ''; // Remove the hidden tag
  });
}
