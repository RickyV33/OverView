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

let projects = document.querySelector('#projects');
let hierarchy = document.querySelector('#hierarchy');

function toggleHierarchy () {
  if (hierarchy.classList.contains('hidden')) {
    hierarchy.classList.remove('hidden');
  } else {
    hierarchy.classList.add('hidden');
  }
}

function hideProjects () {
  projects.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  querySelectorAll('#projects a').forEach(projectAnchor => {
    projectAnchor.addEventListener('click', event => {
      let selectedProject = event.target.getAttribute('data-id');

      hideProjects();
      toggleHierarchy();

      getHierarchy(selectedProject).then(hierarchy => {
        console.log(hierarchy);
      });
      getGraph(selectedProject).then(graph => {
        console.log(graph);
      });
      // TODO: change query parameter (dependent on hierarchy endpoint story)
    });
  });

  document.getElementById('renderButton').addEventListener('click', event => {
    toggleHierarchy();
    document.querySelector('svg').style.display = 'block';
  });
});

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
