/* eslint-env mocha */

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('index GET', function () {
  it('should list ALL content on / GET with status of 200', function (done) {
    chai.request(server)
      .get('/')
      .end(function (err, res) {
        should.equal(err, null);
        res.should.have.status(200);
        done();
      });
  });
});

