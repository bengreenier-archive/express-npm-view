/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />

var assert = require('assert');
var expressNpmField = require('../index');
var helpers = require('./helpers');

describe("express-npm-field", function () {
    it("needs to be initialized", function (done) {
        assert.throws(function () {
            expressNpmField();
        }, /Must call initialize/);
        
        expressNpmField.initialize({
            mocks: helpers.MockNpm(helpers.mockLoad, helpers.mockView)
        }, function (err) {
            assert.equal(!err, true);
            assert.doesNotThrow(function () {
                expressNpmField();
            });
            done();
        });
    });
    
    it("just works", function (done) {
        expressNpmField.initialize({
            fields: ["repository.url"],
            queryProperty: "test",
            propertyName: "testOut",
            mocks: helpers.MockNpm(helpers.mockLoad, helpers.mockView)
        }, function (err) {
            assert.equal(!err, true);
            
            var mockReq = {
                params: {
                    test: "package"
                }
            };
            
            expressNpmField()(mockReq, {}, function (err) {
                assert.equal(!err, true);
                assert.deepEqual(mockReq.testOut, {
                    "0.0.0": {
                        "repository.url": "package"
                    }
                });
                done();
            });
        });
    });
    
    it("works with many fields", function (done) {
        expressNpmField.initialize({
            fields: ["repository.url", "name"],
            queryProperty: "test",
            propertyName: "testOut",
            mocks: helpers.MockNpm(helpers.mockLoad, helpers.mockView)
        }, function (err) {
            assert.equal(!err, true);
            
            var mockReq = {
                params: {
                    test: "package"
                }
            };
            
            expressNpmField()(mockReq, {}, function (err) {
                assert.equal(!err, true);
                assert.deepEqual(mockReq.testOut, {
                    "0.0.0": {
                        "repository.url": "package",
                        "name": "package"
                    }
                });
                done();
            });
        });
    });
    
    it("supports options overriding", function (done) {
        expressNpmField.initialize({
            fields: ["repository.url"],
            queryProperty: "test",
            propertyName: "testOut",
            mocks: helpers.MockNpm(helpers.mockLoad, helpers.mockView)
        }, function (err) {
            assert.equal(!err, true);
            
            var mockReq = {
                params: {
                    success: "package"
                }
            };
            
            expressNpmField({
                fields: ["name"],
                queryProperty: "success",
                propertyName: "successOut"
            })(mockReq, {}, function (err) {
                assert.equal(!err, true);
                assert.deepEqual(mockReq.successOut, {
                    "0.0.0": {
                        "name": "package"
                    }
                });
                done();
            });
        });
    });
    
});