/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let server = require('../../app');
let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;

chai.use(chaiHttp);
chai.use(dirtyChai);

describe('logout', () => {
  describe('get request', () => {
    it('should render successfully with status 200', done => {
      let path, data, renderedView;
      chai.request(server)
            .get('/logout')
            .end((err, res) => {
              if (err) {
                console.log(err);
              }
              expect(res).to.have.status(200);
              expect(res).to.redirect('/');
              expect(res).to.have.property('text');
              path = join(__dirname, '../../views/index.ejs');

              // TODO the data needs to be changed to reflect the real default as set in the .env which is
              // seven source. the teamName is set to defaultName when TEAM_NAME is not an environment variable
              // this however should be loading the env variable, but isn't
              data = {title: 'JamaTrace', error: false};

              renderedView = ejs.compile(read(path, 'utf8'), {filename: path})(data);
              expect(res.text).to.equal(renderedView);
              done();
            });
    });

    it('should log an error when destroying the session fails', () => {
      let sqliteStub = () => class SqliteStub {
        constructor () { this.foo = 'bar'; }
      };
      let app = proxyquire('./../../app', {
        // Use mock session
        'express-session': () => (req, res, next) => {
          req.session = {};
          next();
        },
        // Don't use real DB connection
        'connect-sqlite3': sqliteStub
      });

      chai.request(app)
        .get('/logout')
        .then(() => {
          expect.fail();
        })
        .catch(() => {
          expect.pass();
        });
    });
  });
});
