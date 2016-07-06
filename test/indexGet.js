/* eslint-env mocha */

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let expect = chai.expect;

chai.use(chaiHttp);

describe('index GET', function () {
  it('should list ALL content on index with status of 200', function (done) {
    chai.request(server)
      .get('/')
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();
      });
  });
});

