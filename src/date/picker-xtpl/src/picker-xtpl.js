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
            buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
            var id6 = scope.resolve(["previousYearLabel"]);
            buffer.write(id6, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
            var option7 = {
                escape: 1
            };
            var params8 = [];
            params8.push('prev-month-btn');
            option7.params = params8;
            var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 9);
            if (commandRet9 && commandRet9.isBuffer) {
                buffer = commandRet9;
                commandRet9 = undefined;
            }
            buffer.write(commandRet9, true);
            buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
            var id10 = scope.resolve(["previousMonthLabel"]);
            buffer.write(id10, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
            var option11 = {
                escape: 1
            };
            var params12 = [];
            params12.push('month-select');
            option11.params = params12;
            var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 16);
            if (commandRet13 && commandRet13.isBuffer) {
                buffer = commandRet13;
                commandRet13 = undefined;
            }
            buffer.write(commandRet13, true);
            buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       tabindex="-1"\r\n       hidefocus="on"\r\n       title="');
            var id14 = scope.resolve(["monthSelectLabel"]);
            buffer.write(id14, true);
            buffer.write('">\r\n        <span class="');
            var option15 = {
                escape: 1
            };
            var params16 = [];
            params16.push('month-select-content');
            option15.params = params16;
            var commandRet17 = callCommandUtil(engine, scope, option15, buffer, "getBaseCssClasses", 22);
            if (commandRet17 && commandRet17.isBuffer) {
                buffer = commandRet17;
                commandRet17 = undefined;
            }
            buffer.write(commandRet17, true);
            buffer.write('">');
            var id18 = scope.resolve(["monthYearLabel"]);
            buffer.write(id18, true);
            buffer.write('</span>\r\n        <span class="');
            var option19 = {
                escape: 1
            };
            var params20 = [];
            params20.push('month-select-arrow');
            option19.params = params20;
            var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 23);
            if (commandRet21 && commandRet21.isBuffer) {
                buffer = commandRet21;
                commandRet21 = undefined;
            }
            buffer.write(commandRet21, true);
            buffer.write('">x</span>\r\n    </a>\r\n    <a class="');
            var option22 = {
                escape: 1
            };
            var params23 = [];
            params23.push('next-month-btn');
            option22.params = params23;
            var commandRet24 = callCommandUtil(engine, scope, option22, buffer, "getBaseCssClasses", 25);
            if (commandRet24 && commandRet24.isBuffer) {
                buffer = commandRet24;
                commandRet24 = undefined;
            }
            buffer.write(commandRet24, true);
            buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
            var id25 = scope.resolve(["nextMonthLabel"]);
            buffer.write(id25, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
            var option26 = {
                escape: 1
            };
            var params27 = [];
            params27.push('next-year-btn');
            option26.params = params27;
            var commandRet28 = callCommandUtil(engine, scope, option26, buffer, "getBaseCssClasses", 32);
            if (commandRet28 && commandRet28.isBuffer) {
                buffer = commandRet28;
                commandRet28 = undefined;
            }
            buffer.write(commandRet28, true);
            buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
            var id29 = scope.resolve(["nextYearLabel"]);
            buffer.write(id29, true);
            buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
            var option30 = {
                escape: 1
            };
            var params31 = [];
            params31.push('body');
            option30.params = params31;
            var commandRet32 = callCommandUtil(engine, scope, option30, buffer, "getBaseCssClasses", 40);
            if (commandRet32 && commandRet32.isBuffer) {
                buffer = commandRet32;
                commandRet32 = undefined;
            }
            buffer.write(commandRet32, true);
            buffer.write('">\r\n    <table class="');
            var option33 = {
                escape: 1
            };
            var params34 = [];
            params34.push('table');
            option33.params = params34;
            var commandRet35 = callCommandUtil(engine, scope, option33, buffer, "getBaseCssClasses", 41);
            if (commandRet35 && commandRet35.isBuffer) {
                buffer = commandRet35;
                commandRet35 = undefined;
            }
            buffer.write(commandRet35, true);
            buffer.write('" cellspacing="0" role="grid">\r\n        <thead>\r\n        <tr role="row">\r\n            ');
            var option36 = {
                escape: 1
            };
            var params37 = [];
            var id38 = scope.resolve(["showWeekNumber"]);
            params37.push(id38);
            option36.params = params37;
            option36.fn = function (scope, buffer) {

                buffer.write('\r\n            <th role="columnheader" class="');
                var option39 = {
                    escape: 1
                };
                var params40 = [];
                params40.push('column-header');
                option39.params = params40;
                var commandRet41 = callCommandUtil(engine, scope, option39, buffer, "getBaseCssClasses", 45);
                if (commandRet41 && commandRet41.isBuffer) {
                    buffer = commandRet41;
                    commandRet41 = undefined;
                }
                buffer.write(commandRet41, true);
                buffer.write(' ');
                var option42 = {
                    escape: 1
                };
                var params43 = [];
                params43.push('week-number-header');
                option42.params = params43;
                var commandRet44 = callCommandUtil(engine, scope, option42, buffer, "getBaseCssClasses", 45);
                if (commandRet44 && commandRet44.isBuffer) {
                    buffer = commandRet44;
                    commandRet44 = undefined;
                }
                buffer.write(commandRet44, true);
                buffer.write('">\r\n                <span class="');
                var option45 = {
                    escape: 1
                };
                var params46 = [];
                params46.push('column-header-inner');
                option45.params = params46;
                var commandRet47 = callCommandUtil(engine, scope, option45, buffer, "getBaseCssClasses", 46);
                if (commandRet47 && commandRet47.isBuffer) {
                    buffer = commandRet47;
                    commandRet47 = undefined;
                }
                buffer.write(commandRet47, true);
                buffer.write('">x</span>\r\n            </th>\r\n            ');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option36, buffer, 44, payload);
            buffer.write('\r\n            ');
            var option48 = {
                escape: 1
            };
            var params49 = [];
            var id50 = scope.resolve(["weekdays"]);
            params49.push(id50);
            option48.params = params49;
            option48.fn = function (scope, buffer) {

                buffer.write('\r\n            <th role="columnheader" title="');
                var id51 = scope.resolve(["this"]);
                buffer.write(id51, true);
                buffer.write('" class="');
                var option52 = {
                    escape: 1
                };
                var params53 = [];
                params53.push('column-header');
                option52.params = params53;
                var commandRet54 = callCommandUtil(engine, scope, option52, buffer, "getBaseCssClasses", 50);
                if (commandRet54 && commandRet54.isBuffer) {
                    buffer = commandRet54;
                    commandRet54 = undefined;
                }
                buffer.write(commandRet54, true);
                buffer.write('">\r\n                <span class="');
                var option55 = {
                    escape: 1
                };
                var params56 = [];
                params56.push('column-header-inner');
                option55.params = params56;
                var commandRet57 = callCommandUtil(engine, scope, option55, buffer, "getBaseCssClasses", 51);
                if (commandRet57 && commandRet57.isBuffer) {
                    buffer = commandRet57;
                    commandRet57 = undefined;
                }
                buffer.write(commandRet57, true);
                buffer.write('">\r\n                    ');
                var id59 = scope.resolve(["xindex"]);
                var id58 = scope.resolve(["veryShortWeekdays", id59]);
                buffer.write(id58, true);
                buffer.write('\r\n                </span>\r\n            </th>\r\n            ');

                return buffer;
            };
            buffer = eachCommand.call(engine, scope, option48, buffer, 49, payload);
            buffer.write('\r\n        </tr>\r\n        </thead>\r\n        <tbody class="');
            var option60 = {
                escape: 1
            };
            var params61 = [];
            params61.push('tbody');
            option60.params = params61;
            var commandRet62 = callCommandUtil(engine, scope, option60, buffer, "getBaseCssClasses", 58);
            if (commandRet62 && commandRet62.isBuffer) {
                buffer = commandRet62;
                commandRet62 = undefined;
            }
            buffer.write(commandRet62, true);
            buffer.write('">\r\n        ');
            var option63 = {};
            var commandRet64 = callCommandUtil(engine, scope, option63, buffer, "renderDates", 59);
            if (commandRet64 && commandRet64.isBuffer) {
                buffer = commandRet64;
                commandRet64 = undefined;
            }
            buffer.write(commandRet64, false);
            buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>\r\n');
            var option65 = {
                escape: 1
            };
            var params66 = [];
            var id67 = scope.resolve(["showToday"]);
            var exp69 = id67;
            if (!(id67)) {
                var id68 = scope.resolve(["showClear"]);
                exp69 = id68;
            }
            params66.push(exp69);
            option65.params = params66;
            option65.fn = function (scope, buffer) {

                buffer.write('\r\n<div class="');
                var option70 = {
                    escape: 1
                };
                var params71 = [];
                params71.push('footer');
                option70.params = params71;
                var commandRet72 = callCommandUtil(engine, scope, option70, buffer, "getBaseCssClasses", 64);
                if (commandRet72 && commandRet72.isBuffer) {
                    buffer = commandRet72;
                    commandRet72 = undefined;
                }
                buffer.write(commandRet72, true);
                buffer.write('">\r\n    <a class="');
                var option73 = {
                    escape: 1
                };
                var params74 = [];
                params74.push('today-btn');
                option73.params = params74;
                var commandRet75 = callCommandUtil(engine, scope, option73, buffer, "getBaseCssClasses", 65);
                if (commandRet75 && commandRet75.isBuffer) {
                    buffer = commandRet75;
                    commandRet75 = undefined;
                }
                buffer.write(commandRet75, true);
                buffer.write('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#"\r\n       title="');
                var id76 = scope.resolve(["todayTimeLabel"]);
                buffer.write(id76, true);
                buffer.write('">');
                var id77 = scope.resolve(["todayLabel"]);
                buffer.write(id77, true);
                buffer.write('</a>\r\n    <a class="');
                var option78 = {
                    escape: 1
                };
                var params79 = [];
                params79.push('clear-btn');
                option78.params = params79;
                var commandRet80 = callCommandUtil(engine, scope, option78, buffer, "getBaseCssClasses", 71);
                if (commandRet80 && commandRet80.isBuffer) {
                    buffer = commandRet80;
                    commandRet80 = undefined;
                }
                buffer.write(commandRet80, true);
                buffer.write('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#">');
                var id81 = scope.resolve(["clearLabel"]);
                buffer.write(id81, true);
                buffer.write('</a>\r\n</div>\r\n');

                return buffer;
            };
            buffer = ifCommand.call(engine, scope, option65, buffer, 63, payload);
            return buffer;
        };
t.TPL_NAME = module.name;
return t;
});