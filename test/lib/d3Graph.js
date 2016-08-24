/* eslint-env mocha */
/* eslint-disable */
// REMOVE LINT DISABLE

let chai = require('chai');
let expect = chai.expect;
let dirtyChai = require('dirty-chai');
let proxyquire = require('proxyquire');
let chaiAsPromised = require('chai-as-promised');

let auth = require('../../lib/auth');

chai.use(dirtyChai);
chai.use(chaiAsPromised);

describe('displayProjectsGraph()', function () {
    let testData = {
        "project" : "Test Project",
        "items": [
            { "id": 1, "name": "A", "type": 51, "image": 'testImage1' },
            { "id": 2, "name": "B", "type": 51, "image": 'testImage1' },
            { "id": 3, "name": "C", "type": 52, "image": 'testImage2' },
            { "id": 4, "name": "D", "type": 52, "image": 'testImage2' },
            { "id": 5, "name": "E", "type": 52, "image": 'testImage2' },
            { "id": 6, "name": "F", "type": 53, "image": 'testImage3' }
        ],
        "relationships": [
            {
                "id": 100,
                "fromItem": 1,
                "toItem": 3,
                "type": 9,
                "suspect": false
            },
            {
                "id": 101,
                "fromItem": 1,
                "toItem": 4,
                "type": 9,
                "suspect": false
            },
            {
                "id": 102,
                "fromItem": 1,
                "toItem": 5,
                "type": 9,
                "suspect": false
            },
            {
                "id": 103,
                "fromItem": 2,
                "toItem": 5,
                "type": 9,
                "suspect": false
            },
            {
                "id": 104,
                "fromItem": 4,
                "toItem": 3,
                "type": 9,
                "suspect": false
            },
            {
                "id": 105,
                "fromItem": 4,
                "toItem": 6,
                "type": 9,
                "suspect": false
            },
            {
                "id": 106,
                "fromItem": 5,
                "toItem": 6,
                "type": 9,
                "suspect": true
            }
        ]
    };

    describe('checkOpacity', function () {

    });

    describe('clearGraph', function () {

    });

    describe('collapse', function () {

    });

    describe('collapseAll', function () {

    });

    describe('configureD3Graph', function () {

    });

    describe('downStreamHighlightCheck', function () {

    });

    describe('filterJSON', function () {

    });

    describe('filterJSONRecursive', function () {

    });

    describe('highlightNodes', function () {

    });

    describe('initializeGraphData', function () {

    });

    describe('insertProjectNode', function () {

    });

    describe('mapNodesToEdges', function () {

    });

    describe('nodeClick', function () {

    });

    describe('nodeDoubleClick', function () {

    });

    describe('renderGraph', function () {

    });

    describe('resetVisitedFlag', function () {

    });

    describe('unCollapse', function () {

    });

    describe('unHighlightNodes', function () {

    });

    describe('updateGraph', function () {

    });

    describe('updateOpacity', function () {

    });
});
