/* exported projectRootId, curves, physics itemNameOrientation, floatDown */
import updateGraph from './graph/config';

/* exported renderGraph */
export const projectRootId = -1; // Default value for project node

export let curves = true;
export let physics = true;
export let float = 0;      // 0 - right, 1 - down, 2 - no float
export let itemNamePlacement = 0;  // 0 - right, 1 - below, 2 - mix

/**
 * Base function to render the graph. It is invoked by the view through an AJAX call after the data has been retrieved.
 * @param graphData
 * @param selectedProjectId
 * @param rootId
 */
// eslint-disable-next-line no-unused-vars
export function renderGraph (graphData, selectedProjectId, rootId) {
  updateGraph(graphData, selectedProjectId, rootId);
}

export function applyGraphSettings (settings) {
  console.log('inside applygraphsettings');
  curves = settings.curves;
  physics = settings.physics;
  float = settings.float;
  itemNamePlacement = settings.itemNamePlacement;
}
