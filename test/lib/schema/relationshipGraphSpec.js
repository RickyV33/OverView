/* eslint-env mocha */
let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiAsPromised = require('chai-as-promised');
let Ajv = require('ajv');

let schema = require('../../../lib/schema/relationshipGraphSpec');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

Ajv = new Ajv();
Ajv.addSchema(schema, 'graphSchema');
let validate = Ajv.compile(schema);
let validJSON = false;

describe('Relatinship Graph JSON', function () {
  // Failing test cases for relationship graph JSON
  let failingTestCases = [
      // test cases for items missing a field [id, name, type]
      {title: 'should return false for empty json', body: {}},
      {title: 'should return false when id field is missing from an item', body: {items: [{name: 'story', type: 35}, {id: 2, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 1, toItem: 2, type: 36}]}},
      {title: 'should return false when name field is missing from an item', body: {items: [{id: 1, type: 35}, {id: 2, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 1, toItem: 2, type: 36}]}},
      {title: 'should return false when type field is missing from an item', body: {items: [{id: 1, name: 'story'}, {id: 2, name: 'req', type: 35}], relationships: [{id: 1, fromItem: 1, toItem: 2, type: 36}]}},
      // test cases for relationships missing a field [id, fromItem, toItem, type]
      {title: 'should return false when id field is missing from a relationship', body: {items: [{id: 1, name: 'story', type: 35}, {id: 2, name: 'req', type: 35}], relationships: [{fromItem: 1, toItem: 2, type: 36}]}},
      {title: 'should return false when fromItem is missing from a relationship', body: {items: [{id: 1, name: 'story', type: 35}, {id: 2, name: 'story', type: 35}], relationships: [{id: 1, toItem: 2, type: 36}]}},
      {title: 'should return false when toItem is missing from a relationship', body: {items: [{id: 1, name: 'story', type: 35}, {id: 2, name: 'story', type: 35}], relationships: [{id: 1, fromItem: 1, type: 36}]}},
      {title: 'should return false when type is missing from a relationship', body: {items: [{id: 1, name: 'story', type: 35}, {id: 2, name: 'story', type: 35}], relationships: [{id: 1, fromItem: 1, toItem: 2}]}},
      // test cases for JSON that do not contain required properties [items, relationships]
      {title: 'should return false when items property is missing from JSON blob', body: {relationships: [{id: 1, fromItem: 1, toItem: 2, type: 36}]}},
      {title: 'should return false when relationships property is missing from JSON blob', body: {items: [{id: 1, name: 'story', type: 35}, {id: 2, name: 'story', type: 35}]}},
      // test case for duplicate items
      {title: 'should return false when JSON contains duplicate items', body: {items: [{id: 1, name: 'story', type: 35}, {id: 1, name: 'story', type: 35}]}}
  ];
  // Passing test cases for relationship graph JSON
  let passingTestCases = [
      {title: 'should return true when JSON contains at least 1 item and at least 1 relationship', body: {items: [{id: 34, name: 'story', type: 35}], relationships: [{id: 1, fromItem: 34, toItem: 35, type: 35}]}},
      {title: 'should return true when JSON contains many items and many relationships with valid properties', body: {items: [{id: 34, name: 'story', type: 35},
        {id: 1, name: 'story', type: 35},
        {id: 2, name: 'req', type: 36},
        {id: 3, name: 'story', type: 35},
        {id: 4, name: 'story', type: 35},
        {id: 5, name: 'req', type: 36},
        {id: 6, name: 'epic', type: 34}],
       relationships: [{id: 1, fromItem: 6, toItem: 2, type: 37},
        {id: 2, fromItem: 6, toItem: 5, type: 37},
        {id: 3, fromItem: 2, toItem: 1, type: 38},
        {id: 4, fromItem: 5, toItem: 4, type: 38},
        {id: 5, fromItem: 5, toItem: 3, type: 38},
        {id: 6, fromItem: 4, toItem: 3, type: 39}]}}
  ];
  // Validating all incorrect JSON are rejected
  failingTestCases.forEach(function (item) {
    it(item.title, function () {
      validJSON = validate(item.body);
      expect(validJSON).to.be.false();
    });
  });
  // Validating all correct JSON are accepted
  passingTestCases.forEach(function (item) {
    it(item.title, function () {
      validJSON = validate(item.body);
      expect(validJSON).to.be.true();
    });
  });
});
