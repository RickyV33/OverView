/* eslint-env mocha */
let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiHttp = require('chai-http');
let chaiPromise = require('chai-as-promised');
let mocha = require('mocha');

chai.use(dirtyChai);
chai.use(chaiHttp);
chai.use(chaiPromise);

describe('in index/routes ', function () {
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
  describe('router.post function', function () {
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
        it('should return false when any form field is invalid username is: <' + fixture.username + '> password is: <' +
          fixture.password + '> team name is: <' + fixture.teamName + '>.', function () {
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
