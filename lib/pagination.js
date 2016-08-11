'use strict';
let request = require('request');

const PAGE_SIZE = 20;

/**
 * Requests to the Jama API are paginated, so this function collects a set of paged data, beginning at a
 * given page from a given endpoint into an array of response data. Collection continues until either the
 * end of the paged data is reached or the number of items collected is equal to a given number of maximum
 * results, whichever comes first.
 *
 * @param baseUrl Endpoint that data is pulled from
 * @param startAt Index within span of the Jama collection to start at. Defaults to zero (e.g To start at
 * the tenth item, pass 10)
 * @param maxResults Maximum number of items to collect in the array of response data
 * @returns {Promise} If resolved, an array containing all of data from the pages is returned. Else, an
 * error object is returned.
 */
function pagination (baseUrl, startAt = 0, maxResults = Number.MAX_SAFE_INTEGER) {
  return new Promise(function (resolve, reject) {
    let payload = [];
    let resultCount = -1;
    let counter = 0;

    // Recursively retrieves all the pages and stores them in payload
    function getPages (baseUrl, start, max) {
      ++counter;
      if (resultCount === 0) {
        resolve(payload);
      } else {
        let maxResultsParam = 'maxResults=' + PAGE_SIZE;
        let startAtParam = 'startAt=' + start;
        let url;
        if (baseUrl.indexOf('?') !== -1) {
          url = baseUrl + '&' + startAtParam + '&' + maxResultsParam;
        } else {
          url = baseUrl + '?' + startAtParam + '&' + maxResultsParam;
        }
        request({url: url, json: true}, function (error, response, body) {
          if (response.statusCode !== 200 || error) {
            // The non-200 response needs to be made into an error before it may be rejected as an error
            if (!error) {
              error = {'statusCode': response.statusCode, 'status': response.body.meta.status};
            }
            reject(error);
          } else {
            // When only a single item is returned from Jama, it is not stored in a list (handled by else case)
            if (response.body.data instanceof Array) {
              response.body.data.forEach(function (item) {
                if (payload.length < max) {
                  payload.push(item);
                }
              });
              let pageInfo = response.body.meta.pageInfo;
              start = pageInfo.startIndex + PAGE_SIZE;
              resultCount = (payload.length <= max) ? pageInfo.resultCount : 0;
              return getPages(baseUrl, start, max);
            } else {
              payload.push(response.body.data);
              resolve(payload);
            }
          }
        });
      }
    }

    getPages(baseUrl, startAt, maxResults);
  });
}

module.exports = pagination;
