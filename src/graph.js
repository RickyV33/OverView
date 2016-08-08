/* eslint-env browser */

import './lib/displayProjectsGraph';


let projects = document.querySelector('#projects');
let hierarchy = document.querySelector('#hierarchy');
let selectedProject;
let selectedHierarchyItem;
let graph;
let usedRoot = false;

// TODO: Hook this up to the log out button on the graph view. It is currently not hooked up to anything,
// but functions properly
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logOut').addEventListener('click', () => {
    document.location.href = '/logout';
  });

  // Manage the selection of a project
  buildProjectAnchors();
  buildItemHierarchyAnchors();
});


/**
 * Listens for mouse clicks on the Item hierarchy list and sets the selected
 * variable to that items ID
 */
function buildItemHierarchyAnchors() {
  querySelectorAll('#hierarchy a').forEach(hierarchyAnchor => {
    hierarchyAnchor.addEventListener('click', event => {
      selectedHierarchyItem = event.target.getAttribute('data-id');
    });
  });
}

function buildProjectAnchors() {
  querySelectorAll('#projects a').forEach(projectAnchor => {
    projectAnchor.addEventListener('click', event => {
      selectedProject = event.target.getAttribute('data-id');
      // Wait until loadHierarchy retrieves the new partial view and updates it with the item hierarchy
      // to display the hierarchy selection div and toggle projects view
      document.body.style.cursor='wait';
      loadHierarchy().then(() => {
        toggle(projects);
        toggle(hierarchy);
        document.body.style.cursor='default';
      });
    });
  });
}

function bindRenderButton() {
  document.getElementById('renderButton').addEventListener('click', event => {
    toggle(hierarchy);
    document.querySelector('svg').style.display = 'block';
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

function updateHierarchy (payload) {
  return new Promise((resolve, reject) => {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          resolve(httpRequest.responseText);
        } else {
          console.log('There was a problem requesting to the hierarchy endpoint.');
          reject({status: httpRequest.status, response: httpRequest.responseText});
        }
      }
    };
    httpRequest.open('POST', '/graph/update-hierarchy');
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.send(JSON.stringify(payload));
  });

}

function loadHierarchy () {
  return new Promise((resolve) => {
    getHierarchy(selectedProject).then(hierarchyPayload => {
      updateHierarchy(hierarchyPayload).then(updatedHtml => {
        let hierarchyContainer = document.createElement('div');
        hierarchyContainer.innerHTML = updatedHtml;
        let childList = Array.from(hierarchyContainer.firstChild.childNodes);
        hierarchy.innerHTML = '';
        childList.forEach(child => {
          hierarchy.appendChild(child);
        });
        bindRenderButton();
        resolve();
      });
    });
  });
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
          console.log(httpRequest.responseText);
        } else {
          console.log('There was a problem requesting to the graph endpoint.');
          reject({status: httpRequest.status, response: httpRequest.responseText});
        }
      }
    };
    httpRequest.open('GET', '/graph?project=' + projectId);
    httpRequest.send();
  });
}
