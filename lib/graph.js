'use strict';
let projects = require('./projects');
let Ajv = require('ajv');

let schema = require('./schema/relationshipGraph');

class Graph {
  /**
   * Builds a graph object model given a project ID and a url that contains the username, password, and team name.
   * Includes a nested function that handles timeouts and supports atomicity.
   *
   * @param {Number} projectId
   * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
   * @constructor {Graph}
   */
  constructor (projectId, url) {
    this.name = '';
    this.nodes = [];
    this.edges = [];
    let counter = 0;
    let timeout = false;

    // Calls the function that attempts to get the project name, items, and relationships
    getData();

    /**
     * Recursive function that supports atomicity to ensure that either all project components are retrieved or none
     * at all. Timeouts are handled and requests are retried a maximum of five times before logging an error.
     */
    function getData () {
      if (projectId && url && !timeout) {
        if (counter >= 5) {
          console.error('Request Error: can\'t reach Jama');
          timeout = true;
          return;
        }
        ++counter;
        //  ----------------------
        // | Getting project name |
        //  ----------------------
        projects.getProjectName(projectId, url).then(name => {
          this.name = name;
        }, error => {
          if (error.code === 'ETIMEDOUT' || error.connect === true) {
            // On a timeout, attempt to get the data again
            getData();
          } else {
            // Catch any other request error and console log the status code
            console.error('Request Error on retrieving project name: ' + error.statusCode + ' ' + error.status);
          }
        });
        //  ---------------
        // | Getting items |
        //  ---------------
        projects.getProjectItems(projectId, url).then(items => {
          this.nodes = items;
        }, error => {
          if (error.code === 'ETIMEDOUT' || error.connect === true) {
            // On a timeout, attempt to get the data again
            getData();
          } else {
            // Catch any other request error and console log the status code
            console.error('Request Error on retrieving project items: ' + error.statusCode + ' ' + error.status);
          }
        });
        //  -----------------------
        // | Getting relationships |
        //  -----------------------
        projects.getProjectRelationships(projectId, url).then(
          relationships => {
            this.edges = relationships;
          },
          error => {
            if (error.code === 'ETIMEDOUT' || error.connect === true) {
              // On a timeout, attempt to get the data again
              getData();
            } else {
              // Catch any other request error and console log the status code
              console.error('Request Error on retrieving project relationships: ' + error.statusCode + ' ' + error.status);
            }
          }
        );
      }
    }
  }

  Reorganize (rootNode) {
    // TODO: dependent on story #60 (backlog)
  }

  /**
   * Returns an object model abiding by the relationship graph JSON schema from the given nodes and edges.
   *
   * @returns {{items: Array, relationships: Array}} if nodes and edges is in the proper format, undefined otherwise
   */
  toJson () {
    let graphJson = {'items': this.nodes, 'relationships': this.edges};
    let ajv = new Ajv();
    var valid = ajv.validate(schema, graphJson);
    if (valid) {
      return {'items': this.nodes, 'relationships': this.edges};
    } else {
      console.error('Graph is not returning a valid graph relationship object');
    }
  }
}

/**
 * Iterates through all items in both the item and the item relationship lists and pushes to the `nodes` and `edges`
 * arrays, respectively.
 *
 * @param {Object} graphJson
 * @returns A graph object if graphJson is valid, undefined otherwise
 */
Graph.fromJson = function fromJson (graphJson) {
  let ajv = new Ajv();
  var valid = ajv.validate(schema, graphJson);
  if (valid) {
    let graph = new Graph();
    graphJson.items.forEach(item => graph.nodes.push(item));
    graphJson.relationships.forEach(relationship => graph.edges.push(relationship));
    return graph;
  } else {
    console.error('Relationship graph json passed in is invalid');
  }
};

module.exports = Graph;
