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
            buffer.write('">\n    <a id="ks-date-picker-month-panel-previous-year-btn-');
            var id3 = scope.resolve(["id"]);
            buffer.write(id3, true);
            buffer.write('"\n       class="');
            var option4 = {
                escape: 1
            };
            var params5 = [];
            params5.push('prev-year-btn');
            option4.params = params5;
            var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
            if (commandRet6 && commandRet6.isBuffer) {
                buffer = commandRet6;
                commandRet6 = undefined;
            }
            buffer.write(commandRet6, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id7 = scope.resolve(["previousYearLabel"]);
            buffer.write(id7, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n\n\n        <a class="');
            var option8 = {
                escape: 1
            };
            var params9 = [];
            params9.push('year-select');
            option8.params = params9;
            var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 11);
            if (commandRet10 && commandRet10.isBuffer) {
                buffer = commandRet10;
                commandRet10 = undefined;
            }
            buffer.write(commandRet10, true);
            buffer.write('"\n           role="button"\n           href="#"\n           hidefocus="on"\n           title="');
            var id11 = scope.resolve(["yearSelectLabel"]);
            buffer.write(id11, true);
            buffer.write('"\n           id="ks-date-picker-month-panel-year-select-');
            var id12 = scope.resolve(["id"]);
            buffer.write(id12, true);
            buffer.write('">\n            <span id="ks-date-picker-month-panel-year-select-content-');
            var id13 = scope.resolve(["id"]);
            buffer.write(id13, true);
            buffer.write('">');
            var id14 = scope.resolve(["year"]);
            buffer.write(id14, true);
            buffer.write('</span>\n            <span class="');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('year-select-arrow');
            option15.params = params16;
            var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 18);
            if (commandRet17 && commandRet17.isBuffer) {
                buffer = commandRet17;
                commandRet17 = undefined;
            }
            buffer.write(commandRet17, true);
            buffer.write('">x</span>\n        </a>\n\n    <a id="ks-date-picker-month-panel-next-year-btn-');
            var id18 = scope.resolve(["id"]);
            buffer.write(id18, true);
            buffer.write('"\n       class="');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('next-year-btn');
            option19.params = params20;
            var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 22);
            if (commandRet21 && commandRet21.isBuffer) {
                buffer = commandRet21;
                commandRet21 = undefined;
            }
            buffer.write(commandRet21, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id22 = scope.resolve(["nextYearLabel"]);
            buffer.write(id22, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
            var option23 = {
                escape: 1
            };
            var params24 = [];
            params24.push('body');
            option23.params = params24;
            var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 29);
            if (commandRet25 && commandRet25.isBuffer) {
                buffer = commandRet25;
                commandRet25 = undefined;
            }
            buffer.write(commandRet25, true);
            buffer.write('">\n    <table class="');
            var option26 = {
                escape: 1
            };
            var params27 = [];
            params27.push('table');
            option26.params = params27;
            var commandRet28 = callCommandUtil(engine, scope, option26, buffer, "getBaseCssClasses", 30);
            if (commandRet28 && commandRet28.isBuffer) {
                buffer = commandRet28;
                commandRet28 = undefined;
            }
            buffer.write(commandRet28, true);
            buffer.write('" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-month-panel-tbody-');
            var id29 = scope.resolve(["id"]);
            buffer.write(id29, true);
            buffer.write('">\n        ');
            var option30 = {};
            var params31 = [];
            params31.push('date/picker/month-panel/months-xtpl');
            option30.params = params31;
            if (moduleWrap) {
                require("date/picker/month-panel/months-xtpl");
                option30.params[0] = moduleWrap.resolve(option30.params[0]);
            }
            var commandRet32 = includeCommand.call(engine, scope, option30, buffer, 32, payload);
            if (commandRet32 && commandRet32.isBuffer) {
                buffer = commandRet32;
                commandRet32 = undefined;
            }
            buffer.write(commandRet32, false);
            buffer.write('\n        </tbody>\n    </table>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});