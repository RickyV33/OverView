/* exported projectRootId, curves, physics itemNames, floatDown */
import updateGraph from './graph/config';

/* exported renderGraph */
export const projectRootId = -1; // Default value for project node

// ////// DEMO VARS//////

// let allCollapsed = false;
export let curves = true;
export let physics = true;

export let itemNames = 1;  // 0 - right, 1 - below, 2 - mix
export let float = 0;      // 0 - right, 1 - down, 2 - no float

let example = 0;

switch (example) {
  case 0:
    console.log('float down, item names below');
    float = 1;
    itemNames = 1;
    break;
  case 1:
    console.log('float right, item names right');
    float = 0;
    itemNames = 0;
    break;
  case 2:
    console.log('float right, item names mix');
    float = 0;
    itemNames = 2;
    break;
  case 3:
    console.log('float down, item names mix');
    float = 1;
    itemNames = 2;
    break;
  case 4:
    console.log('No float, item names mix');
    float = 2;
    itemNames = 2;
    break;
  case 5:
    console.log('No float, item names below');
    float = 2;
    itemNames = 1;
    break;
}

// /////////////////////

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
