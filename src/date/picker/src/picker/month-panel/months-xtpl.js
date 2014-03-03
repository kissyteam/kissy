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
            var id2 = getPropertyUtil(engine, scope, "months", 0, 1);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scope) {
                var buffer = "";
                buffer += '\n<tr role="row">\n    ';
                var config3 = {};
                var params4 = [];
                var id6 = getPropertyUtil(engine, scope, "xindex", 0, 3);
                var id5 = getPropertyUtil(engine, scope, "months." + id6 + "", 0, 3);
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
                    var id13 = getPropertyUtil(engine, scope, "month", 0, 7);
                    var id14 = getPropertyUtil(engine, scope, "value", 0, 7);
                    params12.push(id13 === id14);
                    config11.params = params12;
                    config11.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n        ';
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
                    buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
                    var config19 = {};
                    var params20 = [];
                    params20.push('month');
                    config19.params = params20;
                    var id18 = runInlineCommandUtil(engine, scope, config19, "getBaseCssClasses", 14);
                    buffer += renderOutputUtil(id18, true);
                    buffer += '">\n            ';
                    var id21 = getPropertyOrRunCommandUtil(engine, scope, {}, "content", 0, 15);
                    buffer += renderOutputUtil(id21, true);
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