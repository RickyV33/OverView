/* eslint-env browser */

import { querySelectorAll } from '../graph';

export let selectedProject;

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