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
            params4.push('prev-decade-btn');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id6 = scope.resolve(["previousDecadeLabel"]);
            buffer.write(id6, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n\n    <a class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('decade-select');
            option7.params = params8;
            var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 9);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('"\n       role="button"\n       href="#"\n       hidefocus="on"\n       title="');
            var id10 = scope.resolve(["decadeSelectLabel"]);
            buffer.write(id10, true);
            buffer.write('">\n            <span>\n                ');
            var id11 = scope.resolve(["startYear"]);
            buffer.write(id11, true);
            buffer.write('-');
            var id12 = scope.resolve(["endYear"]);
            buffer.write(id12, true);
            buffer.write('\n            </span>\n        <span class="');
            var option13 = {
                escape: 1
            };
            var params14 = [];
            params14.push('decade-select-arrow');
            option13.params = params14;
            var commandRet15 = callCommandUtil(engine, scope, option13, buffer, "getBaseCssClasses", 17);
            if (commandRet15 && commandRet15.isBuffer) {
                buffer = commandRet15;
                commandRet15 = undefined;
            }
            buffer.write(commandRet15, true);
            buffer.write('">x</span>\n    </a>\n\n    <a class="');
            var option16 = {
                escape: 1
            };
            var params17 = [];
            params17.push('next-decade-btn');
            option16.params = params17;
            var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 20);
            if (commandRet18 && commandRet18.isBuffer) {
                buffer = commandRet18;
                commandRet18 = undefined;
            }
            buffer.write(commandRet18, true);
            buffer.write('"\n       href="#"\n       role="button"\n       title="');
            var id19 = scope.resolve(["nextDecadeLabel"]);
            buffer.write(id19, true);
            buffer.write('"\n       hidefocus="on">\n    </a>\n</div>\n<div class="');
            var option20 = {
                escape: 1
            };
            var params21 = [];
            params21.push('body');
            option20.params = params21;
            var commandRet22 = callCommandUtil(engine, scope, option20, buffer, "getBaseCssClasses", 27);
            if (commandRet22 && commandRet22.isBuffer) {
                buffer = commandRet22;
                commandRet22 = undefined;
            }
            buffer.write(commandRet22, true);
            buffer.write('">\n    <table class="');
            var option23 = {
                escape: 1
            };
            var params24 = [];
            params24.push('table');
            option23.params = params24;
            var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 28);
            if (commandRet25 && commandRet25.isBuffer) {
                buffer = commandRet25;
                commandRet25 = undefined;
            }
            buffer.write(commandRet25, true);
            buffer.write('" cellspacing="0" role="grid">\n        <tbody>\n        ');
            var option26 = {};
            var params27 = [];
            params27.push('date/picker/year-panel/years-xtpl');
            option26.params = params27;
            require("date/picker/year-panel/years-xtpl");
            option26.params[0] = module.resolve(option26.params[0]);
            var commandRet28 = includeCommand.call(engine, scope, option26, buffer, 30, payload);
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