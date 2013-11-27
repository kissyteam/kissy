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
            var id2 = getPropertyOrRunCommandUtil(engine, scopes, {}, "months", 0, 1, undefined, true);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scopes) {
                var buffer = "";
                buffer += '\n<tr role="row">\n    ';
                var config3 = {};
                var params4 = [];
                var id6 = getPropertyOrRunCommandUtil(engine, scopes, {}, "xindex", 0, 3, undefined, true);
                var id5 = getPropertyOrRunCommandUtil(engine, scopes, {}, "months." + id6 + "", 0, 3, undefined, true);
                params4.push(id5);
                config3.params = params4;
                config3.fn = function (scopes) {
                    var buffer = "";
                    buffer += '\n    <td role="gridcell"\n        title="';
                    var id7 = getPropertyOrRunCommandUtil(engine, scopes, {}, 'title', 0, 5, undefined, false);
                    buffer += getExpressionUtil(id7, true);
                    buffer += '"\n        class="';
                    var config9 = {};
                    var params10 = [];
                    params10.push('cell');
                    config9.params = params10;
                    var id8 = getPropertyOrRunCommandUtil(engine, scopes, config9, "getBaseCssClasses", 0, 6, true, undefined);
                    buffer += id8;
                    buffer += '\n        ';
                    var config11 = {};
                    var params12 = [];
                    var id13 = getPropertyOrRunCommandUtil(engine, scopes, {}, "month", 0, 7, undefined, true);
                    var id14 = getPropertyOrRunCommandUtil(engine, scopes, {}, "value", 0, 7, undefined, true);
                    params12.push(id13 === id14);
                    config11.params = params12;
                    config11.fn = function (scopes) {
                        var buffer = "";
                        buffer += '\n        ';
                        var config16 = {};
                        var params17 = [];
                        params17.push('selected-cell');
                        config16.params = params17;
                        var id15 = getPropertyOrRunCommandUtil(engine, scopes, config16, "getBaseCssClasses", 0, 8, true, undefined);
                        buffer += id15;
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scopes, config11, "if", 7);
                    buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           class="';
                    var config19 = {};
                    var params20 = [];
                    params20.push('month');
                    config19.params = params20;
                    var id18 = getPropertyOrRunCommandUtil(engine, scopes, config19, "getBaseCssClasses", 0, 13, true, undefined);
                    buffer += id18;
                    buffer += '">\n            ';
                    var id21 = getPropertyOrRunCommandUtil(engine, scopes, {}, "content", 0, 14, undefined, false);
                    buffer += getExpressionUtil(id21, true);
                    buffer += '\n        </a>\n    </td>\n    ';
                    return buffer;
                };
                buffer += runBlockCommandUtil(engine, scopes, config3, "each", 3);
                buffer += '\n</tr>\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scopes, config0, "each", 1);
            return buffer;
        }
});