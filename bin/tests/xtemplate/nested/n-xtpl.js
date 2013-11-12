/** Compiled By kissy-xtemplate */
KISSY.add(function () {
    return function (scopes, S, undefined) {
        var buffer = "",
            config = this.config,
            engine = this,
            utils = config.utils;
        var runBlockCommandUtil = utils["runBlockCommand"],
            getExpressionUtil = utils["getExpression"],
            getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
        buffer += '<div>\r\n    \\\\\r\n    ';
        buffer += getExpressionUtil(('\'2    \\') + (2), true);
        buffer += '\r\n    \r\n</div>';
        return buffer;
    };
});