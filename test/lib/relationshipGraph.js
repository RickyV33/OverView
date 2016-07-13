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
      {items: [{name: 'story', type: 35}, {id: 35, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 34, toItem: 35, type: 35}]},
      {items: [{id: 34, type: 35}, {id: 35, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 34, toItem: 35, type: 35}]},
      {items: [{id: 34, name: 'story'}, {id: 35, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 34, toItem: 35, type: 35}]},
      {items: [{id: 34, name: 'story'}, {id: 35, name: 'req', type: 35}], relationships: [{fromItem: 34, toItem: 35, type: 35}]},
      {items: [{id: 34, name: 'story'}, {id: 35, name: 'req', type: 35}], relationships: [{id: 1, toItem: 35, type: 35}]},
      {items: [{id: 34, name: 'story', type: 35}, {id: 35, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 34, type: 35}]},
      {items: [{id: 34, name: 'story', type: 35}, {id: 35, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 34, toItem: 35}]}
      // {items: [{id: 34, name: 'story', type: 35}, {id: 35, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 35, toItem: 35, type: 35}]}
  ];

  // Passing test cases for relationship graph JSON
  let passingTestCases = [
      {items: [{id: 34, name: 'story', type: 35}, {id: 35, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 34, toItem: 35, type: 35}]}
  ];

  // Validating all incorrect JSON are rejected
  failingTestCases.forEach(function (item) {
    it('should return false when all required fields are valid', function () {
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
