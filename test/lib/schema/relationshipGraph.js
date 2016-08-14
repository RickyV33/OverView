/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiAsPromised = require('chai-as-promised');
let Ajv = require('ajv');
let schema = require('../../../lib/schema/relationshipGraph');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

Ajv = new Ajv();
Ajv.addSchema(schema, 'graphSchema');
let validate = Ajv.compile(schema);
let validJSON = false;

describe('Relationship Graph JSON', () => {
  // Failing test cases for relationship graph JSON
  let failingTestCases = [
      // test cases for items missing a field [id, name, type, image]
      {title: 'should return false for empty json', body: {}},
      {title: 'should return false when id field is missing from an item',
          body: {items: [{name: 'story', type: 35, image: 'url'}, {id: 2, name: 'req', type: 35}],
              relationships: [{id: 1, source: 1, target: 2, type: 36}]}},
      {title: 'should return false when name field is missing from an item',
          body: {items: [{id: 1, type: 35, image: 'url'}, {id: 2, name: 'req', type: 35}],
              relationships: [{id: 1, source: 1, target: 2, type: 36}]}},
      {title: 'should return false when type field is missing from an item',
          body: {items: [{id: 1, name: 'story', image: 'url'}, {id: 2, name: 'req', type: 35}],
              relationships: [{id: 1, source: 1, target: 2, type: 36}]}},
      {title: 'should return false when image field is missing from an item',
        body: {items: [{id: 1, name: 'story', type: 35}, {id: 2, name: 'req', type: 35}],
          relationships: [{id: 1, source: 1, target: 2, type: 36}]}},
      // Test cases for relationships missing a field [id, source, target, type, suspect]
      {title: 'should return false when id field is missing from a relationship',
          body: {items: [{id: 1, name: 'story', type: 35, image: 'url'}, {id: 2, name: 'req', type: 35}],
              relationships: [{source: 1, target: 2, type: 36, suspect: false}]}},
      {title: 'should return false when source is missing from a relationship',
          body: {items: [{id: 1, name: 'story', type: 35, image: 'url'}, {id: 2, name: 'story', type: 35}],
              relationships: [{id: 1, target: 2, type: 36, suspect: false}]}},
      {title: 'should return false when target is missing from a relationship',
          body: {items: [{id: 1, name: 'story', type: 35, image: 'url'}, {id: 2, name: 'story', type: 35}],
              relationships: [{id: 1, source: 1, type: 36}]}},
      {title: 'should return false when type is missing from a relationship',
          body: {items: [{id: 1, name: 'story', type: 35, image: 'url'}, {id: 2, name: 'story', type: 35}],
              relationships: [{id: 1, source: 1, target: 2, suspect: false}]}},
      {title: 'should return false when suspect is missing from a relationship',
        body: {items: [{id: 1, name: 'story', type: 35, image: 'url'}, {id: 2, name: 'story', type: 35}],
          relationships: [{id: 1, source: 1, target: 2, type: 33}]}},
      // test cases for JSON that do not contain required properties [items, relationships]
      {title: 'should return false when items property is missing from JSON blob',
          body: {relationships: [{id: 1, source: 1, target: 2, type: 36, suspect: false}]}},
      {title: 'should return false when relationships property is missing from JSON blob',
          body: {items: [{id: 1, name: 'story', type: 35, image: 'url'}, {id: 2, name: 'story', type: 35, suspect: false}]}},
      // test case for duplicate items
      {title: 'should return false when JSON contains duplicate items',
          body: {items: [{id: 1, name: 'story', type: 35, image: 'url'}, {id: 1, name: 'story', type: 35}],
              relationships: [{id: 1, source: 1, target: 2, type: 36, suspect: false}]}}
  ];
  // Passing test cases for relationship graph JSON
  let passingTestCases = [
      {title: 'should return true when JSON contains at least 1 item and at least 1 relationship',
          body: {items: [{id: 34, name: 'story', type: 35, image: 'url'}],
              relationships: [{id: 1, source: 34, target: 35, type: 35, suspect: false}]}},
      {title: 'should return true when JSON contains many items and many relationships with valid properties',
          body: {items: [{id: 34, name: 'story', type: 35, image: 'url'}, {id: 1, name: 'story', type: 35, image: 'url'},
            {id: 2, name: 'req', type: 36, image: 'url'}, {id: 3, name: 'story', type: 35, image: 'url'},
            {id: 4, name: 'story', type: 35, image: 'url'}, {id: 5, name: 'req', type: 36, image: 'url'},
            {id: 6, name: 'epic', type: 34, image: 'url'}],
       relationships: [{id: 1, source: 6, target: 2, type: 37, suspect: false}, {id: 2, source: 6, target: 5, type: 37, suspect: false},
           {id: 3, source: 2, target: 1, type: 38, suspect: false}, {id: 4, source: 5, target: 4, type: 38, suspect: false},
           {id: 5, source: 5, target: 3, type: 38, suspect: false}, {id: 6, source: 4, target: 3, type: 39, suspect: false}]}}
  ];
  // Validating all incorrect JSON are rejected
  failingTestCases.forEach(item => {
    it(item.title, () => {
      validJSON = validate(item.body);
      expect(validJSON).to.be.false();
    });
  });
  // Validating all correct JSON are accepted
  passingTestCases.forEach(item => {
    it(item.title, () => {
      validJSON = validate(item.body);
      expect(validJSON).to.be.true();
    });
  });
});
