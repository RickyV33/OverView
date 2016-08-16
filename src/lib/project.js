/* eslint-env browser */

import { querySelectorAll } from '../graph';

export let selectedProject;

/**
 * Listens for mouse clicks on the project list and sets the selectedProject variable to that project's ID. It returns 
 * a promise that signals that the project has been selected.
 *
 * @returns {Promise} signals that that the project has been selected
 */
export function buildProjectAnchors () {
  return new Promise((resolve) => {
    querySelectorAll('#projects a').forEach(projectAnchor => {
      projectAnchor.addEventListener('click', event => {
        selectedProject = event.target.getAttribute('data-id');
        resolve();
      });
    });
  });
}
