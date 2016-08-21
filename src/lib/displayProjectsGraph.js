/* exported projectRootId, curves, physics itemNames, floatDown */
import updateGraph from './graph/config';

/* exported renderGraph */
export const projectRootId = -1; // Default value for project node

// ////// DEMO VARS//////

// let allCollapsed = false;
export let curves = true;
export let physics = true;
export let itemNames = true;
export let floatDown = false;

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
