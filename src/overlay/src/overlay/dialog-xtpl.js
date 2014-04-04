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
            buffer.write('\n');
            var option3 = {
                escape: 1
            };
            var params4 = [];
            params4.push('ks-overlay-content');
            option3.params = params4;
            option3.fn = function (scope, buffer) {

                buffer.write('\n    <div class="');
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
                buffer.write('"\n         style="\n');
                var option8 = {
                    escape: 1
                };
                var params9 = [];
                var id10 = scope.resolve(["headerStyle"]);
                params9.push(id10);
                option8.params = params9;
                option8.fn = function (scope, buffer) {

                    buffer.write('\n ');
                    var id11 = scope.resolve(["xindex"]);
                    buffer.write(id11, true);
                    buffer.write(':');
                    var id12 = scope.resolve(["this"]);
                    buffer.write(id12, true);
                    buffer.write(';\n');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option8, buffer, 5, payload);
                buffer.write('\n"\n         id="ks-stdmod-header-');
                var id13 = scope.resolve(["id"]);
                buffer.write(id13, true);
                buffer.write('">');
                var id14 = scope.resolve(["headerContent"]);
                buffer.write(id14, false);
                buffer.write('</div>\n\n    <div class="');
                var option15 = {
                    escape: 1
                };
                var params16 = [];
                params16.push('body');
                option15.params = params16;
                var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 11);
                if (commandRet17 && commandRet17.isBuffer) {
                    buffer = commandRet17;
                    commandRet17 = undefined;
                }
                buffer.write(commandRet17, true);
                buffer.write('"\n         style="\n');
                var option18 = {
                    escape: 1
                };
                var params19 = [];
                var id20 = scope.resolve(["bodyStyle"]);
                params19.push(id20);
                option18.params = params19;
                option18.fn = function (scope, buffer) {

                    buffer.write('\n ');
                    var id21 = scope.resolve(["xindex"]);
                    buffer.write(id21, true);
                    buffer.write(':');
                    var id22 = scope.resolve(["this"]);
                    buffer.write(id22, true);
                    buffer.write(';\n');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option18, buffer, 13, payload);
                buffer.write('\n"\n         id="ks-stdmod-body-');
                var id23 = scope.resolve(["id"]);
                buffer.write(id23, true);
                buffer.write('">');
                var id24 = scope.resolve(["bodyContent"]);
                buffer.write(id24, false);
                buffer.write('</div>\n\n    <div class="');
                var option25 = {
                    escape: 1
                };
                var params26 = [];
                params26.push('footer');
                option25.params = params26;
                var commandRet27 = callCommandUtil(engine, scope, option25, buffer, "getBaseCssClasses", 19);
                if (commandRet27 && commandRet27.isBuffer) {
                    buffer = commandRet27;
                    commandRet27 = undefined;
                }
                buffer.write(commandRet27, true);
                buffer.write('"\n         style="\n');
                var option28 = {
                    escape: 1
                };
                var params29 = [];
                var id30 = scope.resolve(["footerStyle"]);
                params29.push(id30);
                option28.params = params29;
                option28.fn = function (scope, buffer) {

                    buffer.write('\n ');
                    var id31 = scope.resolve(["xindex"]);
                    buffer.write(id31, true);
                    buffer.write(':');
                    var id32 = scope.resolve(["this"]);
                    buffer.write(id32, true);
                    buffer.write(';\n');

                    return buffer;
                };
                buffer = eachCommand.call(engine, scope, option28, buffer, 21, payload);
                buffer.write('\n"\n         id="ks-stdmod-footer-');
                var id33 = scope.resolve(["id"]);
                buffer.write(id33, true);
                buffer.write('">');
                var id34 = scope.resolve(["footerContent"]);
                buffer.write(id34, false);
                buffer.write('</div>\n    <div tabindex="0"></div>\n');

                return buffer;
            };
            buffer = blockCommand.call(engine, scope, option3, buffer, 2, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});