/* eslint-env mocha */

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');
let auth = require('../../lib/auth');
let httpMocks = require('node-mocks-http');
let sinon = require('sinon');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

describe('Auth module', function () {
  'use strict';
  let credentialFixtureCases = [
    {
      username: '',
      password: '',
      teamName: '',
      description: 'all fields are empty'
    },
    {
      username: 'dummy',
      password: '',
      teamName: '',
      description: 'username is correct and password/teamname are empty'
    },
    {
      username: '',
      password: 'dumber',
      teamName: '',
      description: 'password is incorrect and username/teamname are empty'
    },
    {
      username: '',
      password: '',
      teamName: 'dummy',
      description: 'teamname is incorrect and password/username are empty'
    },
    {
      username: 'dummy',
      password: 'password',
      teamName: '',
      description: 'username is incorrect and password/teamname are empty'
    },
    {
      username: '',
      password: 'password',
      teamName: 'sevensource',
      description: 'username is empty'
    },
    {
      username: 'dummy',
      password: '',
      teamName: 'sevensource',
      description: 'username is incorrect and password is empty'
    },
    {
      username: 'dummy',
      password: 'password',
      teamName: 'sevensource',
      description: 'all fields are valid'
    }
  ];
  describe('validate function', function () {
    'use strict';
    let credentialsFixture = {
      body: {}
    };

    beforeEach(function () {
      credentialsFixture = {
        body: {}
      };
    });

    credentialFixtureCases.forEach(function (fixture) {
      let baseMessage = 'should return false when a username is ';
      let username = fixture.username ? 'valid' : 'empty';
      let password = fixture.password ? 'valid' : 'empty';
      let teamName = fixture.teamName ? 'valid' : 'empty';

      if (fixture.username && fixture.password && fixture.teamName) {
        it('should return true when all required fields are valid', function () {
          credentialsFixture.body = fixture;
          expect(auth.validate(credentialsFixture)).to.be.true();
        });
      } else if (!fixture.username && !fixture.password && !fixture.teamName) {
        it('should return false when all required fields are empty', function () {
          credentialsFixture.body = fixture;
          expect(auth.validate(credentialsFixture)).to.be.false();
        });
      } else {
        it(baseMessage + username + ', password is ' + password + ', and team name is ' + teamName, function () {
          credentialsFixture.body = fixture;
          expect(auth.validate(credentialsFixture)).to.be.false();
        });
      }
    });

    function stringOfLengthN (length) {
      'use strict';
      let string = '';
      for (let i = 0; i < length; i += 1) {
        string += 'a';
      }
      return string;
    }

    it('should return false when username length is more than 200', function () {
      credentialFixtureCases.filter(function (fixture) {
        return fixture.username;
      }).forEach(function (fixture) {
        fixture.username = stringOfLengthN(201);
        credentialsFixture.body = fixture;

        expect(auth.validate(credentialsFixture)).to.be.false();
      });
    });

    it('should return false when password length is more than 200', function () {
      credentialFixtureCases.filter(function (fixture) {
        return fixture.password;
      }).forEach(function (fixture) {
        fixture.password = stringOfLengthN(201);
        credentialsFixture.body = fixture;

        expect(auth.validate(credentialsFixture)).to.be.false();
      });
    });

    it('should return false when password length is less than 6', function () {
      credentialFixtureCases.filter(function (fixture) {
        return fixture.password;
      }).forEach(function (fixture) {
        fixture.password = stringOfLengthN(5);
        credentialsFixture.body = fixture;

        expect(auth.validate(credentialsFixture)).to.be.false();
      });
    });
  });

  describe('authenticate function', function () {
    'use strict';
    let username = 'dummy';
    let password = 'password';
    let teamName = 'sevensource';
    let resolvedPromise = function () {
      return new Promise(function (resolve, reject) {
        let payload = [ { status: 200 } ];
        resolve(payload);
      });
    };
    let rejectedPromise = function () {
      return new Promise(function (resolve, reject) {
        let payload = [ { status: 401 } ];
        reject(payload);
      });
    };
    let auth;

    it('should return a resolved promise when all credentials are valid', function () {
      auth = proxyquire('../../lib/auth', { './pagination': resolvedPromise });
      expect(auth.authenticate(username, password, teamName)).to.be.fulfilled();
    });
    it('should return a rejected promise when all credentials are invalid', function () {
      auth = proxyquire('../../lib/auth', { './pagination': rejectedPromise });
      expect(auth.authenticate(username, password, teamName)).to.be.rejected();
    });
  });

  describe('isAuthenticated function', () => {
    credentialFixtureCases.forEach(function (fixture) {
      let credentialsFixture = {
        session: {},
        body: {}
      };
      credentialsFixture.session = fixture;
      credentialsFixture.body = fixture;
      auth = proxyquire('../../lib/auth', {
        './isServerAuthenticated': isServerAuthenticatedStub
      });

      let callback = sinon.spy();
      let req = httpMocks.createRequest();
      let res = httpMocks.createResponse();

      req.session = {};
      req.body = {};
      req.session.username = fixture.username;
      req.session.password = fixture.password;
      req.session.teamName = fixture.teamName;
      req.session.isAuthenticated = false;
      req.body.username = fixture.username;
      req.body.password = fixture.password;
      req.body.teamName = fixture.teamName;

      if (fixture.name === 'dummy' && fixture.password === 'password' && fixture.teamName === 'sevensource') {
        it('should return true when ' + fixture.description, function (done) {
          auth.isAuthenticated(req, res, callback);
          expect(req.session.isAuthenticated).to.be.true();
          done();
        });
      } else {
        it('should be false when ' + fixture.description, function (done) {
          auth.isAuthenticated(req, res, callback);
          expect(req.session.isAuthenticated).to.be.false();
          done();
        });
      }
    });

    function isServerAuthenticatedStub (username, password, teamName) {
      return (username === 'dummy' && password === 'password' && teamName === 'sevensource');
    }
  });
});
