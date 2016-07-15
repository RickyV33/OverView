/* eslint-env mocha */

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiHttp = require('chai-http');
let chaiPromise = require('chai-as-promised');
let mocha = require('mocha');
let server = require('../../app.js');
let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;

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
      chai.request(server)
            .get('/')
            .end(function (err, res) {
              if (err) {
                expect.fail(); // ('Index Page Failed.');
              }
              // Render the view using ejs
              let path = join(__dirname, '../../views/index.ejs');
              let data = { title: 'Jama Software Capstone' };
              let rendHtml = ejs.compile(read(path, 'utf8'), {filename: path})(data);

              // Response rendered html
              let respHtml = res.text;

              expect(res).to.have.property('text');
              expect(err).to.be.null;
              expect(respHtml).to.be.equal(rendHtml);
              done();
            });
    });
  });

  describe('post request', function () {
    'use strict';

    let authStub = function (user, pass, team) {
      'use strict';

      return new Promise(function (resolve, reject) {
        let proj = 'projects';
        process.nextTick(function () {
          if (user && pass && team) {
            resolve(proj);
          } else {
            reject();
          } });
      });
    };
    let valStub = function (req) {
      return (req.body.username && req.body.password && req.body.teamName);
    };

    let stubs = { 'authenticate': authStub, 'validate': valStub };
    let index = proxyquire('../../routes/index', {'../lib/auth': stubs});

    credentialFixtureCases.forEach(function (fixture) {
      if (fixture.username && fixture.password && fixture.teamName) {
        it('should return true when all form fields are valid', function () {
          expect(chai.request('http://localhost:3000')
              .post('/')
              .send({ username: fixture.username, password: fixture.password, teamName: fixture.teamName })).to.redirect();
        });
      } else {
        it('should return false when any form field is invalid username is, "' + fixture.username + '" password is, "' +
            fixture.password + '" team name is, "' + fixture.teamName + '".', function () {
          chai.request('http://localhost:3000')
                .post('/')
                .send({ username: fixture.username, password: fixture.password, teamName: fixture.teamName }).end(function (res) {
                  expect(res).to.have.status(200);
                  mocha.done();
                });
        });
      }

      chai.request(index)
              .post('/')
              .field('username', fixture.username)
              .field('password', fixture.password)
              .field('teamName', fixture.teamName);
    });
  });
});
