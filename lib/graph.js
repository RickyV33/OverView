let pagination = require('./pagination');

/**
 * Retrieve the project name given its project ID and the associated url. After appending the appropriate suffix to
 * complete the request URL, pagination is called and returns the name of the project from the given arguments. If the
 * promise is resolved, the project name is returned. Else the rejected promise issues a message String used for error
 * logging.
 *
 * @param {Number} projectId
 * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 */
function getProjectName (projectId, url) {
  let newUrl = url + 'projects/' + projectId;
  let name = pagination(newUrl, 0, Number.MAX_SAFE_INTEGER);
  return name.then(function (item) {
    // pagination stores payload in an array
    return item[0].fields.name;
  }, () => Promise.reject('Promise for name has been rejected.'));
}

/**
 * Retrieve all items from some project given its project ID and the associated url. Prior to calling the pagination
 * function, `url` is appended with the appropriate suffix to complete the request URL for all project items. If the
 * promise is resolved, each iteration through the list of items pushes the ID, name, and item type into a temporary
 * node container, which ultimately becomes the value of the `nodes` data member. Else the rejected promise issues a
 * message String used for error logging.
 *
 * @param {Number} projectId
 * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 */
function getProjectItems (projectId, url) {
  let newUrl = url + 'items?project=' + projectId;
  let nodeItems = pagination(newUrl, 0, Number.MAX_SAFE_INTEGER);
  return nodeItems.then(function (items) {
    let tempNodeCont = [];
    items.forEach(function (i) {
      let node = {
        'id': i.id,
        'name': i.fields.name,
        'type': i.itemType
      };
      tempNodeCont.push(node);
    });
    return tempNodeCont;
  }, () => Promise.reject('Promise for nodes has been rejected.'));
}

/**
 * Retrieve all item relationships from some project given its project ID and the associated url. Prior to calling the
 * pagination function, `url` is appended with the appropriate suffix to complete the request URL for all project item
 * relationships. If the promise is resolved, each iteration through the list of item relationships pushes the ID, the
 * IDs of both items in the relationship, and relationship type into a temporary edge container, which ultimately
 * becomes the value of the `edges` data member. Else the rejected promise issues a message String used for error
 * logging.
 *
 * @param {Number} projectId
 * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 */
function getProjectRelationships (projectId, url) {
  let newUrl = url + 'relationships?project=' + projectId;
  let relationshipItems = pagination(newUrl, 0, Number.MAX_SAFE_INTEGER);
  return relationshipItems.then(function (item) {
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
  }, () => Promise.reject('Promise for edges has been rejected.'));
}

let Graph = {
  name: '',
  nodes: [],
  edges: [],

  /**
   * Builds a graph object model given a project ID and a url that contains the username, password, and team name.
   *
   * @param {Number} projectId
   * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
   * @constructor {Graph}
   */
  Graph: function (projectId, url) {
    getProjectName(projectId, url).then(name => this.name = name, error => console.error(error));
    getProjectItems(projectId, url).then(items => this.nodes = items, error => console.error(error));
    getProjectRelationships(projectId, url).then(
      relationships => this.edges = relationships,
      error => console.error(error)
    );
  },

  Reorganize: function (rootNode) {
    // TODO: dependent on story #60 (backlog)
  },

  /**
   * Iterates through all items in both the item and the item relationship lists and pushes to the `nodes` and `edges`
   * arrays, respectively.
   *
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
   *
   * @returns {{items: Array, relationships: Array}}
   */
  toJson: function () {
    return { 'items': this.nodes, 'relationships': this.edges };
  }
};

module.exports = Graph;
