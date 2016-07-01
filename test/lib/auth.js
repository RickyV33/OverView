/* eslint-env mocha */

var chai = require('chai');
var expect = chai.expect;
var dirtyChai = require('dirty-chai');

var auth = require('../../lib/auth');

chai.use(dirtyChai);

describe('Auth module', function () {
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

    it('should return false when all required fields are empty', function () {
      credentialsFixture.body.username = '';
      credentialsFixture.body.password = '';
      credentialsFixture.body.teamName = '';
      expect(auth.validate(credentialsFixture)).to.be.false();
    });

    it('should return false when username is valid, password is empty, and team name is empty ', function () {
      credentialsFixture.body.username = 'dummy';
      credentialsFixture.body.password = '';
      credentialsFixture.body.teamName = '';
      expect(auth.validate(credentialsFixture)).to.be.false();
    });

    it('should return false when password is valid, username is empty, and team name is empty', function () {
      credentialsFixture.body.username = '';
      credentialsFixture.body.password = 'dummyy';
      credentialsFixture.body.teamName = '';
      expect(auth.validate(credentialsFixture)).to.be.false();
    });

    it('should return false when team name is valid, username is empty, and password is empty', function () {
      credentialsFixture.body.username = '';
      credentialsFixture.body.password = '';
      credentialsFixture.body.teamName = 'dummy';
      expect(auth.validate(credentialsFixture)).to.be.false();
    });

    it('should return false when username is valid, password is valid, and team name is empty', function () {
      credentialsFixture.body.username = 'dummy';
      credentialsFixture.body.password = 'password';
      credentialsFixture.body.teamName = '';
      expect(auth.validate(credentialsFixture)).to.be.false();
    });
  });
});
