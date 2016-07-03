/* eslint-env mocha */

let chai = require('chai');
let should = chai.should;
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../app.js');

chai.use(chaiHttp);

describe.skip('Index Page', function () {
  it('should contain a property called text', function (done) {
    // This makes a server request to the route location '/'
    chai.request(server).get('/').end(function (err, res) {
      if (err) {
        should.fail('Index Page Failed.');
      }
      expect(res).to.have.property('text');
      done();
    });
  });
});
