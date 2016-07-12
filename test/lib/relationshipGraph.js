/* eslint-env mocha */
let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiAsPromised = require('chai-as-promised');
let Ajv = require('ajv');

let schema = require('../../lib/relationshipGraph');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

Ajv = new Ajv();
Ajv.addSchema(schema, 'graphSchema');
let validate = Ajv.compile(schema);
let validJSON = false;

describe('Relatinship Graph JSON', function () {
  // Failing test cases for relationship graph JSON
  let failingTestCases = [
      {},
      {},
      {},
      {},
      {}
  ];

  // Passing test cases for relationship graph JSON
  let passingTestCases = [
      {},
      {},
      {},
      {},
      {}
  ];

  // Validating all incorrect JSON are rejected
  failingTestCases.forEach(function (item) {
    it('should return true when all required fields are valid', function () {
      validJSON = validate(item);
      expect(validJSON).to.be.false();
    });
  });

  // Validating all correct JSON are accepted
  passingTestCases.forEach(function (item) {
    it('should return true when all required fields are valid', function () {
      validJSON = validate(item);
      expect(validJSON).to.be.true();
    });
  });
});
