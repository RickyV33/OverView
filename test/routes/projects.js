/* eslint-env mocha */

let chai = require('chai');
// let should = chai.should;
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../app');
// let ejs = require('ejs');
// let read = require('fs').readFileSync;
// let join = require('path').join;

chai.use(chaiHttp);

describe('projects GET', function () {
  it('should render projects route with status of 200', function (done) {
    chai.request(server)
    .get('/projects')
    .end(function (err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      done();
    });
  });
});
