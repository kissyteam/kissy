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
            buffer.write('<div id="ks-tree-node-row-');
            var id0 = scope.resolve(["id"]);
            buffer.write(id0, true);
            buffer.write('"\n     class="');
            var option1 = {
                escape: 1
            };
            var params2 = [];
            params2.push('row');
            option1.params = params2;
            var commandRet3 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
            if (commandRet3 && commandRet3.isBuffer) {
                buffer = commandRet3;
                commandRet3 = undefined;
            }
            buffer.write(commandRet3, true);
            buffer.write('\n     ');
            var option4 = {
                escape: 1
            };
            var params5 = [];
            var id6 = scope.resolve(["selected"]);
            params5.push(id6);
            option4.params = params5;
            option4.fn = function (scope, buffer) {

                buffer.write('\n        ');
                var option7 = {
                    escape: 1
                };
                var params8 = [];
                params8.push('selected');
                option7.params = params8;
                var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 4);
                if (commandRet9 && commandRet9.isBuffer) {
                    buffer = commandRet9;
                    commandRet9 = undefined;
                }
                buffer.write(commandRet9, true);
                buffer.write('\n     ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option4, buffer, 3, payload);
            buffer.write('\n     ">\n    <div id="ks-tree-node-expand-icon-');
            var id10 = scope.resolve(["id"]);
            buffer.write(id10, true);
            buffer.write('"\n         class="');
            var option11 = {
                escape: 1
            };
            var params12 = [];
            params12.push('expand-icon');
            option11.params = params12;
            var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 8);
            if (commandRet13 && commandRet13.isBuffer) {
                buffer = commandRet13;
                commandRet13 = undefined;
            }
            buffer.write(commandRet13, true);
            buffer.write('">\n    </div>\n    ');
            var option14 = {
                escape: 1
            };
            var params15 = [];
            var id16 = scope.resolve(["checkable"]);
            params15.push(id16);
            option14.params = params15;
            option14.fn = function (scope, buffer) {

                buffer.write('\n    <div id="ks-tree-node-checked-');
                var id17 = scope.resolve(["id"]);
                buffer.write(id17, true);
                buffer.write('"\n         class="');
                var option18 = {
                    escape: 1
                };
                var params19 = [];
                var exp21 = 'checked';
                var id20 = scope.resolve(["checkState"]);
                exp21 = ('checked') + (id20);
                params19.push(exp21);
                option18.params = params19;
                var commandRet22 = callCommandUtil(engine, scope, option18, buffer, "getBaseCssClasses", 12);
                if (commandRet22 && commandRet22.isBuffer) {
                    buffer = commandRet22;
                    commandRet22 = undefined;
                }
                buffer.write(commandRet22, true);
                buffer.write('"></div>\n    ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option14, buffer, 10, payload);
            buffer.write('\n    <div id="ks-tree-node-icon-');
            var id23 = scope.resolve(["id"]);
            buffer.write(id23, true);
            buffer.write('"\n         class="');
            var option24 = {
                escape: 1
            };
            var params25 = [];
            params25.push('icon');
            option24.params = params25;
            var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 15);
            if (commandRet26 && commandRet26.isBuffer) {
                buffer = commandRet26;
                commandRet26 = undefined;
            }
            buffer.write(commandRet26, true);
            buffer.write('">\n\n    </div>\n    ');
            var option27 = {};
            var params28 = [];
            params28.push('component/extension/content-xtpl');
            option27.params = params28;
            if (moduleWrap) {
                require("component/extension/content-xtpl");
                option27.params[0] = moduleWrap.resolveByName(option27.params[0]);
            }
            var commandRet29 = includeCommand.call(engine, scope, option27, buffer, 18, payload);
            if (commandRet29 && commandRet29.isBuffer) {
                buffer = commandRet29;
                commandRet29 = undefined;
            }
            buffer.write(commandRet29, false);
            buffer.write('\n</div>\n<div id="ks-tree-node-children-');
            var id30 = scope.resolve(["id"]);
            buffer.write(id30, true);
            buffer.write('"\n     class="');
            var option31 = {
                escape: 1
            };
            var params32 = [];
            params32.push('children');
            option31.params = params32;
            var commandRet33 = callCommandUtil(engine, scope, option31, buffer, "getBaseCssClasses", 21);
            if (commandRet33 && commandRet33.isBuffer) {
                buffer = commandRet33;
                commandRet33 = undefined;
            }
            buffer.write(commandRet33, true);
            buffer.write('"\n');
            var option34 = {
                escape: 1
            };
            var params35 = [];
            var id36 = scope.resolve(["expanded"]);
            params35.push(!(id36));
            option34.params = params35;
            option34.fn = function (scope, buffer) {

                buffer.write('\nstyle="display:none"\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option34, buffer, 22, payload);
            buffer.write('\n>\n</div>');
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});