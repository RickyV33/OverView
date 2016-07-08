let pagination = require('./pagination');

// let spec = {
//   '$schema': 'http://json-schema.org/draft-04/schema#',
//   'title': 'Graph',
//   'type': 'object',
//   'properties': {
//     'items': {
//       'type': 'array',
//       'items': {
//         'title': 'Item',
//         'type': 'object',
//         'properties': {
//           'id': { 'type': 'integer' },
//           'name': { 'type': 'string' },
//           'type': { 'type': 'integer' }
//         }
//       },
//       'required': ['id', 'name', 'type']
//     },
//     'relationships': {
//       'type': 'array',
//       'items': {
//         'title': 'Relationship',
//         'type': 'object',
//         'properties': {
//           'id': { 'type': 'integer' },
//           'fromItem': { 'type': 'integer' },
//           'toItem': { 'type': 'integer' },
//           'type': { 'type': 'integer' }
//         }
//       },
//       'required': ['id', 'fromItem', 'toItem', 'type']
//     }
//   },
//   'required': ['items', 'relationships']
// };

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

let Graph = {
  name: 'Graph',
  nodes: [],
  edges: [],

  Graph: function (projectId, url) {
    // url += '?project=' + projectId
    url = 'http://dummy:password@sevensource.jamacloud.com/rest/latest/items';
    let newUrl = url + '?project=33';
    let promise = pagination(url, 0, Number.MAX_SAFE_INTEGER);
    promise.then(function (items) {
      items.forEach(function (item) {
      });
    }, function () {
      console.log('THIS FAILED KATHLEEN');
    });
  },
  Reorganize: function (rootNode) {
  },

  fromJson: function (graphJson) {
    for (let i = 0; i < mock.items.length; ++i) {
      this.nodes.push(mock.items[i]);
    }
    for (let i = 0; i < mock.relationships.length; ++i) {
      this.edges.push(mock.relationships[i]);
    }
  },

  toJson: function () {
    return {'items': this.nodes, 'relationships': this.edges};
  }
};

module.exports = Graph;
