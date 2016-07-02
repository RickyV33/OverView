/* eslint-env mocha */

var chai = require('chai');
var expect = chai.expect;
var dirtyChai = require('dirty-chai');
var proxyquire = require('proxyquire');
var chaiAsPromised = require('chai-as-promised');

var auth = require('../../lib/auth');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

describe('Auth module', function () {
  'use strict';
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
      password: 'dumber',
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
    let stubs = { resolvedPromise: resolvedPromise, rejectPromise: rejectedPromise };
    let auth;

    if (username && password && teamName) {
      it('should return true when all credentials are valid', function () {
        auth = proxyquire('../../lib/auth', { './pagination': stubs.resolvedPromise });
        expect(auth.authenticate(username, password, teamName)).to.be.fulfilled();
      });
    } else {
      it('should return false when all credentials are invalid', function () {
        auth = proxyquire('../../lib/auth', { './pagination': stubs.resolvedPromise });
        expect(auth.authenticate(username, password, teamName)).to.be.rejected();
      });
    }
  });
});
