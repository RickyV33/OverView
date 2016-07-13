/* eslint-env mocha */

let chai = require('chai');
// let should = chai.should;
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../../app');
// let ejs = require('ejs');
// let read = require('fs').readFileSync;
// let join = require('path').join;

chai.use(chaiHttp);

describe('projects GET', function () {
  let testCases = [
    {title: "Select a project: "}
  ];

  // Test #1: verify projects list view is rendered successfully with status code 200
  it('should render successfully with status 200', function (done) {
    chai.request(server).get('/projects').end(function (err, res) {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      done();
    });
  });
});
