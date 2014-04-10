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
            params4.push('prev-century-btn');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id6 = scope.resolve(["previousCenturyLabel"]);
            buffer.write(id6, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n    <div class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('century');
            option7.params = params8;
            var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 8);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('">\n                ');
            var id10 = scope.resolve(["startYear"]);
            buffer.write(id10, true);
            buffer.write('-');
            var id11 = scope.resolve(["endYear"]);
            buffer.write(id11, true);
            buffer.write('\n    </div>\n    <a class="');
            var option12 = {
                escape: 1
            };
            var params13 = [];
            params13.push('next-century-btn');
            option12.params = params13;
            var commandRet14 = callCommandUtil(engine, scope, option12, buffer, "getBaseCssClasses", 11);
            if (commandRet14 && commandRet14.isBuffer) {
                buffer = commandRet14;
                commandRet14 = undefined;
            }
            buffer.write(commandRet14, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id15 = scope.resolve(["nextCenturyLabel"]);
            buffer.write(id15, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
            var option16 = {
                escape: 1
            };
            var params17 = [];
            params17.push('body');
            option16.params = params17;
            var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 18);
            if (commandRet18 && commandRet18.isBuffer) {
                buffer = commandRet18;
                commandRet18 = undefined;
            }
            buffer.write(commandRet18, true);
            buffer.write('">\n    <table class="');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('table');
            option19.params = params20;
            var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 19);
            if (commandRet21 && commandRet21.isBuffer) {
                buffer = commandRet21;
                commandRet21 = undefined;
            }
            buffer.write(commandRet21, true);
            buffer.write('" cellspacing="0" role="grid">\n        <tbody>\n        ');
            var option22 = {};
            var params23 = [];
            params23.push('date/picker/decade-panel/decades-xtpl');
            option22.params = params23;
            require("date/picker/decade-panel/decades-xtpl");
            option22.params[0] = module.resolve(option22.params[0]);
            var commandRet24 = includeCommand.call(engine, scope, option22, buffer, 21, payload);
            if (commandRet24 && commandRet24.isBuffer) {
                buffer = commandRet24;
                commandRet24 = undefined;
            }
            buffer.write(commandRet24, false);
            buffer.write('\n        </tbody>\n    </table>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});