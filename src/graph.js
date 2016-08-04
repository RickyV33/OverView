/* eslint-env browser */

import './lib/displayProjectsGraph';

// TODO: Hook this up to the log out button on the graph view. It is currently not hooked up to anything,
// but functions properly
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logOut').addEventListener('click', () => {
    document.location.href = '/logout';
  });
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('projectList').addEventListener('click', event => {
    if (event.target.nodeName === 'A') {
      let selectedProject = event.target.getAttributeNode('data-id').nodeValue;
      let hierarchy = getHierarchyRequest('/hierarchy', selectedProject);
      let graph = getGraphRequest('/graph', selectedProject);
      // Temporary statement for linter
      console.log(graph + hierarchy);
      // TODO: change query parameter (dependent on hierarchy endpoint story)
    }
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
 * @returns {*}
 */
function getGraphRequest (url, projectId) {
  let graph = {};
  let httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        graph = JSON.parse(httpRequest.responseText);
        console.log(httpRequest.responseText);
      } else {
        console.log('There was a problem requesting to the graph endpoint.');
      }
    }
  };
  httpRequest.open('GET', url);
  httpRequest.send('project=' + projectId);
  return graph;
}
