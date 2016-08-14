/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiAsPromised = require('chai-as-promised');
let app = require('../../app'); // express();
// let router = express.Router();
let chaiHttp = require('chai-http');
// let proxyquire = require('proxyquire');

let mockHierarchy = require('../lib/mockHierarchy.json');

chai.use(dirtyChai);
chai.use(chaiHttp);
chai.use(chaiAsPromised);

let testModule;
/*
let username = 'invalid';
let password = 'invalid';
let teamName = 'invalid';
let projectId = 1000;
*/

function initializeRoute (object) {
  // testModule = rewire('../../routes/hierarchy');
 // testModule.__set__('hierachy'), () => {
  testModule = () => {
    testModule.getAllItems(() => {
      return new Promise((resolve, reject) => {
        process.nextTick(() => {
          resolve(mockHierarchy);
        });
      });
    });
    testModule.parseItemHierarchy(() => {
      return object.itemHierarchy;
    });
  /* router.get('/hierarchy', function (req, res) {
    testModule.getAllItems(username, password, teamName, projectId).then(allItems => {
      let results = testModule.parseItemHierarchy(allItems);
      res.json(results);
    });
  });*/
  };
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
  //  let link;
    hierarchyTestCases.forEach(item => {
      it(item.testcase, () => {
        initializeRoute(item.body);
  //      link = proxyquire('../../routes/hierarchy', {
  //        './hierarchy': testModule
  //      });
        chai.request(app)
        //   app.use(router);
     //   request(app)
          .get('./hierarchy')
          .end((err, res) => {
            if (err) {
              throw (err);
            } else {
              expect(res).to.deep.equal(item.body);
            }
          });
      });
    });
  });
});
