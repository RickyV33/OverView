/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiHttp = require('chai-http');
let chaiPromise = require('chai-as-promised');
let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;
let app = require('../../app');

chai.use(dirtyChai);
chai.use(chaiHttp);
chai.use(chaiPromise);

describe('hierarchy', function () {
  describe('get request', function () {
    // This makes a server request to the route location '/hierarchy'
    chai.request(app)
      .get('/hierarchy')
      .end(function (err, res) {
        if (err) {
          expect.fail();
        }
        expect(err).to.be.null();
        it('should contain a property called text', function (done) {
          expect(res).to.have.property('text');
          done();
        });
        it('should have status 200', function (done) {
          expect(res).to.have.status(200);
          done();
        });
        it('should render view with title and unordered list', function (done) {
          // Render the view using ejs
          let path = join(__dirname, '../../views/hierarchy.ejs');
          let data = {title: 'Select a Root Item (Optional) ',
            itemHierarchy: './mockHierarchy.json'};
          let renderedView = ejs.compile(read(path, 'utf8'), {filename: path})(data);
          expect(res.text).to.equal(renderedView);
          done();
        });
      });
  });
});
