/* eslint-env mocha */

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');

let Graph = require('../../lib/graph');

chai.use(dirtyChai);

describe('Graph class module', function () {
  // Removes console printing for our modules
  console.error = () => {};
  describe('constructor', function () {
    let projectId = 1;
    let url = 'url';
    let stubs = {};
    let data = [];
    let Graph;
    let resolvedNamePromise = () => {
      return new Promise(function (resolve, reject) {
        data = 'mocked project name';
        resolve(data);
      });
    };
    let resolvedItemsPromise = () => {
      return new Promise(function (resolve, reject) {
        data = [{'id': 10, 'name': 'item name', 'type': 99}];
        resolve(data);
      });
    };
    let resolvedRelationshipsPromise = () => {
      return new Promise(function (resolve, reject) {
        data = [{'id': 10, 'fromItem': 1, 'toItem': 2, 'type': 99}];
        resolve(data);
      });
    };
    let rejectedPromise = () => {
      return new Promise(function (resolve, reject) {
        reject('rejected promise');
      });
    };

    it('should return a graph with nonempty data members when project ID and url are valid.', function () {
      Graph = proxyquire('../../lib/graph', {'./projectquire': stubs});
      stubs.getProjectName = () => {
        return resolvedNamePromise();
      };
      stubs.getProjectItems = () => {
        return resolvedItemsPromise();
      };
      stubs.getProjectRelationships = () => {
        return resolvedRelationshipsPromise();
      };
      let newGraph = new Graph(projectId, url);
      setTimeout(() => {
        expect(newGraph.name).to.equal('mocked project name');
        expect(newGraph.nodes[0].id).to.equal(10);
        expect(newGraph.nodes[0].name).to.equal('item name');
        expect(newGraph.nodes[0].type).to.equal(99);
        expect(newGraph.edges[0].id).to.equal(10);
        expect(newGraph.edges[0].fromItem).to.equal(1);
        expect(newGraph.edges[0].toItem).to.equal(2);
        expect(newGraph.edges[0].type).to.equal(99);
      }, 2000);
    });

    it('should return nothing when either project ID or url are invalid.', function () {
      Graph = proxyquire('../../lib/graph', {'./projectquire': stubs});
      stubs.getProjectName = () => {
        return rejectedPromise();
      };
      stubs.getProjectItems = () => {
        return rejectedPromise();
      };
      stubs.getProjectRelationships = () => {
        return rejectedPromise();
      };
      let newGraph = new Graph(projectId, url);
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });
  });

  describe('toJson function', () => {
    let badNodes = [{'id': '10', 'name': 'item name', 'type': '99'}];
    let badEdges = [{'id': '10', 'fromItem': '1', 'toItem': '2', 'type': '99'}];
    let nodes = [{'id': 10, 'name': 'item name', 'type': 99}];
    let edges = [{'id': 10, 'fromItem': 1, 'toItem': 2, 'type': 99}];

    it('should print an error message if the data Graph contains is invalid', () => {
      let graph = new Graph();
      graph.nodes = badNodes;
      graph.edges = badEdges;
      expect(graph.toJson()).to.be.null;
    });

    it('should return a valid relationship graph json object if Graph contains valid data', () => {
      let graph = new Graph();
      graph.nodes = nodes;
      graph.edges = edges;
      expect(graph.toJson()).to.be.empty();
    });
  });

  describe('fromJson function', () => {
    let badNodes = [{'id': '10', 'name': 'item name', 'type': '99'}];
    let badEdges = [{'id': '10', 'fromItem': '1', 'toItem': '2', 'type': '99'}];
    let nodes = [{'id': 10, 'name': 'item name', 'type': 99}];
    let edges = [{'id': 10, 'fromItem': 1, 'toItem': 2, 'type': 99}];

    it('should print an error message if the data Graph contains is invalid', () => {
      let relGraphObj = {'items': badNodes, 'relationships': badEdges};
      expect(Graph.fromJson(relGraphObj)).to.be.null;
    });

    it('should return a valid relationship graph json object if graph contains valid data', () => {
      let graph = new Graph();
      graph.nodes = nodes;
      graph.edges = edges;
      let relGraphBlob = {'items': nodes, 'relationships': edges};
      let newGraph = Graph.fromJson(relGraphBlob);
      expect(newGraph.nodes).to.deep.equal(nodes);
      expect(newGraph.edges).to.deep.equal(edges);
    });
  });
});
