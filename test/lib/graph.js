/* eslint-env mocha */

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');

let Graph = require('../../lib/graph');

chai.use(dirtyChai);

describe('Graph class module', () => {
  // Removes console printing for our modules
  console.error = () => {};
  describe('constructor', () => {
    let projectId = 1;
    let url = 'url';
    let stubs = {};
    let data = [];
    let Graph = proxyquire('../../lib/graph', {'./projects': stubs});
    let newGraph;
    let resolvedNamePromise = () => {
      return new Promise((resolve, reject) => {
        data = 'mocked project name';
        resolve(data);
      });
    };
    let resolvedItemsPromise = () => {
      return new Promise((resolve, reject) => {
        data = [{'id': 10, 'name': 'item name', 'type': 99}];
        resolve(data);
      });
    };
    let resolvedRelationshipsPromise = () => {
      return new Promise((resolve, reject) => {
        data = [{'id': 10, 'fromItem': 1, 'toItem': 2, 'type': 99}];
        resolve(data);
      });
    };
    let rejectedTimeoutPromise = () => {
      return new Promise((resolve, reject) => {
        let error = { 'connect': true, 'code': 'ETIMEDOUT' };
        reject(error);
      });
    };
    let rejectedErrorPromise = () => {
      return new Promise((resolve, reject) => {
        let error = { 'statusCode': 401, 'status': 'Not found', 'connect': false, 'code': '' };
        reject(error);
      });
    };

    it('should return a graph with nonempty data members when project ID and url are valid.', () => {
      stubs.getProjectName = () => resolvedNamePromise();
      stubs.getProjectItems = () => resolvedItemsPromise();
      stubs.getProjectRelationships = () => resolvedRelationshipsPromise();
      newGraph = new Graph(projectId, url);
      setTimeout(() => {
        expect(newGraph.name).to.equal('mocked project name');
        expect(newGraph.nodes[0].id).to.equal(10);
        expect(newGraph.nodes[0].name).to.equal('item name');
        expect(newGraph.nodes[0].type).to.equal(99);
        expect(newGraph.edges[0].id).to.equal(10);
        expect(newGraph.edges[0].fromItem).to.equal(1);
        expect(newGraph.edges[0].toItem).to.equal(2);
        expect(newGraph.edges[0].type).to.equal(99);
      }, 5000);
    });

    it('should return a graph that contains nothing when either project ID or url are invalid.', () => {
      stubs.getProjectName = () => rejectedErrorPromise();
      stubs.getProjectItems = () => rejectedErrorPromise();
      stubs.getProjectRelationships = () => rejectedErrorPromise();
      newGraph = new Graph(projectId, url);
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectName', () => {
      stubs.getProjectName = () => rejectedTimeoutPromise();
      stubs.getProjectItems = () => resolvedItemsPromise();
      stubs.getProjectRelationships = () => resolvedRelationshipsPromise();
      newGraph = new Graph(projectId, url);
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
      console.log('------------------------------------------------');
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectItems', () => {
      stubs.getProjectName = () => resolvedNamePromise();
      stubs.getProjectItems = () => rejectedTimeoutPromise();
      stubs.getProjectRelationships = () => resolvedRelationshipsPromise();
      newGraph = new Graph(projectId, url);
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectRelationships', () => {
      stubs.getProjectName = () => resolvedNamePromise();
      stubs.getProjectItems = () => resolvedItemsPromise();
      stubs.getProjectRelationships = () => rejectedTimeoutPromise();
      newGraph = new Graph(projectId, url);
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectName and getProjectItems',
      () => {
        stubs.getProjectName = () => rejectedTimeoutPromise();
        stubs.getProjectItems = () => rejectedTimeoutPromise();
        stubs.getProjectRelationships = () => resolvedRelationshipsPromise();
        newGraph = new Graph(projectId, url);
        expect(newGraph.name).to.be.empty();
        expect(newGraph.nodes).to.be.empty();
        expect(newGraph.edges).to.be.empty();
      });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectItems and' +
      'getProjectRelationships', () => {
      stubs.getProjectName = () => resolvedNamePromise();
      stubs.getProjectItems = () => rejectedTimeoutPromise();
      stubs.getProjectRelationships = () => rejectedTimeoutPromise();
      newGraph = new Graph(projectId, url);
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectName and' +
      'getProjectRelationships', () => {
      stubs.getProjectName = () => rejectedTimeoutPromise();
      stubs.getProjectItems = () => resolvedItemsPromise();
      stubs.getProjectRelationships = () => rejectedTimeoutPromise();
      newGraph = new Graph(projectId, url);
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for all three helper functions', () => {
      stubs.getProjectName = () => rejectedTimeoutPromise();
      stubs.getProjectItems = () => rejectedTimeoutPromise();
      stubs.getProjectRelationships = () => rejectedTimeoutPromise();
      newGraph = new Graph(projectId, url);
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when an error not including timeout is encountered', () => {
      stubs.getProjectName = () => rejectedErrorPromise();
      stubs.getProjectItems = () => rejectedErrorPromise();
      stubs.getProjectRelationships = () => rejectedErrorPromise();
      newGraph = new Graph(projectId, url);
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
      expect(graph.toJson()).to.be.empty();
    });

    it('should return a valid relationship graph json object if Graph contains valid data', () => {
      let graph = new Graph();
      graph.nodes = nodes;
      graph.edges = edges;
      expect(graph.toJson()).to.not.be.empty();
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
