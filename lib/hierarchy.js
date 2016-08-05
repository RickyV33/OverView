/* eslint-env mocha */

'use strict';

let pagination = require('./pagination');
let rootItems = [];
let children = [];

function getAllItems (username, password, teamName, projectId) {
  let getItemsUrl = 'https://' + username + ':' + password + '@' + teamName +
    '.jamacloud.com/rest/latest/items?project=' + projectId;
  return pagination(getItemsUrl, 0, Number.MAX_SAFE_INTEGER);
}

function parseItemHierarchy (allItemsArray) {
  children = [];
  rootItems = [];
  allItemsArray.forEach(function (item) {
    if (typeof item.id === typeof 0 &&
      typeof item.fields.name === typeof 'string' &&
      typeof item.itemType === typeof 0 &&
      (typeof item.location.parent.project === typeof 0 ||
      typeof item.location.parent.item === typeof 0)) {
      let itemToAdd = {
        id: item.id,
        name: item.fields.name,
        type: item.itemType,
        parent: 0,
        children: []
      };
      if (item.location.parent.project) {
        itemToAdd.parent = item.location.parent.project;
        rootItems.push(itemToAdd);
      } else {
        itemToAdd.parent = item.location.parent.item;
        children.push(itemToAdd);
      }
    } else {
      // TODO gracefully handle erroneous JSON blob argument
      console.log('INVALID JSON RECEIVED');
      throw (item);
    }
  });
  mergeChildren();
  pushChildrenToRoots();
  return rootItems;
}

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
