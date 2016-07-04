/* eslint-env mocha */

var chai = require('chai');
var expect = chai.expect;
var dirtyChai = require('dirty-chai');
var proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

//  function to create an array of size N
function arrayOfSizeN (n) {
  let array = [];
  for (let i = 0; i < n; i += 1) {
    array.push(i);
  }
  return array;
}

//  function to create a page {meta: {startIndex, resultCount}, data: []}} of size N
function pageArrayOfSizeN (n) {
  let array = [];
  for (let i = 0; i < n; i += 1) {
    array.push({meta: {startIndex: 0, resultCount: 0}, data: []});
  }
  return array;
}

  //  function to create an array with all returned data items from all pages
function arrayOfPageData (resolvedObjects) {
  let array = [];
  for (let i = 0; i < numOfPages; i += 1) {
    let dataSize = resolvedObjects[i].size;
    for (let j = 0; j < dataSize; j += 1) {
      array.push(resolvedObjects[i].data[j]);
    }
  }
  return array;
}

//  function to set the startAt, maxResults values
function setStartAtAndMaxResults (newstartAt, newmaxResults) {
  startAt = newstartAt;
  maxResults = newmaxResults;
}

//  variables to be used for testing more than a single page of results
let page = 0;
let numOfPages = 0;
let processedResults = 0;
let startAt = 0;
let maxResults = 20;
let totalResults = 45;

//  Set up a page with the appropriate meta and data according to processed results, startAt, maxResults
function setUpPage (item) {
  item.meta.startIndex = processedResults || startAt;
  let size = maxResults < 20 ? maxResults : 20;
  let remaining = totalResults - processedResults;
  if (remaining < 20) {
    size = remaining;
  } else {
    size = maxResults || 20;
  }
  item.data = arrayOfSizeN(size);
  item.meta.resultCount = size;
  processedResults += size;
  return item;
}

describe('Pagination Module', function () {
  'use strict';

  describe('Pagination Function', function () {
    let pagination;

    //  Test #1: username is invalid
    //  returned promise from pagination should be rejected
    it('should reject if the username is invalid', function () {
      setStartAtAndMaxResults(0, 20);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://notdummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.rejected();
    });
    //  Test #2: password is invalid
    //  returned promise from pagination should be rejected
    it('should reject if the password is invalid', function () {
      setStartAtAndMaxResults(0, 20);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:invalidPassword@sevensource.jamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.fulfilled();
    });
    //  Test #3: URL contains a typo (is invalid)
    //  returned promise from pagination should be rejected
    it('should reject if the URL is invalid', function () {
      setStartAtAndMaxResults(0, 20);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensourcejamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.rejected();
    });
    //  Test #4: startAt value is invalid (less than zero)
    //  returned promise from pagination should be rejected
    it('should reject if the startAt value is invalid (less than zero)', function () {
      setStartAtAndMaxResults(-1, 20);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensourcejamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.rejected();
    });
    //  Test #5: maxResults value is invalid (less than 0)
    //  returned promise from pagination should be rejected
    it('should reject if the maxResults value is invalid (less than 0)', function () {
      setStartAtAndMaxResults(0, -1);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensourcejamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.rejected();
    });
    //  Test #6: valid URL, startAt, and maxResults is 0
    //  returned promise from pagination should be resolved with no data
    it('should return an empty page when URL is valid, startAt is valid, and maxResults is 0 ', function () {
      setStartAtAndMaxResults(0, 0);
      let resolvedObject = {
        data: [],
        meta: {startIndex: startAt, resultCount: maxResults}
      };
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback(null, resolvedObject);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.fulfilled().and.to.equal({});
    });
    //  Test #7: valid URL, startAt, and maxResults is less than maximum allowed (20)
    //  returned promise from pagination should be valid and equal to resolvedObject
    it('should return page(s) of less than 20 items when URL is valid, startAt is valid, maxResults is less than 20, and there are results to retrieve', function () {
      setStartAtAndMaxResults(0, 3);
      let resolvedObject = {
        data: [],
        meta: {startIndex: startAt, resultCount: maxResults}
      };
      resolvedObject.data = arrayOfSizeN(3);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback(null, resolvedObject);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.fulfilled().and.to.equal(resolvedObject);
    });
    //  Test #8: valid URL, startAt, and maxResults is greater than maximum allowed (20)
    //  returned promise from pagination should be valid and equal to resolvedObject
    it('should return page(s) when URL is valid, startAt is valid, and maxResults is greater than maximum allowed (20), and there are 20 results to retrieve ', function () {
      setStartAtAndMaxResults(0, 50);
      let resolvedObject = {
        data: [],
        meta: {startIndex: 0, resultCount: 20}
      };
      resolvedObject.data = arrayOfSizeN(20);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback(null, resolvedObject);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.fulfilled().and.to.equal(resolvedObject);
    });
    //  Test #9: valid URL, startAt, maxResults is <= 20, and there are less than maxResults results
    //  returned promise from pagination should be valid and equal to resolvedObject
    it('should return a page of results when URL is valid, startAt is valid, maxResults <= 20, and there are < 20 results to retrieve ', function () {
      setStartAtAndMaxResults(0, 20);
      let resolvedObject = {
        data: [],
        meta: {startIndex: 0, resultCount: 3}
      };
      resolvedObject.data = arrayOfSizeN(3);
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback(null, resolvedObject);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.fulfilled().and.to.equal(resolvedObject);
    });
    //  Test #11: valid URL, startAt, maxResults, retrieving more than a single page of results
    //  returned promise from pagination should be valid and equal to resolvedObject
    setStartAtAndMaxResults(0, 20);
    it('should return 2 full page(s), and another half page of results when URL, startAt, and maxResults are valid, and there are' +
        '45 total results to retrieve', function () {
      startAt = 0;
      maxResults = 20;
      numOfPages = Math.floor(totalResults / maxResults);
      numOfPages += totalResults % maxResults === 0 ? 0 : 1;
      let resolvedObjects = pageArrayOfSizeN(numOfPages);
      //  map the resolvedObjects array to reflect 45 total results, with maximum of 20 results per page.
      resolvedObjects.map(setUpPage);
      for (let i = 0; i < numOfPages; i += 1) {
        console.log('b: meta: ' + resolvedObjects[i].meta);
        console.log('b: data: ' + resolvedObjects[i].data);
      }
      let requestStub = function (options, callback) {
        let callBackObject = resolvedObjects[page];
        process.nextTick(function () {
          callback(null, callBackObject);
          page += 1;
          callBackObject = resolvedObjects[page];
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      // expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.fulfilled.and.to.equal(resolvedObjects[numOfPages - 1].data);
      expect(pagination('http://dummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt, maxResults)).to.eventually.be.fulfilled.and.to.equal(arrayOfPageData(resolvedObjects));
    });
    //  Test #12: Valid URL, startAt, maxResults and there are over million pages to retrieve.
    //  returned promise from pagination should be valid and equal to resolvedObject
  });
});
