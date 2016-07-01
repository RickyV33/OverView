'use strict';
var request = require('request');

function pagination(baseUrl, startAt, maxResults) {
  return new Promise( function (resolve, reject) {
    let payload = [];
    if (maxResults > 50) {
      maxResults = 50;
    }
    while (resultCount != 0) {
      let maxResultsParam = 'maxResults=' + maxResults;
      let resultCount = -1;
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
        console.log('response is: ' + response);
        console.log('body is: ' + body);
      }
    });
  });
}

module.exports = pagination;