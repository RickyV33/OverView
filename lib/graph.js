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

/**
 * Calls pagination and returns the name of the project from the given arguments. The function resolves the promise
 with the name and rejects the promise with an message string used for logging to console.error.
 * @param {Int} projectId
 * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 */
function getProjectName(projectId, url) {
  let newUrl = url + 'projects/' + projectId;
  let name = pagination(newUrl, 0, Number.MAX_SAFE_INTEGER);
  name.then(function (item) {
    
    // pagination stores payload in an array
    return item[0].fields.name;  
  }, function () {
    return 'Promise for name has been rejected.';
  });
}

/**
 *  Prior to calling the pagination function, `url` is appended with the appropriate suffix to complete the request URL
 *  for all project items. If the promise is resolved, each iteration through the list of items pushes the ID, name, 
 *  and item type into a temporary node container, which ultimately becomes the value of the `nodes` data member. Else 
 *  the rejected promise issues an error message.
 * @param {Int} projectId
 * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 */
function getProjectItems(projectId, url) {
  let newUrl = url + 'items?project=' + projectId;
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
    return tempNodeCont;
  }, function () {
    return 'Promise for nodes has been rejected.';
  });
}

/* 

*/
/**
 * Prior to calling the pagination function, `url` is appended with the appropriate suffix to complete the request URL 
 * for all project item relationships. If the promise is resolved, each iteration through the list of item relationships
 * pushes the ID, the IDs of both items in the relationship, and relationship type into a temporary edge container, 
 * which ultimately becomes the value of the `edges` data member. Else the rejected promise issues an error message.
 * @param {Int} projectId 
 * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 */
function getProjectRelationships(projectId, url) {
  let newUrl = url + 'relationships?project=' + projectId;
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
    return tempEdgeCont;
  }, function () {
    return 'Promise for edges has been rejected.';
  });
}


let Graph = {
  name: '',
  nodes: [],
  edges: [],

  /**
   * Builds a graph object model after given a project id and url that contains the username, password, and team name. 
   * @param {Int} projectId
   * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
   * @constructor 
   */
  Graph: function (projectId, url) {
    url = 'http://dummy:password@sevensource.jamacloud.com/rest/latest/';
    getProjectName(projectId, url).then( function (name) {
      this.name = name;
    }, function (error) {
      console.error(error);
    });
    getProjectItems(projectId, url).then( function (items) {
      this.nodes = items;
    }, function (error) {
      console.error(error);
    });
    getProjectRelationships(projectId, url).then( function (relationships) {
      this.edges = relationships;
    }, function (error) {
      console.error(error);
    });
  },

  Reorganize: function (rootNode) {
    // TODO: dependent on story #60 (backlog)
  },


  /**
   * Iterate through all items in both the item and item relationship lists and push to the `nodes` and `edges` 
   * arrays, respectively.
   * @param {Object} graphJson
   */
  fromJson: function (graphJson) {
    for (let i = 0; i < graphJson.items.length; ++i) {
      this.nodes.push(graphJson.items[i]);
    }
    for (let i = 0; i < graphJson.relationships.length; ++i) {
      this.edges.push(graphJson.relationships[i]);
    }
  },
  
  /**
   * Returns an object model abiding by the relationship graph JSON schema from the given nodes and edges.
   * @returns {{items: Array, relationships: Array}}
   */
  toJson: function () {
    return { 'items': this.nodes, 'relationships': this.edges };
  }
};

module.exports = Graph;
