/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let Graph = require('../../lib/graph');

chai.use(dirtyChai);

describe('Graph class module', () => {
  // Removes console printing for our modules
  let oldError = console.error;
  before(() => {
    console.error = () => {};
  });
  after(() => {
    console.error = oldError;
  });
  describe('constructor', () => {
    let url = 'url';
    let projectId = 3;
    let graph = new Graph(projectId, url);
    expect(graph.url).to.equal(url);
    expect(graph.projectId).to.equal(projectId);
    expect(graph.name).to.be.empty();
    expect(graph.nodes).to.be.empty();
    expect(graph.edges).to.be.empty();
  });

  describe('buildGraph function', () => {
    let projectId;
    let url;
    let stubs;
    let Graph;
    let newGraph;
    let nameData = 'mocked project name';
    let itemData = [{'id': 10, 'name': 'item name', 'type': 99}];
    let relationshipData = [{'id': 10, 'source': 1, 'target': 2, 'type': 99}];
    let imageData = [{'99': 'item image'}];
    let edgeNameData = [{'99': 'edge name'}];

    beforeEach(() => {
      projectId = 1;
      url = 'url';
      stubs = {};
      Graph = proxyquire('../../lib/graph', {'./projects': stubs});
      newGraph = undefined;
    });

    let resolvePromise = data => Promise.resolve(data);
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
      stubs.getProjectName = () => resolvePromise(nameData);
      stubs.getProjectItems = () => resolvePromise(itemData);
      stubs.getProjectRelationships = () => resolvePromise(relationshipData);
      stubs.getProjectItemTypeImages = () => resolvePromise(imageData);
      stubs.getRelationshipTypeNames = () => resolvePromise(edgeNameData);
      newGraph = new Graph(projectId, url);
      return newGraph.buildGraph().then(() => {
        expect(newGraph.name).to.equal('mocked project name');
        expect(newGraph.nodes[0].id).to.equal(10);
        expect(newGraph.nodes[0].name).to.equal('item name');
        expect(newGraph.nodes[0].type).to.equal(99);
        expect(newGraph.nodes[0].image).to.equal('item image');
        expect(newGraph.edges[0].id).to.equal(10);
        expect(newGraph.edges[0].source).to.equal(1);
        expect(newGraph.edges[0].target).to.equal(2);
        expect(newGraph.edges[0].type).to.equal(99);
      });
    });

    it('should return a graph that contains nothing when either project ID or url are invalid.', () => {
      stubs.getProjectName = () => rejectedErrorPromise();
      stubs.getProjectItems = () => rejectedErrorPromise();
      stubs.getProjectRelationships = () => rejectedErrorPromise();
      stubs.getProjectItemTypeImages = () => rejectedErrorPromise();
      stubs.getRelationshipTypeNames = () => rejectedErrorPromise();
      newGraph = new Graph(projectId, url);
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectName', () => {
      stubs.getProjectName = () => rejectedTimeoutPromise();
      stubs.getProjectItems = () => resolvePromise(itemData);
      stubs.getProjectRelationships = () => resolvePromise(relationshipData);
      stubs.getProjectItemTypeImages = () => resolvePromise(imageData);
      stubs.getRelationshipTypeNames = () => rejectedErrorPromise();
      newGraph = new Graph(projectId, url).buildGraph();
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectItems', () => {
      stubs.getProjectName = () => resolvePromise(nameData);
      stubs.getProjectItems = () => rejectedTimeoutPromise();
      stubs.getProjectRelationships = () => resolvePromise(relationshipData);
      stubs.getProjectRelationshipTypeNames = () => resolvePromise(imageData);
      stubs.getRelationshipTypeNames = () => resolvePromise(edgeNameData);
      newGraph = new Graph(projectId, url).buildGraph();
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectRelationships', () => {
      stubs.getProjectName = () => resolvePromise(nameData);
      stubs.getProjectItems = () => resolvePromise(itemData);
      stubs.getProjectRelationships = () => rejectedTimeoutPromise();
      stubs.getProjectItemTypeImages = () => resolvePromise(imageData);
      stubs.getRelationshipTypeNames = () => resolvePromise(edgeNameData);
      newGraph = new Graph(projectId, url).buildGraph();
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectName and getProjectItems',
      () => {
        stubs.getProjectName = () => rejectedTimeoutPromise();
        stubs.getProjectItems = () => rejectedTimeoutPromise();
        stubs.getProjectRelationships = () => resolvePromise(relationshipData);
        stubs.getProjectItemTypeImages = () => resolvePromise(imageData);
        stubs.getRelationshipTypeNames = () => resolvePromise(edgeNameData);
        newGraph = new Graph(projectId, url).buildGraph();
        expect(newGraph.name).to.be.empty();
        expect(newGraph.nodes).to.be.empty();
        expect(newGraph.edges).to.be.empty();
      });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectItems and' +
      'getProjectRelationships', () => {
      stubs.getProjectName = () => resolvePromise(nameData);
      stubs.getProjectItems = () => rejectedTimeoutPromise();
      stubs.getProjectRelationships = () => rejectedTimeoutPromise();
      stubs.getProjectItemTypeImages = () => resolvePromise(imageData);
      stubs.getRelationshipTypeNames = () => resolvePromise(edgeNameData);
      newGraph = new Graph(projectId, url).buildGraph();
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for getProjectName and' +
      'getProjectRelationships', () => {
      stubs.getProjectName = () => rejectedTimeoutPromise();
      stubs.getProjectItems = () => resolvePromise(itemData);
      stubs.getProjectRelationships = () => rejectedTimeoutPromise();
      stubs.getProjectItemTypeImages = () => resolvePromise(imageData);
      stubs.getRelationshipTypeNames = () => resolvePromise(edgeNameData);
      newGraph = new Graph(projectId, url).buildGraph();
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when a timeout has occurred for all three helper functions', () => {
      stubs.getProjectName = () => rejectedTimeoutPromise();
      stubs.getProjectItems = () => rejectedTimeoutPromise();
      stubs.getProjectRelationships = () => rejectedTimeoutPromise();
      stubs.getProjectItemTypeImages = () => rejectedTimeoutPromise();
      stubs.getRelationshipTypeNames = () => rejectedTimeoutPromise();
      newGraph = new Graph(projectId, url).buildGraph();
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });

    it('should return a graph that contains nothing when an error not including timeout is encountered', () => {
      stubs.getProjectName = () => rejectedErrorPromise();
      stubs.getProjectItems = () => rejectedErrorPromise();
      stubs.getProjectRelationships = () => rejectedErrorPromise();
      stubs.getProjectItemTypeImages = () => rejectedErrorPromise();
      stubs.getRelationshipTypeNames = () => rejectedErrorPromise();
      newGraph = new Graph(projectId, url).buildGraph();
      expect(newGraph.name).to.be.empty();
      expect(newGraph.nodes).to.be.empty();
      expect(newGraph.edges).to.be.empty();
    });
  });

  describe('toJson function', () => {
    let badNodes = [{'id': '10', 'documentKey': 1, 'name': 'item name', 'type': '99'}];
    let badEdges = [{'id': '10', 'source': '1', 'target': '2', 'type': '99'}];
    let nodes = [{'id': 10, 'documentKey': 'docKey', 'name': 'item name', 'type': 99, 'image': 'url', description: 'desc'}];
    let edges = [{'id': 10, 'source': 1, 'target': 2, 'type': 99, 'suspect': true, 'name': 'edge name'}];

    it('should print an error message if the data Graph contains is invalid', () => {
      let graph = new Graph();
      graph.nodes = badNodes;
      graph.edges = badEdges;
      expect(graph.toJson()).to.be.empty();
    });

    it('should return a valid relationship graph json object if Graph contains valid data', () => {
      let graph = new Graph(1, 'url');
      graph.nodes = nodes;
      graph.edges = edges;
      expect(graph.toJson()).to.not.be.empty();
    });
  });

  describe('fromJson function', () => {
    let badNodes = [{'id': '10', 'documentKey': 1, 'name': 'item name', 'type': '99'}];
    let badEdges = [{'id': '10', 'source': '1', 'target': '2', 'type': '99'}];
    let nodes = [{'id': 10, 'documentKey': 'docKey', 'name': 'item name', 'type': 99, 'image': 'url', 'description': 'desc'}];
    let edges = [{'id': 10, 'source': 1, 'target': 2, 'type': 99, 'suspect': false, 'name': 'edge name'}];

    it('should print an error message if the data Graph contains is invalid', () => {
      let relGraphObj = {'items': badNodes, 'relationships': badEdges};
      expect(Graph.fromJson(relGraphObj)).to.be.null;
    });

    it('should return a valid relationship graph json object if graph contains valid data', () => {
      let graph = new Graph(1, 'url');
      graph.nodes = nodes;
      graph.edges = edges;
      let relGraphBlob = {name: 'test', 'items': nodes, 'relationships': edges};
      let newGraph = Graph.fromJson(relGraphBlob);
      expect(newGraph.nodes).to.deep.equal(nodes);
      expect(newGraph.edges).to.deep.equal(edges);
    });
  });
});
