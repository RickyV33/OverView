/* eslint-env mocha */

'use strict';

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let chaiAsPromised = require('chai-as-promised');
let Ajv = require('ajv');

let schema = require('../../../lib/schema/itemHierarchy');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

describe('Item Hierarchy JSON', () => {
  let ajv = new Ajv();
  let validJSON = false;
  let failingTestCases = [
    {title: 'should return false for empty JSON', body: {}},
    {title: 'should return false when id field is missing from an item',
      body: {items: [
        {name: 'story', type: 35, docKey: 'document key', children: []}
      ]}
    },
    {title: 'should return false when name field is missing from an item',
      body: {items: [
        {id: 1, type: 35, docKey: 'document key', children: []}
      ]}
    },
    {title: 'should return false when type field is missing from an item',
      body: {items: [
        {id: 1, name: 'story', docKey: 'document key', children: []}
      ]}
    },
    {title: 'should return false when children are missing from an item',
      body: {items: [
        {id: 1, name: 'story', type: 35, docKey: 'document key'}
      ]}
    },
    {title: 'should return false when id field is a string',
      body: {items: [
        {id: '1', name: 'story', type: 35, docKey: 'document key', children: []}
      ]}
    },
    {title: 'should return false when name field is an integer',
      body: {items: [
        {id: 1, name: 123, type: 35, docKey: 'document key', children: []}
      ]}
    },
    {title: 'should return false when type field is a string',
      body: {items: [
        {id: 1, name: 'story', type: '35', docKey: 'document key', children: []}
      ]}
    }
  ];
  let passingTestCases = [
    {title: 'should return true when JSON populates each required field with at least one element once',
      body: {items: [
        {id: 1, name: 'story', type: 35, docKey: 'document key', parent: 33, isSet: false, children: []}
      ]}
    },
    {title: 'should return true when JSON contains many items in the item hierarchy tree',
      body: {items: [
        {id: 1, name: 'story', type: 35, docKey: 'document key', parent: 33, isSet: true, children: [
            {id: 2, name: 'bug', type: 40, docKey: 'document key', parent: 1, isSet: false, children: []},
            {id: 3, name: 'task', type: 45, docKey: 'document key', parent: 1, isSet: false, children: []}
        ]},
        {id: 10, name: 'story', type: 35, docKey: 'document key', parent: 33, isSet: true, children: [
            {id: 4, name: 'task', type: 45, docKey: 'document key', parent: 10, isSet: false, children: []}
        ]},
        {id: 11, name: 'story', type: 35, docKey: 'document key', parent: 33, isSet: false, children: []}
      ]}
    }
  ];
  failingTestCases.forEach(item => {
    it(item.title, () => {
      validJSON = ajv.validate(schema, item.body);
      expect(validJSON).to.be.false();
    });
  });
  passingTestCases.forEach(item => {
    it(item.title, () => {
      validJSON = ajv.validate(schema, item.body);
      expect(validJSON).to.be.true();
    });
  });
});
