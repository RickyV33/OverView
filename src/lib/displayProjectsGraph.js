/* exported projectRootId, curves, physics itemNameOrientation, floatDown */
import updateGraph from './graph/config';
import * as graph from '../graph';
import * as project from './project';
import * as hierarchy from './hierarchy';

/* exported renderGraph */
export let curves = true;
export let physics = true;
export let float = 0;      // 0 - right, 1 - down, 2 - no float
export let itemNamePlacement = 0;  // 0 - right, 1 - below, 2 - mix

document.addEventListener('DOMContentLoaded', () => {
  initializeD3Options();
  addD3GraphOptionOnChangeHandler();
});

/**
 * Base function to render the graph. It is invoked by the view through an AJAX call after the data has been retrieved.
 * @param graphData
 * @param selectedProjectId
 * @param rootId
 */
// eslint-disable-next-line no-unused-vars
export default function renderGraph (graphData, selectedProjectId, rootId) {
  updateGraph(graphData, selectedProjectId, rootId);
}

/**
 * Initializes the D3 graph options.
 */
function initializeD3Options () {
  // Selects all radio buttons with the specified name and sets the checked value according to the corresponding
  // d3GraphObject boolean value.
  graph.querySelectorAll('input[name="curves"]').forEach(option => {
    if (option.value === curves.toString()) {
      option.checked = true;
    }
  });
  graph.querySelectorAll('input[name="physics"]').forEach(option => {
    if (option.value === physics.toString()) {
      option.checked = true;
    }
  });
  graph.querySelectorAll('input[name="float"]').forEach(option => {
    if (parseInt(option.value) === float) {
      option.checked = true;
    }
  });
  graph.querySelectorAll('input[name="itemNamePlacement"]').forEach(option => {
    if (parseInt(option.value) === itemNamePlacement) {
      option.checked = true;
    }
  });
}

/**
 * Listens for input change on radio buttons and sets value within the D3GraphOptions object accordingly.
 */
function addD3GraphOptionOnChangeHandler () {
  graph.querySelectorAll('#d3GraphOptions input[type=radio]').forEach(option => {
    option.addEventListener('change', event => {
      switch (event.target.getAttribute('name')) {
        case 'curves':
          curves = (event.target.getAttribute('value') === 'true');
          break;
        case 'physics':
          physics = (event.target.getAttribute('value') === 'true');
          break;
        case 'float':
          float = parseInt(event.target.getAttribute('value'));
          break;
        case 'itemNamePlacement':
          itemNamePlacement = parseInt(event.target.getAttribute('value'));
      }
      renderGraph(graph.graphData, project.selectedProject, hierarchy.selectedHierarchyItem);
    });
  });
}
