/* eslint-env mocha */

'use strict';

var chai = require('chai');
var expect = chai.expect;
var dirtyChai = require('dirty-chai');
var proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

// variables to be used for testing within all rejected request stubs
let startAt = 0;

// variables to be used for testing within all resolved request stubs
let page = 0;

/**
 * Create an array of n elements of type integer from 0 to counter - 1. Return this array of n elements
 *
 * @param {integer} n size of the desired array
 * @param {integer} counter determines the maximum value for data pushed into the array.
 * @return {Object} array the array is either empty, or it contains the elements from 0 to counter - 1
 */
function arrayOfSizeN (n, counter) {
  let array = [];
  for (let i = 0; i < n; i += 1) {
    array.push(counter);
    counter += 1;
  }
  return array;
}

/**
 * Create an array of paged objects and store them into an array of size n. A page consists of an object in the
 * following format: {meta: {startIndex, resultCount}, data: []}}.
 *
 * @param {integer} n size of the desired array
 * @return {Object} array of n page objects
 */
function pageArrayOfSizeN (n) {
  let array = [];
  for (let i = 0; i < n; i += 1) {
    array.push({statusCode: 200, body: {meta: {pageInfo: {startIndex: 0, resultCount: 0}}, data: []}});
  }
  return array;
}

/**
 * Iterate through each object in resolvedObjects, and push every item in each object's body array into
 * the array variable. After every item has been pushed into the array, return this array.
 *
 * @param {Object} resolvedObjects array of page objects with arrays of data
 * @return {Object} array of all data items within resolvedObjects
 */
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

/**
 * Request stub to be used when a request needs to be mocked as being rejected. It returns a callback with an error
 * message on the next tick, mocking a failed request to Jama's REST api.
 *
 * @return {Object} callback that returns with an error message to indicate a failed request
 */
let rejectedRequestStub = (error = 'this is an error', status = {statusCode: 200}) => {
  return (options, callback) => {
    process.nextTick(() => {
      callback(error, status);
    });
  };
};

/**
 * Create an object with the format {body: {meta: {pageInfo: startIndex, resultCount: resultingCount}},
 * data: dataSupplied}}.
 *
 * @param {integer} startingIndex the starting index for the page object
 * @param {integer} resultingCount the resulting count of retrieved items for the page object
 * @param {integer} dataSupplied the data for the page object
 * @return {Object} a page object
 */
function createResolvedObject (startingIndex, resultingCount, dataSupplied) {
  return {body: {meta: {pageInfo: {startIndex: startingIndex, resultCount: resultingCount}}, data: dataSupplied}};
}

/**
 * Request stub to be used when a request needs to be mocked as being fulfilled with pages of data. It returns an
 * array of page objects on the next tick, mocking a successful request to Jama's REST api.
 *
 * Variables used:
 * {startAt} starting index value for each page object
 * {resolvedObjects} to be returned
 * {remaining} initially set to totalResults argument, will be decremented by the number of items added to each new
 * page object that is pushed into resolvedObjects
 * {processedResults} the number of items that have been added to a page object that will then be returned
 * {pageSize} the size of the page being constructed will depend on how many items remain to be added to a page
 * object. If the remaining items are less than the maxResults per page variable, then it is set to remaining,
 * otherwise it is set to maxResults
 * {counter} keeps track of the values used for each page object's data
 * {maxItemsPerPage} if the maximum number of items per page is less than 20, then it is set to the maxResults
 * argument, otherwise it is set to 20
 *
 * Mock an array of paged objects (that will then be passed back one at a time to mock
 * multiple requests) by first calculating the total number of pages needed by totalResults/maxResults. Then, create
 * that many page objects with a starting index of how many items have been processed, and pageSize number of items
 * added to its body array. Continue adding pages until remaining is equal to zero.
 *
 *
 * @param {integer} totalResults number of requested results
 * @param {integer} maxResults is the maximum number of results requested per page, will default to 20 if argument
 * is greater than 20
 * @return {Object} resolvedObjects an array of pages
 */
function resolvedRequest (totalResults, maxResults) {
  let startAt = 0;
  let resolvedObjects = [];
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

describe('Pagination Module', () => {
  'use strict';

  describe('Pagination Function', () => {
    let pagination;

    //  Test #1: username is invalid
    //  returned promise from pagination should be rejected
    it('should reject if the username is invalid', () => {
      pagination = proxyquire('../../lib/pagination', { 'request': rejectedRequestStub() });
      return expect(pagination('http://notdummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt,
        Number.MAX_SAFE_INTEGER)).to.eventually.be.rejected();
    });
    //  Test #2: password is invalid
    //  returned promise from pagination should be rejected
    it('should reject if the password is invalid', () => {
      pagination = proxyquire('../../lib/pagination', { 'request': rejectedRequestStub() });
      return expect(pagination('http://dummy:invalidPassword@sevensource.jamacloud.com/rest/latest/projects', startAt,
        Number.MAX_SAFE_INTEGER)).to.eventually.be.rejected();
    });
    //  Test #3: URL contains a typo (is invalid)
    //  returned promise from pagination should be rejected
    it('should reject if the URL is invalid', () => {
      pagination = proxyquire('../../lib/pagination', { 'request': rejectedRequestStub() });
      return expect(pagination('http://dummy:dummy@sevensourcejamacloud.com/rest/latest/projects', startAt, Number.MAX_SAFE_INTEGER))
        .to.eventually.be.rejected();
    });
    //  Test #4: startAt value is invalid (less than zero)
    //  returned promise from pagination should be rejected
    it('should reject if the startAt value is invalid (less than zero)', () => {
      pagination = proxyquire('../../lib/pagination', { 'request': rejectedRequestStub() });
      return expect(pagination('http://dummy:dummy@sevensourcejamacloud.com/rest/latest/projects', -1, Number.MAX_SAFE_INTEGER))
        .to.eventually.be.rejected();
    });
    //  Test #5: valid URL, startAt, and maxResultsAllowed is 0
    //  returned promise from pagination should be resolved with no data
    it('should return an empty page when URL is valid, startAt is valid, and maxResultsAllowed is 0 ', () => {
      // total results: 0, maximum results per page: 3
      let pages = resolvedRequest(0, 20);
      page = 0;
      let requestStub = (options, callback) => {
        process.nextTick(() => {
          callback(null, pages[page]);
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      return expect(pagination('http://dummy:dummy@sevensource.jamacloud.com/rest/latest/projects', startAt, Number.MAX_SAFE_INTEGER))
        .to.eventually.be.fulfilled().and.to.be.empty();
    });
    //  Test #6: valid URL, startAt, and maxResultsAllowed is less than maximum allowed (20)
    //  returned promise from pagination should be valid and equal to pages' data
    it('should return page(s) of less than 20 items when URL is valid, startAt is valid, maxResultsAllowed is less than' +
      ' 20, and there are results to retrieve', () => {
      // total results: 10, maximum results per page: 3
      let pages = resolvedRequest(10, 3);
      page = 0;
      let requestStub = (options, callback) => {
        process.nextTick(() => {
          callback(null, pages[page]);
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      return expect(pagination('http://dummy:dummy@sevensource.jamacloud.com/rest/latest/projects', startAt, Number.MAX_SAFE_INTEGER))
        .to.eventually.be.fulfilled().and.to.have.lengthOf(arrayOfPageData(pages).length).and.to.deep.equal(arrayOfPageData(pages));
    });
    //  Test #7: valid URL, startAt, and maxResultsAllowed is greater than maximum allowed (20)
    //  returned promise from pagination should be valid and equal to pages' data
    it('should return page(s) when URL is valid, startAt is valid, and maxResultsAllowed is greater than maximum ' +
      'allowed (20), and there are 20 results to retrieve ', () => {
      // total results: 50, maximum results per page: 50
      let pages = resolvedRequest(50, 50);
      page = 0;
      let requestStub = (options, callback) => {
        process.nextTick(() => {
          callback(null, pages[page]);
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      return expect(pagination('http://dummy:dummy@sevensource.jamacloud.com/rest/latest/projects', startAt, Number.MAX_SAFE_INTEGER))
        .to.eventually.be.fulfilled().and.to.have.lengthOf(arrayOfPageData(pages).length).and.to.deep.equal(arrayOfPageData(pages));
    });
    //  Test #8: valid URL, startAt, maxResultsAllowed is <= 20, and there are less than maxResultsAllowed results
    // (testing single page result)
    //  returned promise from pagination should be valid and equal to pages' data
    it('should return a single page of results when URL is valid, startAt is valid, maxResultsAllowed <= 20, and ' +
      'there are < 20 results to retrieve ', () => {
      // total results: 10, maximum results per page: 20
      let pages = resolvedRequest(10, 20);
      page = 0;
      let requestStub = (options, callback) => {
        process.nextTick(() => {
          callback(null, pages[page]);
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      return expect(pagination('http://dummy:dummy@sevensource.jamacloud.com/rest/latest/projects', startAt, Number.MAX_SAFE_INTEGER))
        .to.eventually.be.fulfilled().and.to.have.lengthOf(arrayOfPageData(pages).length).and.to.deep.equal(arrayOfPageData(pages));
    });
    //  Test #9: valid URL, startAt, maxResultsAllowed, retrieving more than a single page of results
    //  returned promise from pagination should be valid and equal to pages' data
    it('should return multiple page(s) of results when URL, startAt, and maxResultsAllowed are valid', () => {
      // total results: 130, maximum results per page: 20
      let pages = resolvedRequest(130, 20);
      page = 0;
      let requestStub = (options, callback) => {
        process.nextTick(() => {
          callback(null, pages[page]);
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:dummy@dummy.jamacloud.com/rest/latest/projects', startAt, Number.MAX_SAFE_INTEGER))
        .to.eventually.be.fulfilled().and.to.have.lengthOf(arrayOfPageData(pages).length).and.to.deep.equal(arrayOfPageData(pages));
    });
    it('should append a new query string if the url already contains a query', () => {
      let pages = resolvedRequest(10, 20);
      page = 0;
      let requestStub = (options, callback) => {
        process.nextTick(() => {
          callback(null, pages[page]);
          page += 1;
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      return expect(pagination('http://dummy:dummy@sevensource.jamacloud.com/rest/latest/items?project=1'))
        .to.eventually.be.fulfilled();
    });
    it('should reject if the status code is not 200', () => {
      let statusCode = {statusCode: 404, body: {meta: {status: 'Not Found'}}};
      pagination = proxyquire('../../lib/pagination', { 'request': rejectedRequestStub('', statusCode) });
      return expect(pagination('http://notdummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt,
        Number.MAX_SAFE_INTEGER)).to.eventually.be.rejected();
    });
    it('should resolve a single page when the response is not an array', () => {
      let pages = resolvedRequest(0, 1);
      pages[0].body.data = 1;
      let requestStub = (options, callback) => {
        process.nextTick(() => {
          callback(null, pages[0]);
        });
      };
      pagination = proxyquire('../../lib/pagination', { 'request': requestStub });
      return expect(pagination('http://notdummy:password@sevensource.jamacloud.com/rest/latest/projects', startAt,
        Number.MAX_SAFE_INTEGER)).to.eventually.be.fulfilled();
    });
  });
});
