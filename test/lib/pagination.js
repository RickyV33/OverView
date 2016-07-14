/* eslint-env mocha */

var chai = require('chai');
var expect = chai.expect;
var dirtyChai = require('dirty-chai');
var proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

//  function to create an array of size N
function arrayOfSizeN (n, counter) {
  let array = [];
  for (let i = 0; i < n; i += 1) {
    array.push(counter);
    counter += 1;
  }
  return array;
}

//  function to create a page {meta: {startIndex, resultCount}, data: []}} of size N
function pageArrayOfSizeN (n) {
  let array = [];
  for (let i = 0; i < n; i += 1) {
    array.push({body: {meta: {pageInfo: {startIndex: 0, resultCount: 0}}, data: []}});
  }
  return array;
}

  //  function to create an array with all returned data items from all pages
function arrayOfPageData (resolvedObjects) {
  let array = [];
  let numOfPages = resolvedObjects.length;
  for (let i = 0; i < numOfPages; i += 1) {
    let dataSize = resolvedObjects[i].body.data.length;
    for (let j = 0; j < dataSize; j += 1) {
      array.push(resolvedObjects[i].body.data[j]);
    }
  }
  return array;
}

//  variables to be used for testing within all rejected request stubs
let startAt = 0;

// variables to be used for testing within all resolved request stubs
let page = 0;
let maxPossible = Number.MAX_SAFE_INTEGER;

let rejectedRequestStub = function (options, callback) {
  process.nextTick(function () {
    callback('this is an error');
  });
};

function createResolvedObject (startingIndex, resultingCount, dataSupplied) {
  return {body: {meta: {pageInfo: {startIndex: startingIndex, resultCount: resultingCount}}, data: dataSupplied}};
}

function resolvedRequest (totalResults, maxResults) {
  let startAt = 0;
  let resolvedObjects = [];
  // let page = 0;
  let remaining = totalResults;
  let processedResults = 0;
  let pageSize = 0;
  let counter = 0;
  let maxItemsPerPage = maxResults < 20 ? maxResults : 20;

  let pageCount = Math.ceil(totalResults / maxItemsPerPage) + 1;
  resolvedObjects = pageArrayOfSizeN(pageCount);

  for (let i = 0; i < pageCount - 1; i += 1) {
    if (remaining === 0) {
      resolvedObjects.push(createResolvedObject(startAt, 0, []));
    } else {
      pageSize = remaining < maxItemsPerPage ? remaining : maxItemsPerPage;
      resolvedObjects[i].body.meta.pageInfo.resultCount = pageSize;
      resolvedObjects[i].body.meta.pageInfo.startIndex = startAt;
      resolvedObjects[i].body.data = arrayOfSizeN(pageSize, counter);
      processedResults += pageSize;
      remaining = totalResults - processedResults;
      startAt += pageSize;
      counter = processedResults;
    }
  }
  return resolvedObjects;
}

describe('Pagination Module', function () {
  'use strict';

  describe('Pagination Function', function () {
    let pagination;

    //  Test #1: username is invalid
    //  returned promise from pagination should be rejected
    it('should reject if the username is invalid', function () {
      pagination = proxyquire('../../lib/pagination', { 'request': rejectedRequestStub });
      expect(pagination('http://notdummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxPossible)).to.eventually.be.rejected();
    });
    //  Test #2: password is invalid
    //  returned promise from pagination should be rejected
    it('should reject if the password is invalid', function () {
      pagination = proxyquire('../../lib/pagination', { 'request': rejectedRequestStub });
      expect(pagination('http://dummy:invalidPassword@sevensource.jamacloud.com/rest/latest/projects', startAt, maxPossible)).to.eventually.be.fulfilled();
    });
    //  Test #3: URL contains a typo (is invalid)
    //  returned promise from pagination should be rejected
    it('should reject if the URL is invalid', function () {
      pagination = proxyquire('../../lib/pagination', { 'request': rejectedRequestStub });
      expect(pagination('http://dummy:password@sevensourcejamacloud.com/rest/latest/projects', startAt, maxPossible)).to.eventually.be.rejected();
    });
    //  Test #4: startAt value is invalid (less than zero)
    //  returned promise from pagination should be rejected
    it('should reject if the startAt value is invalid (less than zero)', function () {
      pagination = proxyquire('../../lib/pagination', { 'request': rejectedRequestStub });
      expect(pagination('http://dummy:password@sevensourcejamacloud.com/rest/latest/projects', -1, maxPossible)).to.eventually.be.rejected();
    });
    //  Test #5: valid URL, startAt, and maxResultsAllowed is 0
    //  returned promise from pagination should be resolved with no data
    it('should return an empty page when URL is valid, startAt is valid, and maxResultsAllowed is 0 ', function () {
      // total results: 0, maximum results per page: 3
      let pages = resolvedRequest(0, 20);
      page = 0;
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          let callBackObject = pages[page].body;
          callback(null, {body: callBackObject});
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxPossible)).to.eventually.be.fulfilled().and.to.equal(arrayOfPageData(pages));
    });
    //  Test #6: valid URL, startAt, and maxResultsAllowed is less than maximum allowed (20)
    //  returned promise from pagination should be valid and equal to pages' data
    it('should return page(s) of less than 20 items when URL is valid, startAt is valid, maxResultsAllowed is less than 20, and there are results to retrieve', function () {
      // total results: 10, maximum results per page: 3
      let pages = resolvedRequest(10, 3);
      page = 0;
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          let callBackObject = pages[page].body;
          callback(null, {body: callBackObject});
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxPossible)).to.eventually.be.fulfilled().and.to.equal(arrayOfPageData(pages));
    });
    //  Test #7: valid URL, startAt, and maxResultsAllowed is greater than maximum allowed (20)
    //  returned promise from pagination should be valid and equal to pages' data
    it('should return page(s) when URL is valid, startAt is valid, and maxResultsAllowed is greater than maximum allowed (20), and there are 20 results to retrieve ', function () {
      // total results: 50, maximum results per page: 50
      let pages = resolvedRequest(50, 50);
      page = 0;
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          let callBackObject = pages[page].body;
          callback(null, {body: callBackObject});
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxPossible)).to.eventually.be.fulfilled().and.to.equal(arrayOfPageData(pages));
    });
    //  Test #8: valid URL, startAt, maxResultsAllowed is <= 20, and there are less than maxResultsAllowed results (testing single page result)
    //  returned promise from pagination should be valid and equal to pages' data
    it('should return a single page of results when URL is valid, startAt is valid, maxResultsAllowed <= 20, and there are < 20 results to retrieve ', function () {
      // total results: 10, maximum results per page: 20
      let pages = resolvedRequest(10, 20);
      page = 0;
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          let callBackObject = pages[page].body;
          callback(null, {body: callBackObject});
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxPossible)).to.eventually.be.fulfilled().and.to.equal(arrayOfPageData(pages));
    });
    //  Test #9: valid URL, startAt, maxResultsAllowed, retrieving more than a single page of results
    //  returned promise from pagination should be valid and equal to pages' data
    it('should return multiple page(s) of results when URL, startAt, and maxResultsAllowed are valid', function () {
      // total results: 130, maximum results per page: 20
      let pages = resolvedRequest(130, 20);
      page = 0;
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          let callBackObject = pages[page].body;
          callback(null, {body: callBackObject});
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxPossible)).to.eventually.be.fulfilled().and.to.equal(arrayOfPageData(pages));
    });
  });
});
