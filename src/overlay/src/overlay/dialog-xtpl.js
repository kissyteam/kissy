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
            buffer.write('');
            var option0 = {};
            var params1 = [];
            params1.push('./overlay-xtpl');
            option0.params = params1;
            require("./overlay-xtpl");
            option0.params[0] = module.resolve(option0.params[0]);
            var commandRet2 = extendCommand.call(engine, scope, option0, buffer, 1, payload);
            if (commandRet2 && commandRet2.isBuffer) {
                buffer = commandRet2;
                commandRet2 = undefined;
            }
            buffer.write(commandRet2, false);
            buffer.write('\r\n');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('ks-overlay-content');
            option3.params = params4;
            option3.fn = function (scope, buffer) {

                buffer.write('\r\n    <div class="');
                var option5 = {
                    escape: 1
                };
                var params6 = [];
                params6.push('header');
                option5.params = params6;
                var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 3);
                if (commandRet7 && commandRet7.isBuffer) {
                    buffer = commandRet7;
                    commandRet7 = undefined;
                }
                buffer.write(commandRet7, true);
                buffer.write('"\r\n         style="\r\n');
                var option8 = {
                    escape: 1
                };
                var params9 = [];
                var id10 = scope.resolve(["headerStyle"]);
                params9.push(id10);
                option8.params = params9;
                option8.fn = function (scope, buffer) {

                    buffer.write('\r\n ');
                    var id11 = scope.resolve(["xindex"]);
                    buffer.write(id11, true);
                    buffer.write(':');
                    var id12 = scope.resolve(["this"]);
                    buffer.write(id12, true);
                    buffer.write(';\r\n');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option8, buffer, 5, payload);
                buffer.write('\r\n">');
                var id13 = scope.resolve(["headerContent"]);
                buffer.write(id13, false);
                buffer.write('</div>\r\n\r\n    <div class="');
                var option14 = {
                    escape: 1
                };
                var params15 = [];
                params15.push('body');
                option14.params = params15;
                var commandRet16 = callCommandUtil(engine, scope, option14, buffer, "getBaseCssClasses", 10);
                if (commandRet16 && commandRet16.isBuffer) {
                    buffer = commandRet16;
                    commandRet16 = undefined;
                }
                buffer.write(commandRet16, true);
                buffer.write('"\r\n         style="\r\n');
                var option17 = {
                    escape: 1
                };
                var params18 = [];
                var id19 = scope.resolve(["bodyStyle"]);
                params18.push(id19);
                option17.params = params18;
                option17.fn = function (scope, buffer) {

                    buffer.write('\r\n ');
                    var id20 = scope.resolve(["xindex"]);
                    buffer.write(id20, true);
                    buffer.write(':');
                    var id21 = scope.resolve(["this"]);
                    buffer.write(id21, true);
                    buffer.write(';\r\n');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option17, buffer, 12, payload);
                buffer.write('\r\n">');
                var id22 = scope.resolve(["bodyContent"]);
                buffer.write(id22, false);
                buffer.write('</div>\r\n\r\n    <div class="');
                var option23 = {
                    escape: 1
                };
                var params24 = [];
                params24.push('footer');
                option23.params = params24;
                var commandRet25 = callCommandUtil(engine, scope, option23, buffer, "getBaseCssClasses", 17);
                if (commandRet25 && commandRet25.isBuffer) {
                    buffer = commandRet25;
                    commandRet25 = undefined;
                }
                buffer.write(commandRet25, true);
                buffer.write('"\r\n         style="\r\n');
                var option26 = {
                    escape: 1
                };
                var params27 = [];
                var id28 = scope.resolve(["footerStyle"]);
                params27.push(id28);
                option26.params = params27;
                option26.fn = function (scope, buffer) {

                    buffer.write('\r\n ');
                    var id29 = scope.resolve(["xindex"]);
                    buffer.write(id29, true);
                    buffer.write(':');
                    var id30 = scope.resolve(["this"]);
                    buffer.write(id30, true);
                    buffer.write(';\r\n');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option26, buffer, 19, payload);
                buffer.write('\r\n">');
                var id31 = scope.resolve(["footerContent"]);
                buffer.write(id31, false);
                buffer.write('</div>\r\n    <div tabindex="0"></div>\r\n');

                return buffer;
            };
            buffer = blockCommand.call(engine, scope, option3, buffer, 2, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});