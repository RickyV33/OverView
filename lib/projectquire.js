'use strict';
let pagination = require('./pagination');

/**
 * Retrieve the project name given its project ID and the associated url. After appending the appropriate suffix to
 * complete the request URL, pagination is called and returns the name of the project from the given arguments. If the
 * promise is resolved, the project name is returned. Else the rejected promise issues a message String used for error
 * logging.
 *
 * @param {Number} projectId
 * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 * @return {Promise}
 */
function getProjectName(projectId, url) {
  let newUrl = url + 'projects/' + projectId;
  let counter = 0;

  // A recursive function that re-requests the payload from Jama
  // 5 times after a timeout, then returns a rejected promise with
  // an error message
  function getData() {
    // Reject a promise after retrying 5 times to request data from jama
    if (counter >= 5) {
      return Promise.reject('Request Error: can\'t reach Jama');
    }
    ++counter;
    return pagination.pagination(newUrl).then((item) => {
      // Pagination stores payload in an array
      return item[0].fields.name;
    }, (error) => {
      if (error.code === 'ETIMEDOUT' || error.connect === true) {
        return getData();
      }
      return Promise.reject('Request Error: ' + error.statusCode + ' ' + error.status);
    });
  }

  return getData();
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
function getProjectItems(projectId, url) {
  let newUrl = url + 'items?project=' + projectId;
  let nodeItems = pagination.pagination(newUrl);
  return nodeItems.then((items) => {
    let tempNodeCont = [];
    items.forEach((item) => {
      let node = {
        'id': item.id,
        'name': item.fields.name,
        'type': item.itemType
      };
      tempNodeCont.push(node);
    });
    return tempNodeCont;
  }, (error) => {
    Promise.reject('Request Error: ' + error.code);
  });
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
function getProjectRelationships(projectId, url) {
  let newUrl = url + 'relationships?project=' + projectId;
  let relationshipItems = pagination.pagination(newUrl);
  return relationshipItems.then((items) => {
    let tempEdgeCont = [];
    items.forEach((item) => {
      let edge = {
        'id': item.id,
        'fromItem': item.fromItem,
        'toItem': item.toItem,
        'type': item.relationshipType
      };
      tempEdgeCont.push(edge);
    });
    return tempEdgeCont;
  }, (error) => {
    Promise.reject('Request Error: ' + error.code);
  });
}

module.exports = {
  getProjectName: getProjectName,
  getProjectItems: getProjectItems,
  getProjectRelationships: getProjectRelationships
};
