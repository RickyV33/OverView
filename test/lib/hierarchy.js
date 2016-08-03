/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

let pagination = null;
let startAt = 0;
let maxResults = 20;
let data = '';
let username = 'invalidUsername';
let password = 'invalidPassword';
let teamName = 'invalidTeamName';
let projectId = 0;

let rejectedPromise = () => {
  process.nextTick(function () {
    return new Promise((resolve, reject) => {
      reject(data);
    });
  });
}
  /*process.nextTick(function (options, callback) {
     callback(null, new Promise((resolve, reject) => {
      reject(data);
    }));
  });*/
//};

let resolvedPromise = () => {
  return new Promise((resolve, reject) => {
    resolve(data);
  });
};

describe('Hierarchy Module', function () {


  describe('getAllItems function', function () {
  //     this.timeout(15000);
    it('should return a rejected promise when the login credentials are invalid', function () {
  //         this.timeout(15000);
    //       setTimeout(done, 15000);
      projectId = 99;
      data = 'Invalid login credentials';
      pagination = proxyquire('../../lib/hierarchy', {'./pagination': rejectedPromise});
      expect(pagination.getAllItems(username, password, teamName, projectId))
        .to.be.rejected();
      }); //.equal(undefined);
        //.to.eventually.be.rejected().and.to.equal('Invalid login credentials');
    xit('should return a rejected promise when the login credentials are valid, but projectId is invalid',
      function () {
        projectId = 1000;
        data = 'Invalid project ID';
        pagination = proxyquire('../../lib/pagination', {'Promise': rejectedPromise});
        return expect(pagination.getAllItems(username, password, teamName, projectId))
          .to.eventually.be.rejected().and.to.equal('Invalid project ID');
      });
    xit('should return an empty JSON blob when login credentials and projectId are valid',
      function () {
        projectId = 33;
        data = {};
        pagination = proxyquire('../../lib/pagination', {'Promise': resolvedPromise});
        return expect(pagination.getAllItems(username, password, teamName, projectId))
          .to.eventually.be.rejected().and.to.equal({});
      });
  });
});
