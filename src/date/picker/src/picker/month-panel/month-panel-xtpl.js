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
            buffer.write('">\n    <a class="');
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
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id6 = scope.resolve(["previousYearLabel"]);
            buffer.write(id6, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n\n\n        <a class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('year-select');
            option7.params = params8;
            var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 10);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('"\n           role="button"\n           href="#"\n           hidefocus="on"\n           title="');
            var id10 = scope.resolve(["yearSelectLabel"]);
            buffer.write(id10, true);
            buffer.write('">\n            <span>');
            var id11 = scope.resolve(["year"]);
            buffer.write(id11, true);
            buffer.write('</span>\n            <span class="');
            var option12 = {
                escape: 1
            };
            var params13 = [];
            params13.push('year-select-arrow');
            option12.params = params13;
            var commandRet14 = callCommandUtil(engine, scope, option12, buffer, "getBaseCssClasses", 16);
            if (commandRet14 && commandRet14.isBuffer) {
                buffer = commandRet14;
                commandRet14 = undefined;
            }
            buffer.write(commandRet14, true);
            buffer.write('">x</span>\n        </a>\n\n    <a class="');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('next-year-btn');
            option15.params = params16;
            var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 19);
            if (commandRet17 && commandRet17.isBuffer) {
                buffer = commandRet17;
                commandRet17 = undefined;
            }
            buffer.write(commandRet17, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id18 = scope.resolve(["nextYearLabel"]);
            buffer.write(id18, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('body');
            option19.params = params20;
            var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 26);
            if (commandRet21 && commandRet21.isBuffer) {
                buffer = commandRet21;
                commandRet21 = undefined;
            }
            buffer.write(commandRet21, true);
            buffer.write('">\n    <table class="');
            var option22 = {
                escape: 1
            };
            var params23 = [];
            params23.push('table');
            option22.params = params23;
            var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 27);
            if (commandRet24 && commandRet24.isBuffer) {
                buffer = commandRet24;
                commandRet24 = undefined;
            }
            buffer.write(commandRet24, true);
            buffer.write('" cellspacing="0" role="grid">\n        <tbody>\n        ');
            var option25 = {};
            var params26 = [];
            params26.push('date/picker/month-panel/months-xtpl');
            option25.params = params26;
            require("date/picker/month-panel/months-xtpl");
            option25.params[0] = module.resolve(option25.params[0]);
            var commandRet27 = includeCommand.call(engine, scope, option25, buffer, 29, payload);
            if (commandRet27 && commandRet27.isBuffer) {
                buffer = commandRet27;
                commandRet27 = undefined;
            }
            buffer.write(commandRet27, false);
            buffer.write('\n        </tbody>\n    </table>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});