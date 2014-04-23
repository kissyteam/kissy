/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("5.0.0" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
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
            buffer.write('">\r\n    <a class="');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('prev-year-btn');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id6 = scope.resolve(["previousYearLabel"]);
            buffer.write(id6, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('year-select');
            option7.params = params8;
            var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 9);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="');
            var id10 = scope.resolve(["yearSelectLabel"]);
            buffer.write(id10, true);
            buffer.write('">\r\n        <span class="');
            var option11 = {
                escape: 1
            };
            var params12 = [];
            params12.push('year-select-content');
            option11.params = params12;
            var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 14);
            if (commandRet13 && commandRet13.isBuffer) {
                buffer = commandRet13;
                commandRet13 = undefined;
            }
            buffer.write(commandRet13, true);
            buffer.write('">');
            var id14 = scope.resolve(["year"]);
            buffer.write(id14, true);
            buffer.write('</span>\r\n        <span class="');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('year-select-arrow');
            option15.params = params16;
            var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 15);
            if (commandRet17 && commandRet17.isBuffer) {
                buffer = commandRet17;
                commandRet17 = undefined;
            }
            buffer.write(commandRet17, true);
            buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="');
            var option18 = {
                escape: 1
            };
            var params19 = [];
            params19.push('next-year-btn');
            option18.params = params19;
            var commandRet20 = callCommandUtil(engine, scope, option18, buffer, "getBaseCssClasses", 18);
            if (commandRet20 && commandRet20.isBuffer) {
                buffer = commandRet20;
                commandRet20 = undefined;
            }
            buffer.write(commandRet20, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id21 = scope.resolve(["nextYearLabel"]);
            buffer.write(id21, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
            var option22 = {
                escape: 1
            };
            var params23 = [];
            params23.push('body');
            option22.params = params23;
            var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 25);
            if (commandRet24 && commandRet24.isBuffer) {
                buffer = commandRet24;
                commandRet24 = undefined;
            }
            buffer.write(commandRet24, true);
            buffer.write('">\r\n    <table class="');
            var option25 = {
                escape: 1
            };
            var params26 = [];
            params26.push('table');
            option25.params = params26;
            var commandRet27 = callCommandUtil(engine, scope, option25, buffer, "getBaseCssClasses", 26);
            if (commandRet27 && commandRet27.isBuffer) {
                buffer = commandRet27;
                commandRet27 = undefined;
            }
            buffer.write(commandRet27, true);
            buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="');
            var option28 = {
                escape: 1
            };
            var params29 = [];
            params29.push('tbody');
            option28.params = params29;
            var commandRet30 = callCommandUtil(engine, scope, option28, buffer, "getBaseCssClasses", 27);
            if (commandRet30 && commandRet30.isBuffer) {
                buffer = commandRet30;
                commandRet30 = undefined;
            }
            buffer.write(commandRet30, true);
            buffer.write('">\r\n        ');
            var option31 = {};
            var params32 = [];
            params32.push('./months-xtpl');
            option31.params = params32;
            require("./months-xtpl");
            option31.params[0] = module.resolve(option31.params[0]);
            var commandRet33 = includeCommand.call(engine, scope, option31, buffer, 28, payload);
            if (commandRet33 && commandRet33.isBuffer) {
                buffer = commandRet33;
                commandRet33 = undefined;
            }
            buffer.write(commandRet33, false);
            buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});