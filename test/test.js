/* eslint-env mocha */
// Mocha test example code
// To use the script, make sure to --> npm install -g mocha
// To run tests, run command 'mocha test' or 'mocha <your script name>'

let chai = require('chai');
let should = chai.should;
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../app.js');

chai.use(chaiHttp);

describe('Index Page', function () {
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
