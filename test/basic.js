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
    
    it("skips lookup for invalid requests", function (done) {
        expressNpmField.initialize({
            fields: ["repository.url", "name"],
            queryProperty: "test",
            propertyName: "testOut",
            mocks: helpers.MockNpm(helpers.mockLoad, function (args, cb) {
                assert.fail();
                cb(null);
            })
        }, function (err) {
            assert.equal(!err, true);
            
            var mockReq = {
                params: {}
            };
            
            expressNpmField()(mockReq, {}, function (err) {
                assert.equal(!err, true);
                assert.equal(typeof(mockReq.testOut), "undefined");
                done();
            });
        });
    });
    
    it("calls next with an error on failure", function (done) {
        expressNpmField.initialize({
            fields: ["repository.url", "name"],
            queryProperty: "test",
            propertyName: "testOut",
            mocks: helpers.MockNpm(helpers.mockLoad, function (args, cb) {
                cb(new Error("test"));
            })
        }, function (err) {
            assert.equal(!err, true);
            
            var mockReq = {
                params: {
                    test: "failbowl"
                }
            };
            
            expressNpmField()(mockReq, {}, function (err) {
                assert.equal(err instanceof Error, true);
                assert.equal(err.message, "test");
                assert.equal(typeof(mockReq.testOut), "undefined");
                done();
            });
        });
    });
    
    it("does lookup on params,query,body in that order", function (done) {
        expressNpmField.initialize({
            fields: ["repository.url", "name"],
            queryProperty: "test",
            propertyName: "testOut",
            mocks: helpers.MockNpm(helpers.mockLoad, helpers.mockView)
        }, function (err) {
            assert.equal(!err, true);
            
            var mockParamsReq = {
                params: {
                    "test": "package"
                },
                query: {
                    "test": "failbowl"
                },
                body: {
                    "test": "failbowl"
                }
            };
            var mockQueryReq = {
                query: {
                    "test": "package"
                },
                body: {
                    "test": "failbowl"
                }
            };
            var mockBodyReq = {
                body: {
                    "test": "package"
                }
            };
            
            // TODO: unnest these to make it cleaner
            expressNpmField()(mockParamsReq, {}, function (err) {
                assert.equal(!err, true);
                assert.deepEqual(mockParamsReq.testOut, {
                    "0.0.0": {
                        "repository.url": "package",
                        "name": "package"
                    }
                });
                
                expressNpmField()(mockQueryReq, {}, function (err) {
                    assert.equal(!err, true);
                    assert.deepEqual(mockQueryReq.testOut, {
                        "0.0.0": {
                            "repository.url": "package",
                            "name": "package"
                        }
                    });
                    
                    expressNpmField()(mockBodyReq, {}, function (err) {
                        assert.equal(!err, true);
                        assert.deepEqual(mockBodyReq.testOut, {
                            "0.0.0": {
                                "repository.url": "package",
                                "name": "package"
                            }
                        });
                        
                        done();
                    });
                });
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