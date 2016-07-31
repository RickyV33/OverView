/* eslint-env browser */

document.addEventListener('DOMContentLoaded', () => {
  let selectedProject;
  
  document.getElementById('projectList').addEventListener('click', event => {
    if (event.target.nodeName === 'A') {
      selectedProject = event.target.getAttributeNode('data-id').nodeValue;
    }
  });
});