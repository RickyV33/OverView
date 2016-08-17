/* global d3 */

import updateGraph from './graph/config';

/* exported renderGraph */
const projectRootId = -1; // Default value for project node

// ////// DEMO VARS//////

// let allCollapsed = false;
let curves = false;
let physics = true;
let itemNames = true;
let floatDown = true;

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
