'use strict';
var request = require('request');

function pagination (baseUrl, startAt, maxResults) {
  return new Promise(function (resolve, reject) {
    let payload = [];
    let resultCount = -1;

    while (resultCount !== 0) {
      let maxResultsParam = 'maxResults=' + maxResults;
      let startAtParam = 'startAt=' + startAt;
      let url = baseUrl + '?' + startAtParam + '&' + maxResultsParam;

      request({url: url, json: true}, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          response.data.forEach(function (item) {
            payload.push(item);
          });

          let pageInfo = response.meta.pageInfo;
          startAt = pageInfo.startIndex + maxResults;
          resultCount = pageInfo.resultCount;
        }
      });
    }

    resolve(payload);
    console.log('all page data is: ' + payload);
  });
}

module.exports = pagination;
