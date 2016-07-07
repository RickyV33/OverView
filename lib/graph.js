let pagination = require('./pagination');

let spec = {
  "title": "Graph",
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "title": "Item",
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string" },
          "type": { "type": "integer" }
        }
      },
      "required": ["id", "name", "type"]
    },
    "relationships": {
      "type": "array",
      "items": {
        "title": "Relationship",
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "fromItem": { "type": "integer" },
          "toItem": { "type": "integer" },
          "type": { "type": "integer" }
        }
      },
      "required": ["id", "fromItem", "toItem", "type"]
    }
  },
  "required": ["items", "relationships"]
};




let Graph = {
  name: '',
  nodes: [],
  edges: [],

  Graph: function (projectId) {
    let url = 'http://dummy:password@sevensource.jamacloud.com/rest/latest/items?project=33';
    pagination(url, 0, Number.MAX_SAFE_INTEGER).then(function (items) {
      console.log(items.data[0].id);
    }, function() {
      console.log('THIS FAILED ATHLEEN');
    });


  },
  Reorganize: function (rootNode) {

  },
  fromJson: function (graph) {
  },
  toJson: function () {
  }
};

module.exports = Graph;
