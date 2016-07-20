/* eslint-env mocha */
'use strict';

let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('../../app');

let ejs = require('ejs');
let read = require('fs').readFileSync;
let join = require('path').join;

chai.use(chaiHttp);

describe('hierarchy', function () {
    describe('get request', function () {
        it('should contain a property called text', function (done) {
            // This makes a server request to the route location '/'
            chai.request(server)
                .get('/hierarchy')
                .end(function (err, res) {
                    if (err) {
                        expect.fail();
                    }
                    // Render the view using ejs
                    let path = join(__dirname, '../../views/hierarchy.ejs');
                    let data = { title: 'Select a Root Item (Optional) ' };
                    let rendHtml = ejs.compile(read(path, 'utf8'), {filename: path})(data);

                    // Response rendered html
                    let respHtml = res.text;

                    expect(res).to.have.property('text');
                    expect(err).to.be.null();
                    expect(respHtml).to.be.equal(rendHtml);
                    done();
                });
        });
    });
});
