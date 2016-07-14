'use strict';

let projectquire = require('./projectquire');

class Graph {
  /**
   * Builds a graph object model given a project ID and a url that contains the username, password, and team name.
   *
   * @param {Number} projectId
   * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
   * @constructor {Graph}
   */
  constructor (projectId, url) {
    this.name = '';
    this.nodes = [];
    this.edges = [];
    if (projectId && url) {
      projectquire.getProjectName(projectId, url).then(name => { this.name = name; }, error => console.error(error));
      projectquire.getProjectItems(projectId, url).then(items => { this.nodes = items; }, error => console.error(error));
      projectquire.getProjectRelationships(projectId, url).then(
        relationships => { this.edges = relationships; },
        error => console.error(error)
      );
    }
  }

  Reorganize (rootNode) {
    // TODO: dependent on story #60 (backlog)
  }

  /**
   * Returns an object model abiding by the relationship graph JSON schema from the given nodes and edges.
   *
   * @returns {{items: Array, relationships: Array}}
   */
  toJson () {
    console.log('called');
    return { 'items': this.nodes, 'relationships': this.edges };
  }
}

/**
 * Iterates through all items in both the item and the item relationship lists and pushes to the `nodes` and `edges`
 * arrays, respectively.
 *
 * @param {Object} graphJson
 */
Graph.fromJson = function fromJson (graphJson) {
  let graph = new Graph();
  graphJson.items.forEach(item => graph.nodes.push(item));
  graphJson.relationships.forEach(relationship => graph.edges.push(relationship));
  return graph;
};

module.exports = Graph;
