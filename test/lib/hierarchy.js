/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');
let mockHierarchy = require('./mockHierarchy.json');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

let hierarchy = null;
let mergeChildren = null;
let data = null;
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
  describe('parseItemHierarchy function', function() {

    describe('parseItemHierarchy function', function() {
      it('should return an empty array when the json blob argument is empty', function () {
        projectId = 33;
        hierarchy = proxyquire('../../lib/hierarchy', {
          'mergeChildren': mergeChildrenStub,
          'pushChildrenToRoots': pushChildrenStub
        });
        return (expect(hierarchy.parseItemHierarchy(mockHierarchy))
          .to.return()).then((item) => {
        });
      });
    });
  });
});
