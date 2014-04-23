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
            params4.push('prev-decade-btn');
            option3.params = params4;
            var commandRet5 = callCommandUtil(engine, scope, option3, buffer, "getBaseCssClasses", 2);
            if (commandRet5 && commandRet5.isBuffer) {
                buffer = commandRet5;
                commandRet5 = undefined;
            }
            buffer.write(commandRet5, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id6 = scope.resolve(["previousDecadeLabel"]);
            buffer.write(id6, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="');
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
            buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="');
            var id10 = scope.resolve(["decadeSelectLabel"]);
            buffer.write(id10, true);
            buffer.write('">\r\n            <span class="');
            var option11 = {
                escape: 1
            };
            var params12 = [];
            params12.push('decade-select-content');
            option11.params = params12;
            var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 14);
            if (commandRet13 && commandRet13.isBuffer) {
                buffer = commandRet13;
                commandRet13 = undefined;
            }
            buffer.write(commandRet13, true);
            buffer.write('">\r\n                ');
            var id14 = scope.resolve(["startYear"]);
            buffer.write(id14, true);
            buffer.write('-');
            var id15 = scope.resolve(["endYear"]);
            buffer.write(id15, true);
            buffer.write('\r\n            </span>\r\n        <span class="');
            var option16 = {
                escape: 1
            };
            var params17 = [];
            params17.push('decade-select-arrow');
            option16.params = params17;
            var commandRet18 = callCommandUtil(engine, scope, option16, buffer, "getBaseCssClasses", 17);
            if (commandRet18 && commandRet18.isBuffer) {
                buffer = commandRet18;
                commandRet18 = undefined;
            }
            buffer.write(commandRet18, true);
            buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('next-decade-btn');
            option19.params = params20;
            var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 20);
            if (commandRet21 && commandRet21.isBuffer) {
                buffer = commandRet21;
                commandRet21 = undefined;
            }
            buffer.write(commandRet21, true);
            buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="');
            var id22 = scope.resolve(["nextDecadeLabel"]);
            buffer.write(id22, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
            var option23 = {
                escape: 1
            };
            var params24 = [];
            params24.push('body');
            option23.params = params24;
            var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 27);
            if (commandRet25 && commandRet25.isBuffer) {
                buffer = commandRet25;
                commandRet25 = undefined;
            }
            buffer.write(commandRet25, true);
            buffer.write('">\r\n    <table class="');
            var option26 = {
                escape: 1
            };
            var params27 = [];
            params27.push('table');
            option26.params = params27;
            var commandRet28 = callCommandUtil(engine, scope, option26, buffer, "getBaseCssClasses", 28);
            if (commandRet28 && commandRet28.isBuffer) {
                buffer = commandRet28;
                commandRet28 = undefined;
            }
            buffer.write(commandRet28, true);
            buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="');
            var option29 = {
                escape: 1
            };
            var params30 = [];
            params30.push('tbody');
            option29.params = params30;
            var commandRet31 = callCommandUtil(engine, scope, option29, buffer, "getBaseCssClasses", 29);
            if (commandRet31 && commandRet31.isBuffer) {
                buffer = commandRet31;
                commandRet31 = undefined;
            }
            buffer.write(commandRet31, true);
            buffer.write('">\r\n        ');
            var option32 = {};
            var params33 = [];
            params33.push('./years-xtpl');
            option32.params = params33;
            require("./years-xtpl");
            option32.params[0] = module.resolve(option32.params[0]);
            var commandRet34 = includeCommand.call(engine, scope, option32, buffer, 30, payload);
            if (commandRet34 && commandRet34.isBuffer) {
                buffer = commandRet34;
                commandRet34 = undefined;
            }
            buffer.write(commandRet34, false);
            buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});