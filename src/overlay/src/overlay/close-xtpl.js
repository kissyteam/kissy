/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        return function (scopes, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module != "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils["runBlockCommand"],
                getExpressionUtil = utils["getExpression"],
                getPropertyOrRunCommandUtil = utils["getPropertyOrRunCommand"];
            buffer += '';
            var config0 = {};
            var params1 = [];
            var id2 = getPropertyOrRunCommandUtil(engine, scopes, {}, "closable", 0, 1, undefined, true);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scopes) {
                var buffer = "";
                buffer += '\n<a href="javascript:void(\'close\')"\n   id="ks-overlay-close-';
                var id3 = getPropertyOrRunCommandUtil(engine, scopes, {}, "id", 0, 3, undefined, false);
                buffer += getExpressionUtil(id3, true);
                buffer += '"\n   class="';
                var config5 = {};
                var params6 = [];
                params6.push('close');
                config5.params = params6;
                var id4 = getPropertyOrRunCommandUtil(engine, scopes, config5, "getBaseCssClasses", 0, 4, true, undefined);
                buffer += id4;
                buffer += '"\n   role=\'button\'>\n    <span class="';
                var config8 = {};
                var params9 = [];
                params9.push('close-x');
                config8.params = params9;
                var id7 = getPropertyOrRunCommandUtil(engine, scopes, config8, "getBaseCssClasses", 0, 6, true, undefined);
                buffer += id7;
                buffer += '">close</span>\n</a>\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scopes, config0, "if", 1);
            buffer += '\n';
            return buffer;
        }
});