/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        return function (scope, S, undefined) {
            var buffer = "",
                config = this.config,
                engine = this,
                moduleWrap, utils = config.utils;
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var runBlockCommandUtil = utils.runBlockCommand,
                renderOutputUtil = utils.renderOutput,
                getPropertyUtil = utils.getProperty,
                runInlineCommandUtil = utils.runInlineCommand,
                getPropertyOrRunCommandUtil = utils.getPropertyOrRunCommand;
            buffer += '';
            var config0 = {};
            var params1 = [];
            var id2 = getPropertyUtil(engine, scope, "years", 0, 1);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scope) {
                var buffer = "";
                buffer += '\n<tr role="row">\n    ';
                var config3 = {};
                var params4 = [];
                var id6 = getPropertyUtil(engine, scope, "xindex", 0, 3);
                var id5 = getPropertyUtil(engine, scope, "years." + id6 + "", 0, 3);
                params4.push(id5);
                config3.params = params4;
                config3.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n    <td role="gridcell"\n        title="';
                    var id7 = getPropertyOrRunCommandUtil(engine, scope, {}, "title", 0, 5);
                    buffer += renderOutputUtil(id7, true);
                    buffer += '"\n        class="';
                    var config9 = {};
                    var params10 = [];
                    params10.push('cell');
                    config9.params = params10;
                    var id8 = runInlineCommandUtil(engine, scope, config9, "getBaseCssClasses", 6);
                    buffer += renderOutputUtil(id8, true);
                    buffer += '\n        ';
                    var config11 = {};
                    var params12 = [];
                    var id13 = getPropertyUtil(engine, scope, "content", 0, 7);
                    var id14 = getPropertyUtil(engine, scope, "year", 0, 7);
                    params12.push(id13 === id14);
                    config11.params = params12;
                    config11.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var config16 = {};
                        var params17 = [];
                        params17.push('selected-cell');
                        config16.params = params17;
                        var id15 = runInlineCommandUtil(engine, scope, config16, "getBaseCssClasses", 8);
                        buffer += renderOutputUtil(id15, true);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config11, "if", 7);
                    buffer += '\n        ';
                    var config18 = {};
                    var params19 = [];
                    var id20 = getPropertyUtil(engine, scope, "content", 0, 10);
                    var id21 = getPropertyUtil(engine, scope, "startYear", 0, 10);
                    params19.push(id20 < id21);
                    config18.params = params19;
                    config18.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var config23 = {};
                        var params24 = [];
                        params24.push('last-decade-cell');
                        config23.params = params24;
                        var id22 = runInlineCommandUtil(engine, scope, config23, "getBaseCssClasses", 11);
                        buffer += renderOutputUtil(id22, true);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config18, "if", 10);
                    buffer += '\n        ';
                    var config25 = {};
                    var params26 = [];
                    var id27 = getPropertyUtil(engine, scope, "content", 0, 13);
                    var id28 = getPropertyUtil(engine, scope, "endYear", 0, 13);
                    params26.push(id27 > id28);
                    config25.params = params26;
                    config25.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var config30 = {};
                        var params31 = [];
                        params31.push('next-decade-cell');
                        config30.params = params31;
                        var id29 = runInlineCommandUtil(engine, scope, config30, "getBaseCssClasses", 14);
                        buffer += renderOutputUtil(id29, true);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config25, "if", 13);
                    buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
                    var config33 = {};
                    var params34 = [];
                    params34.push('year');
                    config33.params = params34;
                    var id32 = runInlineCommandUtil(engine, scope, config33, "getBaseCssClasses", 20);
                    buffer += renderOutputUtil(id32, true);
                    buffer += '">\n            ';
                    var id35 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 21);
                    buffer += renderOutputUtil(id35, true);
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