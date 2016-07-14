/* eslint-env mocha */

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');

chai.use(dirtyChai);

describe('Graph class module', function () {
  // let spec = {
  //   '$schema': 'http://json-schema.org/draft-04/schema#',
  //   'title': 'Graph',
  //   'type': 'object',
  //   'properties': {
  //     'items': {
  //       'type': 'array',
  //       'items': {
  //         'title': 'Item',
  //         'type': 'object',
  //         'properties': {
  //           'id': { 'type': 'integer' },
  //           'name': { 'type': 'string' },
  //           'type': { 'type': 'integer' }
  //         }
  //       },
  //       'required': ['id', 'name', 'type']
  //     },
  //     'relationships': {
  //       'type': 'array',
  //       'items': {
  //         'title': 'Relationship',
  //         'type': 'object',
  //         'properties': {
  //           'id': { 'type': 'integer' },
  //           'fromItem': { 'type': 'integer' },
  //           'toItem': { 'type': 'integer' },
  //           'type': { 'type': 'integer' }
  //         }
  //       },
  //       'required': ['id', 'fromItem', 'toItem', 'type']
  //     }
  //   },
  //   'required': ['items', 'relationships']
  // };
  //
  // let mock = {
  //   'items': [
  //     {
  //       'id': 10,
  //       'name': 'User Login Home Page',
  //       'type': 99
  //     },
  //     {
  //       'id': 11,
  //       'name': 'Input a Username',
  //       'type': 24
  //     },
  //     {
  //       'id': 12,
  //       'name': 'Input a Password',
  //       'type': 24
  //     },
  //     {
  //       'id': 13,
  //       'name': 'Input a TeamName',
  //       'type': 24
  //     }
  //   ],
  //   'relationships': [
  //     {
  //       'id': 1,
  //       'fromItem': 11,
  //       'toItem': 10,
  //       'type': 6 // derived from
  //     },
  //     {
  //       'id': 2,
  //       'fromItem': 12,
  //       'toItem': 10,
  //       'type': 6 // derived from
  //     },
  //     {
  //       'id': 3,
  //       'fromItem': 13,
  //       'toItem': 10,
  //       'type': 6 // derived from
  //     }
  //   ]
  // };

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
        console.log('IN PROJECT NAME STUB');
        return resolvedNamePromise();
      };
      stubs.getProjectItems = () => {
        console.log('IN PROJECT ITEMS STUB');
        return resolvedItemsPromise();
      };
      stubs.getProjectRelationships = () => {
        console.log('IN PROJECT REL STUB');

        return resolvedRelationshipsPromise();
      };
      let newGraph = new Graph(projectId, url);
      setTimeout(function () {
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
});
