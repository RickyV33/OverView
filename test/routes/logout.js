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

describe('logout', () => {
  describe('get request', () => {
    it('should render successfully with status 200', (done) => {
      let path, data, renderedView;
      chai.request(server)
            .get('/logout')
            .end(function (err, res) {
              if (err) {
                console.log(err);
              }
              expect(res).to.have.status(200);
              expect(res).to.redirect('/');
              expect(res).to.have.property('text');
              path = join(__dirname, '../../views/index.ejs');

              data = {title: 'JamaTrace', teamName: 'sevensource', error: false};

              renderedView = ejs.compile(read(path, 'utf8'), {filename: path})(data);
              expect(res.text).to.equal(renderedView);
              done();
            });
    });
  });
});
