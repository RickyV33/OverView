/* eslint-env browser */

import './lib/displayProjectsGraph';


let projects = document.querySelector('#projects');
let hierarchy = document.querySelector('#hierarchy');

// TODO: Hook this up to the log out button on the graph view. It is currently not hooked up to anything,
// but functions properly
document.addEventListener('DOMContentLoaded', () => {
  // let ejs = require('ejs');
  // let read = require('fs').readFileSync;
  // let join = require('path').join;
  
  document.getElementById('logOut').addEventListener('click', () => {
    document.location.href = '/logout';
  });
  
  querySelectorAll('#projects a').forEach(projectAnchor => {
    projectAnchor.addEventListener('click', event => {
      let selectedProject = event.target.getAttribute('data-id');
      console.log(selectedProject);
      // Hides projects
      // Shows hierarchy
      // document.body.style.cursor='wait';
      // toggleProjects();
      // toggleHierarchy();
      setTimeout(() => {document.body.style.cursor='default';toggleProjects();toggleHierarchy();}, 2000);

      getHierarchy(selectedProject).then(hierarchyPayload => {
        updateHierarchy(hierarchyPayload).then(updatedHtml => {
          let div = document.createElement('div');
          div.innerHTML = updatedHtml;
          let newDiv = div.firstChild;
          let childList = Array.from(newDiv.childNodes);
          hierarchy.innerHTML = '';
          childList.forEach(child => {
            hierarchy.appendChild(child);
          });
          bindRenderButton();
        });
      });
    });
  });
});

function bindRenderButton() {
  document.getElementById('renderButton').addEventListener('click', event => {
    toggleHierarchy();
    document.querySelector('svg').style.display = 'block';
  });
}
/**
 * Query the page for a set of elements given a CSS selector.
 *
 * @param selector CSS selector
 * @returns {*} Array of matched elements
 */
function querySelectorAll (selector) {
  return Array.prototype.slice.call(document.querySelectorAll(selector));
}

function toggleHierarchy () {
  if (hierarchy.classList.contains('hidden')) {
    console.log('SHOW');
    hierarchy.classList.remove('hidden');
  } else {
    console.log('Hidden');
    hierarchy.classList.add('hidden');
  }
}

function toggleProjects () {
  if (projects.classList.contains('hidden')) {
    projects.classList.remove('hidden');
  } else {
    projects.classList.add('hidden');
  }
}

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

function updateHierarchy (payload) {
  return new Promise((resolve, reject) => {
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          resolve(httpRequest.responseText);
        } else {
          console.log('There was a problem requesting to the hierarchy endpoint.');
          reject({status: httpRequest.status, response: httpRequest.responseText});
        }
      }
    };
    httpRequest.open('POST', '/graph/update-hierarchy');
    httpRequest.setRequestHeader('Content-Type', 'application/json');
    httpRequest.send(JSON.stringify(payload));
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
