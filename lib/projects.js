/* eslint-env mocha */

'use strict';
let pagination = require('./pagination');

/**
 * Iterate through a list of project items that matches the projectList.json specification. Each item will be parsed
 * into an object with the following format: {id: idNumber, name: 'Project Name'} and then added to the projectsList
 * variable. ProjectsList is initialized to an empty array. If the projects argument is null,
 * the empty projectsList variable is returned. Otherwise, the variable is populated with projects items and then
 * returned.
 *
 * @param {Object} projects a list of projects matching the projectsList.json specification
 * @return {Object} projectsList will either be an empty array if the argument is null or the entire item hierarchy object 
 */
function parseProjectList (projects) {
  let projectsList = [];
  if (projects === null) {
    return projectsList;
  }
  projects.forEach(project => {
    // id and name are required fields
    if (typeof project.id === typeof 0 && typeof project.fields.name === typeof 'string') {
      projectsList.push({ id: project.id, name: project.fields.name });
    }
  });

  return projectsList;
}

/**
 * Retrieve the project name given its project ID and the associated url. After appending the appropriate suffix to
 * complete the request URL, pagination is called and returns the name of the project from the given arguments. If the
 * promise is resolved, the project name is returned. Else the rejected promise issues a message String used for error
 * logging.
 *
 * @param {Number} projectId
 * @param {String} url Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 * @return {Promise} A resolved promise with the name of the project or a rejected promise with an error
 */
function getProjectName (projectId, url) {
  let newUrl = url + 'projects/' + projectId;
  return pagination(newUrl).then(item => {
    // pagination stores payload in an array
    return item[0].fields.name;
  }, error => Promise.reject(error));
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
 * @return {Promise} A resolved promise with the items of the project or a rejected promise with an error
 */
function getProjectItems (projectId, url) {
  let newUrl = url + 'items?project=' + projectId;
  return pagination(newUrl).then(items => {
    let tempNodeCont = [];
    items.forEach(item => {
      let node = {
        'id': item.id,
        'name': item.fields.name,
        'type': item.itemType,
        'image': ''
      };
      tempNodeCont.push(node);
    });
    return tempNodeCont;
  }, error => Promise.reject(error));
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
 * @return {Promise} A resolved promise with the items of the project or a rejected promise with an error
 */
function getProjectRelationships (projectId, url) {
  let newUrl = url + 'relationships?project=' + projectId;
  return pagination(newUrl).then(items => {
    let tempEdgeCont = [];
    items.forEach(item => {
      let edge = {
        'id': item.id,
        'source': item.fromItem,
        'target': item.toItem,
        'type': item.relationshipType,
        'suspect': item.suspect
      };
      tempEdgeCont.push(edge);
    });
    return tempEdgeCont;
  }, error => Promise.reject(error));
}

/**
 * Retrieve all the item type images. Item types contain image urls which are then copied to each node so that they may be
 * displayed in the graph.
 *
 * @param url
 * @returns {Promise}
 */
function getProjectItemTypeImages (url) {
  let newUrl = url + 'itemtypes';
  return pagination(newUrl).then(items => {
    let tempItemTypes = [];
    items.forEach(item => {
      let itemType = {};
      itemType[item.id] = item.image;
      tempItemTypes.push(itemType);
    });
    return tempItemTypes;
  }, error => Promise.reject(error));
}

module.exports = {
  parseProjectList: parseProjectList,
  getProjectName: getProjectName,
  getProjectItems: getProjectItems,
  getProjectItemTypeImages: getProjectItemTypeImages,
  getProjectRelationships: getProjectRelationships
};
