/* eslint-env mocha */
'use strict';

let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../../app');

// For routes test
let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;

chai.use(chaiHttp);

describe('Validation for the Project Endpoint', function () {
  it('should return a status of 200', function () {
    chai.request(server)
      .get('/projects')
      .end(function (err, res) {
        expect(err).to.be.null();
        expect(res).to.have.status(200);
      });
  });

  it('should render the contents of the projects endpoint', function (done) {
    chai.request(server)
      .get('/projects')
      .end(function (err, res, body) {
        // Render the view using ejs
        let path = join(__dirname, '../../views/projects.ejs');
        // This data below has to match the view data variables being passed by
        // routes/projects.js
        let data = { title: 'Jama Software Capstone' };
        let rendHtml = ejs.compile(read(path, 'utf8'), {filename: path})(data);
        let respHtml = res.text;   // Response rendered html

        expect(err).to.be.null();
        expect(respHtml).to.be.equal(rendHtml);
        done();
      });
  });
});
