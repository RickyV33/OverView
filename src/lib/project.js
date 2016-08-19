/* eslint-env browser */

import * as graph from '../graph';
import * as hierarchy from './hierarchy';

export let selectedProject;

/**
 * Listens for mouse clicks on the project list and sets the selectedProject variable to that project's ID. The click handler
 * returns a promise that signals that the project has been selected, and that the hierarchy and graph have been retrieved.
 * Then it renders the hierarchy into the hierarchy partial, and adds click handlers to each item hierarchy anchor.
 *
 * @returns {Promise} signals that that the project has been selected
 */
export function addProjectAnchorClickHandler () {
  graph.querySelectorAll('#projects a').forEach(projectAnchor => {
    projectAnchor.addEventListener('click', event => {
      new Promise((resolve) => {
        selectedProject = event.target.getAttribute('data-id');
        // Fetch both the hierarchy and graph payload and then return the promise with the payloads when both async
        // calls are fulfilled
        document.body.style.cursor = 'wait';
        let requests = [ hierarchy.getHierarchy(selectedProject), graph.getGraph(selectedProject) ];
        resolve(Promise.all(requests));
      }).then(payloads => {
        // Render the hierarchy display and add click handlers and store the project graph JSON
        let hierarchyPayload = payloads[0];
        graph.graphData = payloads[1];
        hierarchy.renderHierarchy(hierarchyPayload);
        hierarchy.addItemHierachyClickHandler();
        graph.toggle(document.querySelector('#projects'));
        graph.toggle(document.querySelector('#hierarchy'));
        document.body.style.cursor = 'default';
      });
    });
  });
}
