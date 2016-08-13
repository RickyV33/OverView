/* eslint-env mocha */
'use strict';

let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../../app');

let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;

chai.use(chaiHttp);

describe('projects', () => {
  describe.skip('get request', () => {
    // Test #1: verify projects list view is rendered successfully as is documented in views/projects.ejs
    it('should render successfully with status 200', (done) => {
      let path, data, renderedView;
      chai.request(server)
            .post('/')
            .send({teamName: 'sevensource', username: 'dummy', password: 'password'})
            .end((err, res) => {
              if (err) {
                console.log(err);
              }
              expect(res).to.have.status(200);
              expect(res).to.redirect();
              expect(res).to.have.property('text');
              path = join(__dirname, '../../views/projects.ejs');
              // TODO need to test with actual data once "Gather projects" story is completed
              data = {title: 'Projects', projects: null};
              renderedView = ejs.compile(read(path, 'utf8'), {filename: path})(data);
              expect(res.text).to.equal(renderedView);
              done();
            });
    });
  });
});
