/* eslint-env mocha */
'use strict';

let pagination = require('./pagination');

let final = [];
let children = [];
let url = '';

/**
 * Retrieve all project items from some project given its project ID and the associated url. First the root items are
 * retrieved and stored into the results as the roots, then for each root item, all sub items are retrieved and stored
 * into each root's subItems component in the results.
 * If the promise is resolved, each iteration through the list of items pushes the ID, name, and item type into a temporary
 * node container, which ultimately becomes the value of the `nodes` data member. Else the rejected promise issues a
 * message String used for error logging.
 *
 * @param {Number} projectId
 * @param {String} url : Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 */
function parseRootItems (rootItems) {
  final = [];
  if (rootItems !== null) {
    rootItems.forEach(function (item) {
    // id, name, and type are required fields
    if (typeof item.id === typeof 0
      && typeof item.fields.name === typeof 'string'
      && typeof item.itemType === typeof 0) {
        final.push({id: item.id, name: item.fields.name, type: item.itemType, children: []});
      }
    });
  }
  return final;
}

/**
 * Retrieve all project items from some project given its project ID and the associated url. First the root items are
 * retrieved and stored into the results as the roots, then for each root item, all sub items are retrieved and stored
 * into each root's subItems component in the results.
 * If the promise is resolved, each iteration through the list of items pushes the ID, name, and item type into a temporary
 * node container, which ultimately becomes the value of the `nodes` data member. Else the rejected promise issues a
 * message String used for error logging.
 *
 * @param {Number} projectId
 * @param {String} url : Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 */
function parseSubRootItems (subItems) {
    children = [];
    if (subItems !== null) {
      subItems.forEach(function (item) {
        // id, name, and type are required fields
        if (typeof item.id === typeof 0
          && typeof item.fields.name === typeof 'string'
          && typeof item.itemType === typeof 0) {
            children.push({id: item.id, name: item.fields.name, type: item.itemType});
        }
      });
    }
    return children;
}

/**
* Retrieve all items from some project given its project ID and the associated url. Prior to calling the pagination
* function, `url` is appended with the appropriate suffix to complete the request URL for all project items.
*
* @param {Number} projectId
* @param {String} url : Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
*/
  function getRootItems(projectId, url) {
    let rootItemsUrl = url + 'items?project=' + projectId + '&rootOnly=true';
    return pagination(rootItemsUrl, 0, Number.MAX_SAFE_INTEGER);
  }

  function getItemHierarchy(projectId, url){
      let rootItemsUrl = url + 'items?projects=' + projectId + '&rootOnly=true';
      let results = [];
      pagination(rootItemsUrl, 0, Number.MAX_SAFE_INTEGER).then(function(rootItems){
          let parsedRootItems = parseItems(rootItems);
          parsedRootItems.forEach(function(rootItem){
              children = getSubItems(rootItem.id);
              rootItem.children = children;
              results.push(rootItem);
              children = [];
          });
          return results;
          });/*,
          function(error){
              console.log('received an error from retrieving item hierarchy root items');
              console.log(error);

          });*/
  }

function getSubItems(url, itemId) {
     let subItemsUrl = url + 'items/' + itemId + '/children';
     pagination(subItemsUrl, 0, Number.MAX_SAFE_INTEGER).then(function(subItems){
         let results = parseItems(subItems);
         results.forEach(function(item){
             children = getSubItems(url, item.id);
             item.children = children;
             results.push(item);
         });
         return results;
         },
         function(err){
             console.log('received an error retrieving item hierarchy subitems');
     });
 }

function parseItems (itemsToParse) {
    let final = [];
    if (itemsToParse !== null) {
        itemsToParse.forEach(function (item) {
            // id, name, and type are required fields
            if (typeof item.id === typeof 0
                && typeof item.fields.name === typeof 'string'
                && typeof item.itemType === typeof 0) {
                final.push({id: item.id, name: item.fields.name, type: item.itemType, children: []});
            }
        });
    }
    return final;
}

/**
 * Retrieve all items from some project given its project ID and the associated url. Prior to calling the pagination
 * function, `url` is appended with the appropriate suffix to complete the request URL for all project items. If the
 * promise is resolved, each iteration through the list of items pushes the ID, name, and item type into a temporary
 * node container, which ultimately becomes the value of the `nodes` data member. Else the rejected promise issues a
 * message String used for error logging.
 *
 * @param {Number} itemId : ID of the root item to retrieve children of this item
 * @param {String} url : Should be in the following format: http://username:password@teamname.jamacloud.com/rest/latest/
 */
/* function getSubItems(url, itemId){
    let subItemsUrl = url + 'items/' + itemId + '/children';
    return pagination(subItemsUrl, 0, Number.MAX_SAFE_INTEGER);
}*/

module.exports = {
    getRootItems: getRootItems,
    getSubItems:getSubItems,
    parseRootItems: parseRootItems,
    parseSubRootItems: parseSubRootItems,
    parseItems: parseItems,
    getItemHierarchy: getItemHierarchy
};

