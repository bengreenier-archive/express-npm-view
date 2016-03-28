express-npm-view
==================

> Not ready for primetime yet!

Express middleware to lookup npm package data.

## How?

> Unfortunately, due to the npm api, middleware `initialize()` needs to be async.

`npm install express-npm-view`. Then use it, like one of these examples:

```
var npmView = require('express-npm-view');

npmView.initialize(function (err) {
    app.use(npmView({
        fields: ["name"]
    });
    
    app.get("/package/:package", function (req, res) {
        res.send(req.npm);
    });
});
```

```
var npmView = require('express-npm-view');

npmView.initialize({ fields: ["name"] }, function (err) {
    app.get("/package/:package", npmView(), function (req, res) {
        res.send(req.npm);
    });
    
    app.get("/module/:module", npmView({ queryProperty: "module" }), function (req, res) {
        res.send(req.npm);
    });
});
```

## API

### initialize({}, cb)

Async setup things. This is needed because we need to call `npm.load` which is async.

Optionally pass a configuration object (below are their default values):
```
{
    fields: [], // the fields we lookup, these get passed to npm.commands.view
    queryProperty: "package", // the property we get the package name from
    propertyName: "npm", // the property we export the data on
    npmOptions: {} // these get passed to npm.load
}
```
`queryProperty` is a bit tricker than the rest - it's not immediately clear where we lookup this property,
so i'm calling it out explicitly. We first try `req.params[queryProperty]`, then `req.query[queryProperty]`
and finally `req.body[queryProperty]`. If we still haven't found it, we fail.

Pass a callback function (`cb`) that will be called with `err` if there's an error. Otherwise it's called
with nothing, when everything is setup.


### ({})

This is the middleware provider. Optionally pass a configuration object with any of the options documented
above in `initialize()` (with the exception of `npmOptions`). Any options passed here override options passed
to `initialize()`.

It will return a middleware function (that it, something that matches the `(req, res, next)` signature) that you can `app.use`.