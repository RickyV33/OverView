/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

let startAt = 0;
let maxResults = 20;

let rejectedPromise = (data) => {
  return new Promise((resolve, reject) => {
    reject(data);
  });
};

let resolvedPromise = (data) => {
  return new Promise((resolve, reject) => {
    resolve(data);
  });
};

function buildURL(username, password, teamName, projectId) {
  return 'https://' + username + ':' + password + '@' + teamName +
    '.jamacloud.com/rest/latest/items?project=' + projectId;
}

describe('Hierarchy Module', function () {
  let url = 'url';
  let pagination;
  let projectId = 0;

  describe('getAllItems function', function () {
    it('should return a rejected promise when the login credentials are invalid', function () {
      projectId = 99;
      url = buildURL('invalidusername', 'invalid password', 'invalid teamName', projectId);
      pagination = proxyquire('../../lib/pagination', {'Promise': rejectedPromise('Invalid login credentials')});
      expect(pagination(url, startAt, maxResults)).to.eventually.be.rejected().and.to.equal('Invalid login credentials');
    });
    it('should return a rejected promise when the login credentials are valid, but projectId is invalid',
      function () {
        projectId = 1000;
        url = buildURL('dummy', 'password', 'sevensource', projectId);
        pagination = proxyquire('../../lib/pagination', {'Promise': rejectedPromise('Project ID invalid')});
        expect(pagination(url, startAt, maxResults)).to.eventually.be.rejected().and.to.equal('Project ID invalid');
      });
    it('should return an empty JSON blob when login credentials and projectId are valid',
      function () {
        projectId = 33;
        url = buildURL('dummy', 'password', 'sevensource', projectId);
        pagination = proxyquire('../../lib/pagination', {'Promise': resolvedPromise({})});
        expect(pagination(url, startAt, maxResults)).to.eventually.be.rejected().and.to.equal({});
      });
  });
});
