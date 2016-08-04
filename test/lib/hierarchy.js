/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');
let mockHierarchy = require('./mockHierarchy.json');
let rewire = require('rewire');
let variables = rewire('../../lib/hierarchy.js');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

let hierarchy = null;
let mergeChildren = null;
let data = null;
let mergedChildren = [];
let username = 'invalidUsername';
let password = 'invalidPassword';
let teamName = 'invalidTeamName';
let projectId = 0;

let rejectedPromise = () => {
  return new Promise((resolve, reject) => {
    process.nextTick(function () {
      reject(data);
    });
  });
};

let resolvedPromise = () => {
  return new Promise((resolve, reject) => {
    process.nextTick(function () {
      resolve(data);
    });
  });
};

let mergeChildrenStub = () => {
  let children = hierarchy.children;


};

let pushChildrenStub = () => {

};

describe('Hierarchy Module', function () {

  describe('getAllItems function', function () {
    it('should return a rejected promise when the login credentials are invalid',
      function () {
        projectId = 99;
        data = 'Invalid login credentials';
        hierarchy = proxyquire('../../lib/hierarchy', {'./pagination': rejectedPromise});
        return (expect(hierarchy.getAllItems(username, password, teamName, projectId))
          .to.eventually.be.rejected()).then((item) => {
            expect(item).to.equal(data);
          });
      });
    it('should return a rejected promise when the login credentials are valid, but projectId is invalid',
      function () {
        projectId = 1000;
        data = 'Invalid project ID';
        hierarchy = proxyquire('../../lib/hierarchy', {'./pagination': rejectedPromise});
        return (expect(hierarchy.getAllItems(username, password, teamName, projectId))
          .to.eventually.be.rejected()).then((item) => {
            expect(item).to.equal(data);
          });
      });
    it('should return an empty JSON blob when login credentials and projectId are valid',
      function () {
        projectId = 33;
        data = {};
        hierarchy = proxyquire('../../lib/hierarchy', {'./pagination': resolvedPromise});
        return (expect(hierarchy.getAllItems(username, password, teamName, projectId))
          .to.eventually.be.fulfilled()).then((item) => {
            expect(item).to.equal(data);
          });
      });
    it('should return a valid JSON blob with one item and one sub item ' +
      'when login credentials and projectId are valid, and the project contains one item and one sub item',
      function () {
        projectId = 33;
        data = {'name': 'first item', 'children': {'name': 'sub item of first item', 'children': {}}};
        hierarchy = proxyquire('../../lib/hierarchy', {'./pagination': resolvedPromise});
        return (expect(hierarchy.getAllItems(username, password, teamName, projectId))
          .to.eventually.be.fulfilled()).then((item) => {
            expect(item).to.equal(data);
          });
      });
  });
  describe.skip('parseItemHierarchy function', function() {
    describe('parseItemHierarchy function', function() {
      it('should return an empty array when the json blob argument is empty', function () {
        let results = [];
        projectId = 33;
        /*hierarchy = proxyquire('../../lib/hierarchy', {
          'mergeChildren': mergeChildrenStub,
          'pushChildrenToRoots': pushChildrenStub,
          'children': results
        });*/
        let blob = variables.parseItemHierarchy(mockHierarchy);
        expect(variables.__get__('children')).to.equal([]);
      });
    });
  });
  describe('mergeChildren function', function() {
    it('should result in children array being empty as their aren\'t any items in the array', function () {
      data = [];
      mergeChildren = [];
      hierarchy = rewire('../../lib/hierarchy');
      hierarchy.__set__('children', data);
      hierarchy.mergeChildren();
      expect(hierarchy.__get__('children')).to.deep.equal(mergeChildren);
    });
    it('should result in children array containing the same data from before, since there are no parent items' +
      'in the children array', function () {
      data = [
        {
          'id': 2115,
          'type': 31,
          'name': 'Parent: requirements',
          'parent': 33,
          'children': [],
        },
        {
          'id': 2117,
          'type': 35,
          'name': 'Parent: epics',
          'parent': 33,
          'children': []
        }
      ];
      mergeChildren = data;
      hierarchy = rewire('../../lib/hierarchy');
      hierarchy.__set__('children', data);
      hierarchy.mergeChildren();
      expect(hierarchy.__get__('children')).to.deep.equal(mergeChildren);
    });
    it('should result in children array having all children items in the children array into ' +
      'their parents arrya of children', function () {
        data = [{
          'id': 2115,
          'type': 31,
          'name': 'Parent: requirements',
          'parent': 33,
          'children': [],
          },
          {
            'id': 2116,
            'type': 34,
            'name': 'child of requirements',
            'parent': 2115,
            'children': []
          },
          {
            'id': 2117,
            'type': 35,
            'name': 'Parent: epics',
            'parent': 33,
            'children': []
          },
          {
            'id': 2118,
            'type': 39,
            'name': 'child of epics',
            'parent': 2117,
            'children': []
          }
        ];
        mergedChildren = [
          {'id': 2115,
            'type': 31,
            'name': 'Parent: requirements',
            'parent': 33,
            'children': [
              {'id': 2116,
              'type': 34,
              'name': 'child of requirements',
              'parent': 2115,
              'children': []}
            ]
          },
          {
            'id': 2116,
            'type': 34,
            'name': 'child of requirements',
            'parent': 2115,
            'children': []
          },
          {
            'id': 2117,
            'type': 35,
            'name': 'Parent: epics',
            'parent': 33,
            'children': [
              {'id': 2118,
                'type': 39,
                'name': 'child of epics',
                'parent': 2117,
                'children': []}
            ]
          },
          {
            'id': 2118,
            'type': 39,
            'name': 'child of epics',
            'parent': 2117,
            'children': []
          }
        ];
        hierarchy = rewire('../../lib/hierarchy');
        hierarchy.__set__('children', data);
        hierarchy.mergeChildren();
        expect(hierarchy.__get__('children')).to.deep.equal(mergedChildren);
      });
  });
});
