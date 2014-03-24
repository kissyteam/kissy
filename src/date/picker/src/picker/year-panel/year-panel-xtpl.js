/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, S, buffer, payload, undefined) {
            var engine = this,
                moduleWrap, nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
            }
            if (typeof module !== "undefined" && module.kissy) {
                moduleWrap = module;
            }
            var callCommandUtil = utils.callCommand,
                eachCommand = nativeCommands.each,
                withCommand = nativeCommands["with"],
                ifCommand = nativeCommands["if"],
                setCommand = nativeCommands.set,
                includeCommand = nativeCommands.include,
                parseCommand = nativeCommands.parse,
                extendCommand = nativeCommands.extend,
                blockCommand = nativeCommands.block,
                macroCommand = nativeCommands.macro,
                debuggerCommand = nativeCommands["debugger"];
            buffer.write('<div class="');
            var option0 = {
                escape: 1
            };
            var params1 = [];
            params1.push('header');
            option0.params = params1;
            var commandRet2 = callCommandUtil(engine, scope, option0, buffer, "getBaseCssClasses", 1);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, true);
            buffer.write('">\n    <a id="ks-date-picker-year-panel-previous-decade-btn-');
            var id3 = scope.resolve(["id"]);
            buffer.write(id3, true);
            buffer.write('"\n       class="');
            var option4 = {
                escape: 1
            };
            var params5 = [];
            params5.push('prev-decade-btn');
            option4.params = params5;
            var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
            if (commandRet6 && commandRet6.isBuffer) {
                buffer = commandRet6;
                commandRet6 = undefined;
            }
            buffer.write(commandRet6, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id7 = scope.resolve(["previousDecadeLabel"]);
            buffer.write(id7, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n\n    <a class="');
            var option8 = {
                escape: 1
            };
            var params9 = [];
            params9.push('decade-select');
            option8.params = params9;
            var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 10);
            if (commandRet10 && commandRet10.isBuffer) {
                buffer = commandRet10;
                commandRet10 = undefined;
            }
            buffer.write(commandRet10, true);
            buffer.write('"\n       role="button"\n       href="#"\n       hidefocus="on"\n       title="');
            var id11 = scope.resolve(["decadeSelectLabel"]);
            buffer.write(id11, true);
            buffer.write('"\n       id="ks-date-picker-year-panel-decade-select-');
            var id12 = scope.resolve(["id"]);
            buffer.write(id12, true);
            buffer.write('">\n            <span id="ks-date-picker-year-panel-decade-select-content-');
            var id13 = scope.resolve(["id"]);
            buffer.write(id13, true);
            buffer.write('">\n                ');
            var id14 = scope.resolve(["startYear"]);
            buffer.write(id14, true);
            buffer.write('-');
            var id15 = scope.resolve(["endYear"]);
            buffer.write(id15, true);
            buffer.write('\n            </span>\n        <span class="');
            var option16 = {
                escape: 1
            };
            var params17 = [];
            params17.push('decade-select-arrow');
            option16.params = params17;
            var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 19);
            if (commandRet18 && commandRet18.isBuffer) {
                buffer = commandRet18;
                commandRet18 = undefined;
            }
            buffer.write(commandRet18, true);
            buffer.write('">x</span>\n    </a>\n\n    <a id="ks-date-picker-year-panel-next-decade-btn-');
            var id19 = scope.resolve(["id"]);
            buffer.write(id19, true);
            buffer.write('"\n       class="');
            var option20 = {
                escape: 1
            };
            var params21 = [];
            params21.push('next-decade-btn');
            option20.params = params21;
            var commandRet22 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 23);
            if (commandRet22 && commandRet22.isBuffer) {
                buffer = commandRet22;
                commandRet22 = undefined;
            }
            buffer.write(commandRet22, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id23 = scope.resolve(["nextDecadeLabel"]);
            buffer.write(id23, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
            var option24 = {
                escape: 1
            };
            var params25 = [];
            params25.push('body');
            option24.params = params25;
            var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 30);
            if (commandRet26 && commandRet26.isBuffer) {
                buffer = commandRet26;
                commandRet26 = undefined;
            }
            buffer.write(commandRet26, true);
            buffer.write('">\n    <table class="');
            var option27 = {
                escape: 1
            };
            var params28 = [];
            params28.push('table');
            option27.params = params28;
            var commandRet29 = callCommandUtil(engine, scope, option27, buffer, "getBaseCssClasses", 31);
            if (commandRet29 && commandRet29.isBuffer) {
                buffer = commandRet29;
                commandRet29 = undefined;
            }
            buffer.write(commandRet29, true);
            buffer.write('" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-year-panel-tbody-');
            var id30 = scope.resolve(["id"]);
            buffer.write(id30, true);
            buffer.write('">\n        ');
            var option31 = {};
            var params32 = [];
            params32.push('date/picker/year-panel/years-xtpl');
            option31.params = params32;
            if (moduleWrap) {
                require("date/picker/year-panel/years-xtpl");
                option31.params[0] = moduleWrap.resolveByName(option31.params[0]);
            }
            var commandRet33 = includeCommand.call(engine, scope, option31, buffer, 33, payload);
            if (commandRet33 && commandRet33.isBuffer) {
                buffer = commandRet33;
                commandRet33 = undefined;
            }
            buffer.write(commandRet33, false);
            buffer.write('\n        </tbody>\n    </table>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});