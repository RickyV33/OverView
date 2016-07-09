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
  name: '',
  nodes: [],
  edges: [],

  Graph: function (projectId, url) {
    url = 'http://dummy:password@sevensource.jamacloud.com/rest/latest/';
    let newUrl = url + 'projects/33';
    let name = pagination(newUrl, 0, Number.MAX_SAFE_INTEGER);
    name.then(function (item) {
      this.name = item[0].fields.name;  // pagination stores payload in an array
    }, function () {
      console.error('Promise for name has been rejected.');
    });

    // TODO: Create a separate function for the following code block
    // Prior to calling the pagination function, `url` is appended with the appropriate
    // suffix to complete the request URL for all project items. If the promise is
    // resolved, each iteration through the list of items pushes the ID, name, and item
    // type into a temporary node container, which ultimately becomes the value of the
    // `nodes` data member. Else the rejected promise issues an error message.
    newUrl = url + 'items?project=33';
    let nodeItems = pagination(newUrl, 0, Number.MAX_SAFE_INTEGER);
    nodeItems.then(function (item) {
      let tempNodeCont = [];
      item.forEach(function (i) {
        let node = {
          'id': i.id,
          'name': i.fields.name,
          'type': i.itemType
        };
        tempNodeCont.push(node);
      });
      this.nodes = tempNodeCont;
    }, function () {
      console.error('Promise for nodes has been rejected.');
    });

    // TODO: Create a separate function for the following code block
    // Prior to calling the pagination function, `url` is appended with the appropriate
    // suffix to complete the request URL for all project item relationships. If the
    // promise is resolved, each iteration through the list of item relationships pushes
    // the ID, the IDs of both items in the relationship, and relationship type into a
    // temporary edge container, which ultimately becomes the value of the `edges` data
    // member. Else the rejected promise issues an error message.
    newUrl = url + 'relationships?project=33';
    let relationshipItems = pagination(newUrl, 0, Number.MAX_SAFE_INTEGER);
    relationshipItems.then(function (item) {
      let tempEdgeCont = [];
      item.forEach(function (i) {
        let edge = {
          'id': i.id,
          'fromItem': i.fromItem,
          'toItem': i.toItem,
          'type': i.relationshipType
        };
        tempEdgeCont.push(edge);
      });
      this.edges = tempEdgeCont;
    }, function () {
      console.error('Promise for edges has been rejected.');
    });
  },

  Reorganize: function (rootNode) {
    // TODO: dependent on story #60 (backlog)
  },

  // Iterate through all items in both the item and item relationship lists and push
  // to the `nodes` and `edges` arrays, respectively.
  fromJson: function (graphJson) {
    for (let i = 0; i < mock.items.length; ++i) {
      this.nodes.push(mock.items[i]);
    }
    for (let i = 0; i < mock.relationships.length; ++i) {
      this.edges.push(mock.relationships[i]);
    }
  },

  toJson: function () {
    return { 'items': this.nodes, 'relationships': this.edges };
  }
};

module.exports = Graph;
