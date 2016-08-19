/* eslint-env mocha */

'use strict';

let pagination = require('./pagination');
let Ajv = require('ajv');

// Arrays for storing all items (children array) and most root items (rootItems array)
let rootItems = [];
let children = [];

/**
 * Returns a promise with all items for a given project from jama's API via a call to pagination. The username,
 * password, teamName, and projectId are passed in from the hierarchy endpoint's request.
 * TODO handle the case of rejected promise
 * The module forms the URL needed for the pagination module to be in the format:
 * http://username:password@teamname.jamacloud.com/rest/latest/
 *
 *
 * @param {String} username
 * @param {String} password
 * @param {String} teamName
 * @param {int} projectId
 */
function getAllItems (username, password, teamName, projectId) {
  let getItemsUrl = 'https://' + username + ':' + password + '@' + teamName +
    '.jamacloud.com/rest/latest/items?project=' + projectId;
  return pagination(getItemsUrl, 0, Number.MAX_SAFE_INTEGER);
}

/**
 * Parses an array of item objects into suitable nodes that contain an id, a name, a type, a parent (currently) and
 * an array of children items. There is currently no distinction between an item and a set of items. This will be
 * added in in a following story to tag each item for rendering purposes.
 * It loops through all items in the allItemsArray and determines if it's one of the most indirect root items,
 * in which case it will be created as a new item and added to the global array rootItems. If not, a new item will
 * be created and added to the array of children items. The mergeChildren and pushChildrenToRoots functions are then
 * called to merge items into their parent items' array of children.
 *
 *
 * @param {Array} allItemsArray
 * @return {Array} rootItems that are at the highest level out of all project items
 */
function parseItemHierarchy (allItemsArray) {
  children = [];
  rootItems = [];
  allItemsArray.forEach(item => {
    if (
      typeof item.id === typeof 0 &&
      typeof item.fields.name === typeof 'string' &&
      typeof item.itemType === typeof 0 && (
      typeof item.location.parent.project === typeof 0 ||
      typeof item.location.parent.item === typeof 0)) {

      let itemToAdd = {
        id: item.id,
        name: item.fields.name,
        type: item.itemType,
        parent: 0,
        isSet: true,
        children: []
      };
      if (item.location.parent.project) {
        itemToAdd.parent = item.location.parent.project;
        rootItems.push(itemToAdd);
      } else {
        itemToAdd.parent = item.location.parent.item;
        children.push(itemToAdd);
      }
      if(item.childItemType === undefined) {
        itemToAdd.isSet = false;
      }
    }
  });
  mergeChildren();
  pushChildrenToRoots();
  // TODO validate returned json payload with all nested items, (might add parent, item vs set fields)
  let toReturn = {items: rootItems};
  let ajv = Ajv({allErrors: true});
  let schema = require('./schema/itemHierarchy.json');
  let validJSON = ajv.validate(schema, toReturn);
  if (!validJSON) {
   // TODO gracefully handle erroneous JSON blob argument
    console.log('Invalid Item hierarchy JSON received');
    throw (toReturn);
  } else {
    return toReturn;
  }
}

/**
 * This module loops through each item within the children array and pushes each element into its parent's array of
 * children items.
 *
 */
function mergeChildren () {
  let size = children.length;
  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j < size; j += 1) {
      if (children[j].parent === children[i].id) {
        children[i].children.push(children[j]);
      }
    }
  }
}

/**
 * This module loops through each item within the children array and pushes each element into its parent's array of
 * children items from within the rootItems array. The rootItems array will then eventually be returned from the
 * calling routine.
 *
 */
function pushChildrenToRoots () {
  let rootCount = rootItems.length;
  let childCount = children.length;
  for (let i = 0; i < rootCount; i += 1) {
    for (let j = 0; j < childCount; j += 1) {
      if (children[j].parent === rootItems[i].id) {
        rootItems[i].children.push(children[j]);
      }
    }
  }
}

module.exports = {
  getAllItems: getAllItems,
  parseItemHierarchy: parseItemHierarchy,
  mergeChildren: mergeChildren,
  pushChildrenToRoots: pushChildrenToRoots
};
