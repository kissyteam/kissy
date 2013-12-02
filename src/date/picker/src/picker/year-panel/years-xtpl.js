/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark: false, unused:false, indent:false*/
        return function (scope, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils.runBlockCommand,
                getExpressionUtil = utils.getExpression,
                getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
            buffer += '';
            var config0 = {};
            var params1 = [];
            var id2 = getPropertyOrRunCommandUtil(engine, scope, {}, "years", 0, 1, undefined, true);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scope) {
                var buffer = "";
                buffer += '\n<tr role="row">\n    ';
                var config3 = {};
                var params4 = [];
                var id6 = getPropertyOrRunCommandUtil(engine, scope, {}, "xindex", 0, 3, undefined, true);
                var id5 = getPropertyOrRunCommandUtil(engine, scope, {}, "years." + id6 + "", 0, 3, undefined, true);
                params4.push(id5);
                config3.params = params4;
                config3.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n    <td role="gridcell"\n        title="';
                    var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 5, undefined, false);
                    buffer += getExpressionUtil(id7, true);
                    buffer += '"\n        class="';
                    var config9 = {};
                    var params10 = [];
                    params10.push('cell');
                    config9.params = params10;
                    var id8 = getPropertyOrRunCommandUtil(engine, scope, config9, "getBaseCssClasses", 0, 6, true, undefined);
                    buffer += id8;
                    buffer += '\n        ';
                    var config11 = {};
                    var params12 = [];
                    var id13 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 7, undefined, true);
                    var id14 = getPropertyOrRunCommandUtil(engine, scope, {}, "year", 0, 7, undefined, true);
                    params12.push(id13 === id14);
                    config11.params = params12;
                    config11.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var config16 = {};
                        var params17 = [];
                        params17.push('selected-cell');
                        config16.params = params17;
                        var id15 = getPropertyOrRunCommandUtil(engine, scope, config16, "getBaseCssClasses", 0, 8, true, undefined);
                        buffer += id15;
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config11, "if", 7);
                    buffer += '\n        ';
                    var config18 = {};
                    var params19 = [];
                    var id20 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 10, undefined, true);
                    var id21 = getPropertyOrRunCommandUtil(engine, scope, {}, "startYear", 0, 10, undefined, true);
                    params19.push(id20 < id21);
                    config18.params = params19;
                    config18.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var config23 = {};
                        var params24 = [];
                        params24.push('last-decade-cell');
                        config23.params = params24;
                        var id22 = getPropertyOrRunCommandUtil(engine, scope, config23, "getBaseCssClasses", 0, 11, true, undefined);
                        buffer += id22;
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config18, "if", 10);
                    buffer += '\n        ';
                    var config25 = {};
                    var params26 = [];
                    var id27 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 13, undefined, true);
                    var id28 = getPropertyOrRunCommandUtil(engine, scope, {}, "endYear", 0, 13, undefined, true);
                    params26.push(id27 > id28);
                    config25.params = params26;
                    config25.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var config30 = {};
                        var params31 = [];
                        params31.push('next-decade-cell');
                        config30.params = params31;
                        var id29 = getPropertyOrRunCommandUtil(engine, scope, config30, "getBaseCssClasses", 0, 14, true, undefined);
                        buffer += id29;
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config25, "if", 13);
                    buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           class="';
                    var config33 = {};
                    var params34 = [];
                    params34.push('year');
                    config33.params = params34;
                    var id32 = getPropertyOrRunCommandUtil(engine, scope, config33, "getBaseCssClasses", 0, 19, true, undefined);
                    buffer += id32;
                    buffer += '">\n            ';
                    var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 20, undefined, false);
                    buffer += getExpressionUtil(id35, true);
                    buffer += '\n        </a>\n    </td>\n    ';
                    return buffer;
                };
                buffer += runBlockCommandUtil(engine, scope, config3, "each", 3);
                buffer += '\n</tr>\n';
                return buffer;
            };
            buffer += runBlockCommandUtil(engine, scope, config0, "each", 1);
            return buffer;
        };
});