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
            var id2 = getPropertyUtil(engine, scope, "decades", 0, 1);
            params1.push(id2);
            config0.params = params1;
            config0.fn = function (scope) {
                var buffer = "";
                buffer += '\n<tr role="row">\n    ';
                var config3 = {};
                var params4 = [];
                var id6 = getPropertyUtil(engine, scope, "xindex", 0, 3);
                var id5 = getPropertyUtil(engine, scope, "decades." + id6 + "", 0, 3);
                params4.push(id5);
                config3.params = params4;
                config3.fn = function (scope) {
                    var buffer = "";
                    buffer += '\n    <td role="gridcell"\n        class="';
                    var config8 = {};
                    var params9 = [];
                    params9.push('cell');
                    config8.params = params9;
                    var id7 = runInlineCommandUtil(engine, scope, config8, "getBaseCssClasses", 5);
                    buffer += renderOutputUtil(id7, true);
                    buffer += '\n        ';
                    var config10 = {};
                    var params11 = [];
                    var id12 = getPropertyUtil(engine, scope, "startDecade", 0, 6);
                    var id13 = getPropertyUtil(engine, scope, "year", 0, 6);
                    var id14 = getPropertyUtil(engine, scope, "year", 0, 6);
                    var id15 = getPropertyUtil(engine, scope, "endDecade", 0, 6);
                    params11.push((id12 <= id13) && (id14 <= id15));
                    config10.params = params11;
                    config10.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var config17 = {};
                        var params18 = [];
                        params18.push('selected-cell');
                        config17.params = params18;
                        var id16 = runInlineCommandUtil(engine, scope, config17, "getBaseCssClasses", 7);
                        buffer += renderOutputUtil(id16, true);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config10, "if", 6);
                    buffer += '\n        ';
                    var config19 = {};
                    var params20 = [];
                    var id21 = getPropertyUtil(engine, scope, "startDecade", 0, 9);
                    var id22 = getPropertyUtil(engine, scope, "startYear", 0, 9);
                    params20.push(id21 < id22);
                    config19.params = params20;
                    config19.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var config24 = {};
                        var params25 = [];
                        params25.push('last-century-cell');
                        config24.params = params25;
                        var id23 = runInlineCommandUtil(engine, scope, config24, "getBaseCssClasses", 10);
                        buffer += renderOutputUtil(id23, true);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config19, "if", 9);
                    buffer += '\n        ';
                    var config26 = {};
                    var params27 = [];
                    var id28 = getPropertyUtil(engine, scope, "endDecade", 0, 12);
                    var id29 = getPropertyUtil(engine, scope, "endYear", 0, 12);
                    params27.push(id28 > id29);
                    config26.params = params27;
                    config26.fn = function (scope) {
                        var buffer = "";
                        buffer += '\n         ';
                        var config31 = {};
                        var params32 = [];
                        params32.push('next-century-cell');
                        config31.params = params32;
                        var id30 = runInlineCommandUtil(engine, scope, config31, "getBaseCssClasses", 13);
                        buffer += renderOutputUtil(id30, true);
                        buffer += '\n        ';
                        return buffer;
                    };
                    buffer += runBlockCommandUtil(engine, scope, config26, "if", 12);
                    buffer += '\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="';
                    var config34 = {};
                    var params35 = [];
                    params35.push('decade');
                    config34.params = params35;
                    var id33 = runInlineCommandUtil(engine, scope, config34, "getBaseCssClasses", 19);
                    buffer += renderOutputUtil(id33, true);
                    buffer += '">\n            ';
                    var id36 = getPropertyOrRunCommandUtil(engine, scope, {}, "startDecade", 0, 20);
                    buffer += renderOutputUtil(id36, true);
                    buffer += '-';
                    var id37 = getPropertyOrRunCommandUtil(engine, scope, {}, "endDecade", 0, 20);
                    buffer += renderOutputUtil(id37, true);
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