/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');
let auth = require('../../lib/auth');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

describe('Auth module', () => {
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
  describe('validate function', () => {
    let credentialsFixture = {
      body: {}
    };

    beforeEach(() => {
      credentialsFixture = {
        body: {}
      };
    });

    credentialFixtureCases.forEach(fixture => {
      let baseMessage = 'should return false when a username is ';
      let username = fixture.username ? 'valid' : 'empty';
      let password = fixture.password ? 'valid' : 'empty';
      let teamName = fixture.teamName ? 'valid' : 'empty';

      if (fixture.username && fixture.password && fixture.teamName) {
        it('should return true when all required fields are valid', () => {
          credentialsFixture.body = fixture;
          expect(auth.validate(credentialsFixture)).to.be.true();
        });
      } else if (!fixture.username && !fixture.password && !fixture.teamName) {
        it('should return false when all required fields are empty', () => {
          credentialsFixture.body = fixture;
          expect(auth.validate(credentialsFixture)).to.be.false();
        });
      } else {
        it(baseMessage + username + ', password is ' + password + ', and team name is ' + teamName, () => {
          credentialsFixture.body = fixture;
          expect(auth.validate(credentialsFixture)).to.be.false();
        });
      }
    });

    function stringOfLengthN (length) {
      let string = '';
      for (let i = 0; i < length; i += 1) {
        string += 'a';
      }
      return string;
    }

    it('should return false when username length is more than 200', () => {
      credentialFixtureCases.filter(fixture => {
        return fixture.username;
      }).forEach(fixture => {
        fixture.username = stringOfLengthN(201);
        credentialsFixture.body = fixture;
        expect(auth.validate(credentialsFixture)).to.be.false();
      });
    });

    it('should return false when password length is more than 200', () => {
      credentialFixtureCases.filter(fixture => {
        return fixture.password;
      }).forEach(fixture => {
        fixture.password = stringOfLengthN(201);
        credentialsFixture.body = fixture;
        expect(auth.validate(credentialsFixture)).to.be.false();
      });
    });

    it('should return false when password length is less than 6', () => {
      credentialFixtureCases.filter(fixture => {
        return fixture.password;
      }).forEach(fixture => {
        fixture.password = stringOfLengthN(5);
        credentialsFixture.body = fixture;
        expect(auth.validate(credentialsFixture)).to.be.false();
      });
    });
  });

  describe('authenticate function', () => {
    let username = 'dummy';
    let password = 'password';
    let teamName = 'sevensource';
    let resolvedPromise = () => {
      return new Promise((resolve, reject) => {
        let payload = [ { status: 200 } ];
        resolve(payload);
      });
    };
    let rejectedPromise = () => {
      return new Promise((resolve, reject) => {
        let payload = [ { status: 401 } ];
        reject(payload);
      });
    };
    it('should return a resolved promise when all credentials are valid', () => {
      auth = proxyquire('../../lib/auth', { './pagination': resolvedPromise });
      expect(auth.authenticate(username, password, teamName)).to.be.fulfilled();
    });
    it('should return a rejected promise when all credentials are invalid', () => {
      auth = proxyquire('../../lib/auth', { './pagination': rejectedPromise });
      expect(auth.authenticate(username, password, teamName)).to.be.rejected();
    });
  });
});
