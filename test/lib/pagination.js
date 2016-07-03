/* eslint-env mocha */

var chai = require('chai');
var expect = chai.expect;
var dirtyChai = require('dirty-chai');
var proxyquire = require('proxyquire');
var pagination = require('../../lib/pagination');

chai.use(dirtyChai);

describe('Pagination Module', function () {
  'use strict';

  describe('Pagination Function', function () {
    let paginate;
    it('should reject the promise if the username is invalid', function () {
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      paginate = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://notdummy:password@sevensource.jamacloud.com/rest/latest/projects', 0, 0)).to.be.False();
    });
    it('should reject the promise if the password is invalid', function () {
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      paginate = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(pagination('http://dummy:invalidPassword@sevensource.jamacloud.com/rest/latest/projects', 0, 0)).to.be.False();
    });
    it('should reject the promise if the URL is invalid', function () {
      let requestStub = function (options, callback) {
        process.nextTick(function () {
          callback('this is an error');
        });
      };
      paginate = proxyquire('../../lib/pagination', { 'request': requestStub });
      expect(paginate.pagination('http://dummy:password@sevensourcejamacloud.com/rest/latest/projects', 0, 0)).to.be.false();
    });
       /* function arrayOfSizeN(n){
            let array = [];
            for (let i = 0; i < n; i += 1) {
                array.push();
            }
            return array;
        }*/
  });
});
