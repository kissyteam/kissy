KISSY.add(function () {
    return function (scopes, S, undefined) {
        var buffer = "",
            config = this.config,
            engine = this,
            utils = config.utils;
        var runBlockCommandUtil = utils["runBlockCommand"],
            getExpressionUtil = utils["getExpression"],
            getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
        buffer += '1';
        var config1 = {};
        var params2 = [];
        params2.push('./b-xtpl');
        config1.params = params2;
        var id0 = getPropertyOrRunCommandUtil(engine, scopes, config1, "include", 0, 1, true, undefined);
        buffer += id0;
        return buffer;
    };
}, {
    requires: ["./b-xtpl"]
});