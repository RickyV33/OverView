/* eslint-env mocha */

var chai = require('chai');
var expect = chai.expect;
var dirtyChai = require('dirty-chai');
var proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

function arrayOfSizeN (n) {
  let array = [];
  for (let i = 0; i < n; i += 1) {
    array.push(i);
  }
  return array;
}

describe('Pagination Module', function () {
  'use strict';

  describe('Pagination Function', function () {
    let pagination;

    //  Test #1: username is invalid
    //  returned promise from pagination should be rejected
    it('should reject if the username is invalid', function () {
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://notdummy:password@sevensource.jamacloud.com/rest/latest/projects', 0, 0)).to.eventually.be.rejected();
    });
    //  Test #2: password is invalid
    //  returned promise from pagination should be rejected
    it('should reject if the password is invalid', function () {
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:invalidPassword@sevensource.jamacloud.com/rest/latest/projects', 0, 0)).to.eventually.be.fulfilled();
    });
    //  Test #3: URL contains a typo (is invalid)
    //  returned promise from pagination should be rejected
    it('should reject if the URL is invalid', function () {
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensourcejamacloud.com/rest/latest/projects', 0, 0)).to.eventually.be.rejected();
    });
    //  Test #4: startAt value is invalid (less than zero)
    //  returned promise from pagination should be rejected
    it('should reject if the startAt value is invalid (less than zero)', function () {
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensourcejamacloud.com/rest/latest/projects', -1, 0)).to.eventually.be.rejected();
    });
    //  Test #5: maxResults value is invalid (less than 0)
    //  returned promise from pagination should be rejected
    it('should reject if the maxResults value is invalid (less than 0)', function () {
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensourcejamacloud.com/rest/latest/projects', 0, -1)).to.eventually.be.rejected();
    });
    //  Test #6: valid URL, startAt, and maxResults is 0
    //  returned promise from pagination should be resolved with no data
    it('should return an empty page when URL is valid, startAt is valid, and maxResults is 0 ', function () {
      let resolvedObject = {
        data: [],
        meta: {startIndex: 0, resultCount: 0}
      };
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback(resolvedObject);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', 0, 0)).to.eventually.equal({});
    });
    //  Test #7: valid URL, startAt, and maxResults is less than maximum allowed (20)
    //  returned promise from pagination should be valid and equal to resolvedObject
    it('should return page(s) of less than 20 items when URL is valid, startAt is valid, maxResults is less than 20, and there are results to retrieve', function () {
      let resolvedObject = {
        data: [],
        meta: {startIndex: 0, resultCount: 3}
      };
      resolvedObject.data = arrayOfSizeN(3);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback(resolvedObject);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', 0, 3)).to.eventually.equal(resolvedObject);
    });
    //  Test #8: valid URL, startAt, and maxResults is greater than maximum allowed (20)
    //  returned promise from pagination should be valid and equal to resolvedObject
    it('should return page(s) when URL is valid, startAt is valid, and maxResults is greater than maximum allowed (20), and there are results to retrieve ', function () {
      let resolvedObject = {
        data: [],
        meta: {startIndex: 0, resultCount: 20}
      };
      resolvedObject.data = arrayOfSizeN(20);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback(resolvedObject);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', 0, 50)).to.eventually.equal(resolvedObject);
    });
    //  Test #9: valid URL, startAt, maxResults is <= 20, and there are less than maxResults results
    //  returned promise from pagination should be valid and equal to resolvedObject
    it('should return a page of results when URL is valid, startAt is valid, maxResults <= 20, and there are < 20 results to retrieve ', function () {
      let resolvedObject = {
        data: [],
        meta: {startIndex: 0, resultCount: 3}
      };
      resolvedObject.data = arrayOfSizeN(3);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback(resolvedObject);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', 0, 20)).to.eventually.equal(resolvedObject);
    });
    //  Test #10: valid URL, startAt, maxResults is greater than maximum allowed (20), and there are only 20 results
    //  returned promise from pagination should be valid and equal to resolvedObject
    it('should return an empty page when URL is valid, startAt is valid, and maxResults is 0 ', function () {
      let resolvedObject = {
        data: [],
        meta: {startIndex: 0, resultCount: 20}
      };
      resolvedObject.data = arrayOfSizeN(20);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback(resolvedObject);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', 0, 50)).to.eventually.equal(resolvedObject);
    });
    //  Test #11: valid URL, startAt, maxResults, retrieving more than a single page of results
    //  returned promise from pagination should be valid and equal to resolvedObject
    it('should return 1 full page, and another half page of results when URL, startAt, and maxResults are valid, and 40 > total results > 20 ', function () {
      let page = 0;
      let processedResults = 0;
      let startAt = 0;
      let maxResults = 25;
      let resultCount = 0;
      let totalResults = 25;
      let resolvedObjects = [{meta: {startIndex: 0, resultCount: 0}, data: []}];
      resolvedObjects = arrayOfSizeN(2);

      //  Set up a page with the appropriate meta and data according to processed results, startAt, maxResults
      function setUpPage (item) {
        item.meta.startIndex = processedResults || startAt;
        let size = maxResults || 20;
        let remaining = processedResults - totalResults;
        if (remaining > 0) {
          if (remaining < 20) {
            size = remaining;
          } else {
            size = maxResults || 20;
          }
        }
        item.data = arrayOfSizeN(size);
        item.meta.resultCount = size;
        if (resultCount > 0) {
          processedResults = resultCount;
        }
      }
      resolvedObjects.map(setUpPage);
      console.log(resolvedObjects);
      let requestStub = function (options, callback) {
        let callBackObject = resolvedObjects[page];
        process.nextTick(function () {
          callback(callBackObject);
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', 0, 20)).to.eventually.equal(resolvedObjects);
    });
  });
});
