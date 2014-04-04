/** Compiled By kissy-xtemplate */
KISSY.add(function (S, require, exports, module) {
        /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
        var t = function (scope, buffer, payload, undefined) {
            var engine = this,
                nativeCommands = engine.nativeCommands,
                utils = engine.utils;
            if ("1.50" !== S.version) {
                throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
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
            buffer.write('">\n    <a id="ks-date-picker-decade-panel-previous-century-btn-');
            var id3 = scope.resolve(["id"]);
            buffer.write(id3, true);
            buffer.write('"\n       class="');
            var option4 = {
                escape: 1
            };
            var params5 = [];
            params5.push('prev-century-btn');
            option4.params = params5;
            var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
            if (commandRet6 && commandRet6.isBuffer) {
                buffer = commandRet6;
                commandRet6 = undefined;
            }
            buffer.write(commandRet6, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id7 = scope.resolve(["previousCenturyLabel"]);
            buffer.write(id7, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n    <div class="');
            var option8 = {
                escape: 1
            };
            var params9 = [];
            params9.push('century');
            option8.params = params9;
            var commandRet10 = callCommandUtil(engine, scope, option8, buffer, "getBaseCssClasses", 9);
            if (commandRet10 && commandRet10.isBuffer) {
                buffer = commandRet10;
                commandRet10 = undefined;
            }
            buffer.write(commandRet10, true);
            buffer.write('"\n         id="ks-date-picker-decade-panel-century-');
            var id11 = scope.resolve(["id"]);
            buffer.write(id11, true);
            buffer.write('">\n                ');
            var id12 = scope.resolve(["startYear"]);
            buffer.write(id12, true);
            buffer.write('-');
            var id13 = scope.resolve(["endYear"]);
            buffer.write(id13, true);
            buffer.write('\n    </div>\n    <a id="ks-date-picker-decade-panel-next-century-btn-');
            var id14 = scope.resolve(["id"]);
            buffer.write(id14, true);
            buffer.write('"\n       class="');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('next-century-btn');
            option15.params = params16;
            var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 14);
            if (commandRet17 && commandRet17.isBuffer) {
                buffer = commandRet17;
                commandRet17 = undefined;
            }
            buffer.write(commandRet17, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id18 = scope.resolve(["nextCenturyLabel"]);
            buffer.write(id18, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('body');
            option19.params = params20;
            var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 21);
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
            var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 22);
            if (commandRet24 && commandRet24.isBuffer) {
                buffer = commandRet24;
                commandRet24 = undefined;
            }
            buffer.write(commandRet24, true);
            buffer.write('" cellspacing="0" role="grid">\n        <tbody id="ks-date-picker-decade-panel-tbody-');
            var id25 = scope.resolve(["id"]);
            buffer.write(id25, true);
            buffer.write('">\n        ');
            var option26 = {};
            var params27 = [];
            params27.push('date/picker/decade-panel/decades-xtpl');
            option26.params = params27;
            require("date/picker/decade-panel/decades-xtpl");
            option26.params[0] = module.resolve(option26.params[0]);
            var commandRet28 = includeCommand.call(engine, scope, option26, buffer, 24, payload);
            if (commandRet28 && commandRet28.isBuffer) {
                buffer = commandRet28;
                commandRet28 = undefined;
            }
            buffer.write(commandRet28, false);
            buffer.write('\n        </tbody>\n    </table>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});