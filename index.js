'use strict';

let npm = require('npm');

// helper to merge just the plugin necessary options
function mergeArguments(left, right) {
    if (typeof(right) === "undefined") {
        return left;
    }
    
    if (typeof(left) === "undefined") {
        left = {};
    }
    
    left.fields = right.fields || left.fields;
    left.queryProperty = right.queryProperty || left.queryProperty;
    left.propertyName = right.propertyName || left.propertyName;
    left.npmOptions = right.npmOptions || left.npmOptions;
    
    // for testing
    if (typeof(right.mocks) === "object") {
        left.mocks = right.mocks
        left.mocks.npmLoad = right.mocks.npmLoad || left.mocks.npmLoad;
        left.mocks.npmView = right.mocks.npmView || left.mocks.npmView;
    }
    
    return left;
}

// define our constructor - and our default arguments
function ExpressNpmView() {
    this.options = {
        fields: [],
        queryProperty: "package",
        propertyName: "npm",
        npmOptions: {},
        
        // for testing - you should not override these
        mocks: {
            npmLoad: null,
            npmView: null
        }
    };
    
    this.wasInitialized = false;
}

// define the initialize method required for setup
// since npm commands require `npm.load` this must be async
ExpressNpmView.prototype.initialize = function initialize(options, cb) {
    
    // we only fail out here if options.mocks is undefined. We assume if it's defined
    // that you're testing things/you know what you're doing
    if (this.wasInitialized && options && typeof(options.mocks) === "undefined") {
        return cb(new Error("Already initialized"));
    }
    
    // support passing just the cb
    if (typeof(options) === "function") {
        cb = options;
        options = {};
    }
    
    this.options = mergeArguments(this.options, options);
    
    let self = this;
    (this.options.mocks.npmLoad || npm.load)(this.options.npmOptions, function (err) {
        if (err) {
            cb(err);
        } else {
            self.wasInitialized = true;
            cb(null);
        }
    });
}

// define the middleware setup method - calling this returns the middleware function
// it supports overriding the args given to initialize
ExpressNpmView.prototype.npmViewMiddlewareSetup = function npmViewMiddlewareSetup(options) {
    if (!this.wasInitialized) {
        throw new Error("Must call initialize() first.");
    }
    
    let routeOptions = mergeArguments(this.options, options);
    
    let self = this;
    return function npmViewMiddleware(req, res, next) {
        // prevent code duplication with this little gem
        var runNpmViewMiddleware = function runNpmViewMiddleware(dataSource) {
            (routeOptions.mocks.npmView || npm.commands.view)([dataSource[routeOptions.queryProperty], routeOptions.fields], function (err, data) {
                if (err) {
                    return next(err);
                }
                req[routeOptions.propertyName] = data;
                next();
            });
        };
        
        // check for a queryProperty on params, then query, then body, then skip - not found
        if (req.params && typeof(req.params[routeOptions.queryProperty]) === "string") {
            runNpmViewMiddleware(req.params);
        } else if (req.query && typeof(req.query[routeOptions.queryProperty]) === "string") {
            runNpmViewMiddleware(req.query);
        } else if (req.body && typeof(req.body[routeOptions.queryProperty]) === "string") {
            runNpmViewMiddleware(req.body);
        } else {
            // not found
            next();
        }
    };
}

// create a single instance
let singletonInstance = new ExpressNpmView();

// we just want to export npmViewMiddlewareSetup
let exportedFunction = singletonInstance.npmViewMiddlewareSetup.bind(singletonInstance);

// and patch in the initialize method
exportedFunction.initialize = singletonInstance.initialize.bind(singletonInstance);

// finally, we export
module.exports = exportedFunction;