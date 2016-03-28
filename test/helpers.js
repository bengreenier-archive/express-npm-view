module.exports = {
    MockParamsRequest: function (params) {
        return {
            params: params
        };
    },
    MockQueryRequest: function (query) {
        return {
            query: query
        };
    },
    MockBodyRequest: function (body) {
        return {
            body: body
        };
    },
    MockNpm: function (onLoad, onView) {
        return {
            npmLoad: onLoad,
            npmView: onView
        };
    },
    mockLoad: function (opts, cb) {
        cb(null);
    },
    mockView: function (args, cb) {
        var res = {};
        for (var i = 0; i < args[1].length; i++) {
            res[args[1][i]] = args[0];
        }
        cb(null, {
            "0.0.0": res
        });
    }
};