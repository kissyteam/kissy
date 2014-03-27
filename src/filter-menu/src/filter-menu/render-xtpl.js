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
            buffer.write('<div id="ks-filter-menu-input-wrap-');
            var id0 = scope.resolve(["id"]);
            buffer.write(id0, true);
            buffer.write('"\n     class="');
            var option1 = {
                escape: 1
            };
            var params2 = [];
            params2.push('input-wrap');
            option1.params = params2;
            var commandRet3 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
            if (commandRet3 && commandRet3.isBuffer) {
                buffer = commandRet3;
                commandRet3 = undefined;
            }
            buffer.write(commandRet3, true);
            buffer.write('">\n    <div id="ks-filter-menu-placeholder-');
            var id4 = scope.resolve(["id"]);
            buffer.write(id4, true);
            buffer.write('"\n         class="');
            var option5 = {
                escape: 1
            };
            var params6 = [];
            params6.push('placeholder');
            option5.params = params6;
            var commandRet7 = callCommandUtil(engine, scope, option5, buffer, "getBaseCssClasses", 4);
            if (commandRet7 && commandRet7.isBuffer) {
                buffer = commandRet7;
                commandRet7 = undefined;
            }
            buffer.write(commandRet7, true);
            buffer.write('">\n        ');
            var id8 = scope.resolve(["placeholder"]);
            buffer.write(id8, true);
            buffer.write('\n    </div>\n    <input id="ks-filter-menu-input-');
            var id9 = scope.resolve(["id"]);
            buffer.write(id9, true);
            buffer.write('"\n           class="');
            var option10 = {
                escape: 1
            };
            var params11 = [];
            params11.push('input');
            option10.params = params11;
            var commandRet12 = callCommandUtil(engine, scope, option10, buffer, "getBaseCssClasses", 8);
            if (commandRet12 && commandRet12.isBuffer) {
                buffer = commandRet12;
                commandRet12 = undefined;
            }
            buffer.write(commandRet12, true);
            buffer.write('"\n            autocomplete="off"/>\n</div>\n');
            var option13 = {};
            var params14 = [];
            params14.push('component/extension/content-xtpl');
            option13.params = params14;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                option13.params[0] = moduleWrap.resolve(option13.params[0]);
            }
            var commandRet15 = includeCommand.call(engine, scope, option13, buffer, 11, payload);
            if (commandRet15 && commandRet15.isBuffer) {
                buffer = commandRet15;
                commandRet15 = undefined;
            }
            buffer.write(commandRet15, false);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});