/* eslint-env mocha */

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

describe('index', function () {
  let credentialFixtureCases = [
    {
      username: '',
      password: '',
      teamName: ''
    },
    {
      username: 'dummy',
      password: '',
      teamName: ''
    },
    {
      username: '',
      password: 'wrong',
      teamName: ''
    },
    {
      username: '',
      password: '',
      teamName: 'dummy'
    },
    {
      username: 'dummy',
      password: 'password',
      teamName: ''
    },
    {
      username: '',
      password: 'password',
      teamName: 'sevensource'
    },
    {
      username: 'dummy',
      password: '',
      teamName: 'sevensource'
    },
    {
      username: 'dummy',
      password: 'password',
      teamName: 'sevensource'
    }
  ];

  describe('get request', function () {
    it('should contain a property called text', function (done) {
      // This makes a server request to the route location '/'
      chai.request(app)
            .get('/')
            .end(function (err, res) {
              if (err) {
                expect.fail();
              }
              // Render the view using ejs
              let path = join(__dirname, '../../views/index.ejs');
              
              let data = {title: 'JamaTrace', teamName: 'sevensource', error: "false"};
              
              let rendHtml = ejs.compile(read(path, 'utf8'), {filename: path})(data);

              // Response rendered html
              let respHtml = res.text;

              expect(res).to.have.property('text');
              expect(err).to.be.null();
              expect(respHtml).to.be.equal(rendHtml);
              done();
            });
    });
  });

  describe.skip('post request', function () {
    'use strict';

    credentialFixtureCases.forEach(function (fixture) {
      if (fixture.username && fixture.password && fixture.teamName) {
        it('should return true when all form fields are valid', function () {
          return chai.request(app)
            .post('/')
            .send({ username: fixture.username, password: fixture.password, teamName: fixture.teamName }).then(res => {
              expect(res).to.redirect();
            }).catch(err => { throw err; });
        });
      } else {
        it('should return false when any form field is invalid username is, "' + fixture.username + '" password is, "' +
            fixture.password + '" team name is, "' + fixture.teamName + '".', function () {
          return chai.request(app)
                .post('/')
                .send({ username: fixture.username, password: fixture.password, teamName: fixture.teamName }).then(res => {
                  expect(res).to.have.status(200);
                }).catch(err => { throw err; });
        });
      }
    });
  });
});
