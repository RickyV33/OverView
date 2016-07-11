/* eslint-env mocha */

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let tv4 = require('tv4');

let graph = require('../../lib/graph');

chai.use(dirtyChai);

describe('Graph module', function () {
  let spec = {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'title': 'Graph',
    'type': 'object',
    'properties': {
      'items': {
        'type': 'array',
        'items': {
          'title': 'Item',
          'type': 'object',
          'properties': {
            'id': { 'type': 'integer' },
            'name': { 'type': 'string' },
            'type': { 'type': 'integer' }
          }
        },
        'required': ['id', 'name', 'type']
      },
      'relationships': {
        'type': 'array',
        'items': {
          'title': 'Relationship',
          'type': 'object',
          'properties': {
            'id': { 'type': 'integer' },
            'fromItem': { 'type': 'integer' },
            'toItem': { 'type': 'integer' },
            'type': { 'type': 'integer' }
          }
        },
        'required': ['id', 'fromItem', 'toItem', 'type']
      }
    },
    'required': ['items', 'relationships']
  };

  let mock = {
    'items': [
      {
        'id': 10,
        'name': 'User Login Home Page',
        'type': 99
      },
      {
        'id': 11,
        'name': 'Input a Username',
        'type': 24
      },
      {
        'id': 12,
        'name': 'Input a Password',
        'type': 24
      },
      {
        'id': 13,
        'name': 'Input a TeamName',
        'type': 24
      }
    ],
    'relationships': [
      {
        'id': 1,
        'fromItem': 11,
        'toItem': 10,
        'type': 6 // derived from
      },
      {
        'id': 2,
        'fromItem': 12,
        'toItem': 10,
        'type': 6 // derived from
      },
      {
        'id': 3,
        'fromItem': 13,
        'toItem': 10,
        'type': 6 // derived from
      }
    ]
  };
  
  describe('graph Constructor', function () {
    let valid = tv4.valdiate(mock, spec);
  });
});