'use strict';
let request = require('request');

const PAGE_SIZE = 20;

function pagination (baseUrl, startAt, maxResults) {
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
          if (response.body.meta.status !== 'OK' || error) {
            reject(error);
          } else {
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
