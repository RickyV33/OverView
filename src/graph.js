/* eslint-env browser */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('projectList').addEventListener('click', event => {
    if (event.target.nodeName === 'A') {
      let selectedProject = event.target.getAttributeNode('data-id').nodeValue;
      // TODO: (1) AJAX request for item hierarchy tree and (2) creation of project graph
      let graph = makeRequest('/graph', selectedProject);
      console.log(graph);
      // TODO: Re-organize graph object if a project root was selected
    }
  });
});

/**
 * Makes an AJAX request to the provided endpoint.
 *
 * @param url
 * @param projectId
 * @returns {*}
 */
function makeRequest (url, projectId) {
  let graph;
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
