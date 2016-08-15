/* eslint-env browser */

import renderGraph from './lib/displayProjectsGraph';
import { renderHierarchy, buildItemHierarchyAnchors, getHierarchy, selectedHierarchyItem} from './lib/hierarchy';
import { buildProjectAnchors, selectedProject } from './lib/project';

let projects = document.querySelector('#projects');
let hierarchy = document.querySelector('#hierarchy');
let graphData;

// TODO: Hook this up to the log out button on the graph view. It is currently not hooked up to anything,
// but functions properly
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logOut').addEventListener('click', () => {
    document.location.href = '/logout';
  });

  
  // Manage the selection of a project and item hierarchy
  buildProjectAnchors().then(() => {
      let requests = [
        getHierarchy(selectedProject),
        getGraph(selectedProject)
      ];
      // Fetch both the hierarchy and graph payload and then return the promise with the values
      document.body.style.cursor = 'wait';
      return Promise.all(requests);
    }).then(payloads => {
      // Render the hierarchy display and add click handlers and store the project graph JSON
      let hierarchyPayload = payloads[0];
      graphData = payloads[1];

      renderHierarchy(hierarchyPayload);
      buildItemHierarchyAnchors();
      toggle(projects);
      toggle(hierarchy);
      document.body.style.cursor = 'default';
    });

  document.getElementById('renderButton').addEventListener('click', () => {
    let rootId = isNaN(parseInt(selectedHierarchyItem)) ? null : parseInt(selectedHierarchyItem);
    toggle(hierarchy);
    renderGraph(graphData, selectedProject, rootId);
  });
});

/**
 * Query the page for a set of elements given a CSS selector.
 *
 * @param selector CSS selector
 * @returns {*} Array of matched elements
 */
export function querySelectorAll (selector) {
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
  });
}
