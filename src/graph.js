/* eslint-env browser */

import './lib/displayProjectsGraph';

// TODO: Hook this up to the log out button on the graph view. It is currently not hooked up to anything,
// but functions properly
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logOut').addEventListener('click', () => {
    document.location.href = '/logout';
  });
});

/**
 * Query the page for a set of elements given a CSS selector.
 *
 * @param selector CSS selector
 * @returns {*} Array of matched elements
 */
function querySelectorAll (selector) {
  return Array.prototype.slice.call(document.querySelectorAll(selector));
}

querySelectorAll('#projects, #hierarchy').forEach(elem => {
  elem.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
  querySelectorAll('#projects a').forEach(projectAnchor => {
    projectAnchor.addEventListener('click', event => {
      let selectedProject = event.target.getAttribute('data-id');
      getHierarchyRequest('/hierarchy', selectedProject);
      getGraphRequest('/graph', selectedProject, (graph) => {
        console.log(graph);
      });
      // TODO: change query parameter (dependent on hierarchy endpoint story)
    });
  });
});

/**
 * Makes an AJAX request to the provided endpoint for the item hierarchy tree.
 *
 * @param url
 * @param projectId
 * @returns {*}
 */
function getHierarchyRequest (url, projectId) {
  let hierarchy = {};
  // TODO: Refactor to use the request module
  let httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        hierarchy = JSON.parse(httpRequest.responseText);
        console.log(httpRequest.responseText);
      } else {
        console.log('There was a problem requesting to the hierarchy endpoint.');
      }
    }
  };
  httpRequest.open('GET', url);
  httpRequest.send('project=' + projectId);
  return hierarchy;
}

/**
 * Makes an AJAX request to the provided endpoint for the project graph.
 *
 * @param url
 * @param projectId
 * @param callback
 * @returns {*}
 */
function getGraphRequest (url, projectId, callback) {
  // TODO: Refactor to use the request module and promises
  let httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        callback(JSON.parse(httpRequest.responseText));
        console.log(httpRequest.responseText);
      } else {
        console.log('There was a problem requesting to the graph endpoint.');
      }
    }
  };
  httpRequest.open('GET', url + '?project=' + projectId);
  httpRequest.send();
}
