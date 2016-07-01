'use strict';
var request = require('request');

function pagination (baseUrl, startAt, maxResults) {
  return new Promise(function (resolve, reject) {
    let payload = [];
    let resultCount = -1;

    while (payload.length < maxResults && resultCount !== 0) {
      let maxResultsParam = 'maxResults=' + 20;
      let startAtParam = 'startAt=' + startAt;
      let url = baseUrl + '?' + startAtParam + '&' + maxResultsParam;

      request({url: url, json: true}, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          response.data.forEach(function (item) {
            if (payload.length < maxResults) {
              payload.push(item);
            }
          });

          let pageInfo = response.meta.pageInfo;
          startAt = pageInfo.startIndex + maxResults;
          resultCount = (payload.length < maxResults) ? pageInfo.resultCount : 0;
        }
      });
    }

    resolve(payload);
    console.log('all page data is: ' + payload);
  });
}

module.exports = pagination;
