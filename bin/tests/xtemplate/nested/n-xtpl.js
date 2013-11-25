/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        return function (scopes, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                utils = config.utils;
            var runBlockCommandUtil = utils["runBlockCommand"],
                getExpressionUtil = utils["getExpression"],
                getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
            buffer += '<div>\n    \\\\\n    ';
            buffer += getExpressionUtil(('\'2    \\') + (2), true);
            buffer += '\n    \n</div>';
            return buffer;
        }
});