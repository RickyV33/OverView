/* eslint-env mocha */

let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;

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

  it('should render the content of index ejs', function (done) {
    chai.request(server)
      .get('/')
      .end(function (err, res, body) {
        // Render the view using ejs
        let path = join(__dirname, '../views/index.ejs');
        let data = { title: 'Jama Software Capstone' };
        let rendHtml = ejs.compile(read(path, 'utf8'), {filename: path})(data);

        // Response rendered html
        let respHtml = res.text;

        expect(err).to.be.null;
        expect(respHtml).to.be.equal(rendHtml);
        done();
      });
  });
});

