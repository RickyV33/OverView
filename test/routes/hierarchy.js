/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiPromise = require('chai-as-promised');
let express = require('express');
let request = require('supertest');
let app = express();
let router = express.Router();
let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;
let path = join(__dirname, '../../views/hierarchy.ejs');

chai.use(dirtyChai);
chai.use(chaiPromise);
chai.use(chaiPromise);

function initializeRoute (object) {
  router.get('/hierarchy', function (req, res) {
   // let rendHtml = ejs.compile(read(path, 'utf8'), {filename: path})(object);
    res.status(200).send(ejs.compile(read(path, 'utf8'), {filename: path})(object));
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

describe('hierarchy', function () {
  describe('GET /hierarchy', function () {
    hierarchyTestCases.forEach(function (item) {
      it(item.testcase, function (done) {
        initializeRoute(item.body);
        app.use(router);
        request(app)
          .get('/hierarchy')
          .end(function (err, res) {
            if (err) {
              return done(err);
            } else {
              let rendHtml = ejs.compile(read(path, 'utf8'), {filename: path})(item.body);
              expect(res).to.have.property('text');
              expect(res.status).to.equal(200);
              expect(res.text).to.be.equal(rendHtml);
            }
          });
        done();
      });
    });
  });
});
