/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiAsPromised = require('chai-as-promised');
let chaiHttp = require('chai-http');
let proxyquire = require('proxyquire');
let mockHierarchy = require('./mockHierarchy.json');

chai.use(dirtyChai);
chai.use(chaiHttp);
chai.use(chaiAsPromised);

let app;
let hierarchyStub;
let libStub;

/**
 * Setup the proxies used to start the server and access the hierarchy route to stub out lib/hierarchy modules with:
 * {getAllItems} stub to return a resolved promise with the mockHierarchy.json
 * {parseItemHierarchy} stub to return the object's itemHierarchy array
 *
 * mockApp.js will be used instead of the actual app to start the server
 *
 * @param {Object} object that contains pre-formatted item hierarchy object with a title and items. This will be one
 * of every one of the hierarchyTestCases body below.
 */
function initializeRoute (object) {
  libStub = {
    getAllItems: (username, password, teamName, projectId) => {
      return new Promise((resolve, reject) => {
        process.nextTick(() => {
          resolve(mockHierarchy);
        });
      });
    },
    parseItemHierarchy: (allItemsArray) => {
      return object.itemHierarchy;
    }
  };
  hierarchyStub = proxyquire('../../routes/hierarchy', {
    '../lib/hierarchy': libStub
  });
  app = proxyquire('./mockApp', {
    '../../routes/hierarchy': hierarchyStub
  });
}

let hierarchyTestCases = [
  {testcase: 'should render an empty item hierarchy tree', body: {
    title: 'Empty item hierarchy tree (no root items)',
    itemHierarchy: []}},

  {testcase: 'should render an item hierarchy tree with one item with no children', body: {
    title: 'Single root item with no children',
    itemHierarchy: [{name: 'Root Item', children: []}]}},

  {testcase: 'should render an item hierarchy with one rooted item containing a single child', body: {
    title: 'Single root item with one child',
    itemHierarchy: [{name: 'Root Item', children: [{name: 'single child', children: []}]}]}},

  {testcase: 'should render an item heirarchy with one rooted item containing multiple children', body: {
    title: 'Single root item with mulitple children',
    itemHierarchy: [{name: 'Root Item', children:
      [{name: 'child one', children: []}, {name: 'child two', children: []}]}]}},

  {testcase: 'should render an item hierarchy with one rooted item containing a nested child', body: {
    title: 'Single root item with one nested child',
    itemHierarchy: [{name: 'Root Item', children:
      [{name: 'single child',
        children: [{name: 'nested child', children: []}]}]}]}},

  {testcase: 'should render an item hierarchy with multiple rooted items with no children', body: {
    title: 'Mulitple root items with no children',
    itemHierarchy: [{name: 'Root Item 1', children: []}, {name: 'Root item 2', children: []}]}},

  {testcase: 'should render an item hierarchy with multiple rooted items with no children', body: {
    title: 'Multiple items with children',
    itemHierarchy: [{name: 'Root Item 1', children: [{name: 'Sub root item 1', children: []}]},
      {name: 'Root Item 2', children: [{name: 'Sub root item 2', children: []}]}]}},

  {testcase: 'should render an item hierarchy with multiple rooted items with children', body: {
    title: 'Multiple root items with multiple children',
    itemHierarchy:
      [{name: 'Root item 1',
        children: [{name: 'Root 1 Child 1', children: []}, {name: 'Root 1 Child 1', children: []}]},
        {name: 'Root item 2',
          children: [{name: 'Root 2 Child 1', children: []}, {name: 'Root 2 Child 2', children: []}]}]}},

  {testcase: 'should render an item hierarchy with multiple rooted items with nested items', body: {
    title: 'Multiple root items with one nested child',
    itemHierarchy:
      [{name: 'Root item 1',
        children: [{name: 'Root 1 Child 1', children: []}, {name: 'Root 1 Child 1',
          children: [{name: 'Nested child of root 1', children: []}]}]},
        {name: 'Root item 2',
          children: [{name: 'Root 2 Child 1', children: []}, {name: 'Root 2 Child 2',
            children: [{name: 'Nested child of root 2', children: []}]}]}]}}
];

describe('hierarchy', () => {
  describe('GET /hierarchy', () => {
    hierarchyTestCases.forEach(item => {
      it(item.testcase, () => {
        initializeRoute(item.body);
        return chai.request(app)
          .get('/hierarchy?project=33')
          .then(res => {
            expect(res.body).to.deep.equal(item.body.itemHierarchy);
          })
          .catch(err => {
            throw (err);
          });
      });
    });
  });
});
