/* eslint-env browser */

import * as graph from '../graph';
import * as hierarchy from './hierarchy';

export let selectedProject;

/**
 * Listens for mouse clicks on the project list and sets the selectedProject variable to that project's ID. It returns
 * a promise that signals that the project has been selected.
 *
 * @returns {Promise} signals that that the project has been selected
 */
export function buildProjectAnchors () {
    graph.querySelectorAll('#projects a').forEach(projectAnchor => {
      projectAnchor.addEventListener('click', event => {
        new Promise((resolve) => {
          selectedProject = event.target.getAttribute('data-id');
        // Fetch both the hierarchy and graph payload and then return the promise with the payloads when both async
        // calls are fulfilled
        document.body.style.cursor = 'wait';
        let requests = [hierarchy.getHierarchy(selectedProject), graph.getGraph(selectedProject)];
        resolve(Promise.all(requests));
      }).then(payloads => {
          // Render the hierarchy display and add click handlers and store the project graph JSON
          let hierarchyPayload = payloads[0];
          graph.graphData = payloads[1];
          hierarchy.renderHierarchy(hierarchyPayload);
          hierarchy.buildItemHierarchyAnchors();
          graph.toggle(graph.projectsContainer);
          graph.toggle(graph.hierarchyContainer);
          document.body.style.cursor = 'default';
        });
    });
  })
}
