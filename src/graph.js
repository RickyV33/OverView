/* eslint-env browser */

import * as project from './lib/project';
import * as hierarchy from './lib/hierarchy';

export let graphData;

// TODO: Hook this up to the log out button on the graph view. It is currently not hooked up to anything,
// but functions properly
document.addEventListener('DOMContentLoaded', () => {
  project.addProjectAnchorClickHandler();

  document.getElementById('logOut').addEventListener('click', () => {
    document.location.href = '/logout';
  });
  document.getElementById('backButton').addEventListener('click', () => {
    // If the current div is the d3Container
    if (document.querySelector('#hierarchy').classList.contains('hidden')) {
      toggle(document.querySelector('#d3Container'));
      toggle(document.querySelector('#hierarchy'));
      hierarchy.setSelectedHierarchyItem(null);
    } else {
      toggle(document.querySelector('#projects'));
      toggle(document.querySelector('#hierarchy'));
    }
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

/**
 * Toggles the visibility of the passed in element.
 *
 * @param element the element that will be hidden/displayed
 */
export function toggle (element) {
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
export function getGraph (projectId) {
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
