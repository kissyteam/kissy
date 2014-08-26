/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 26 16:05
*/
/*
combined modules:
date/picker-xtpl
*/
KISSY.add('date/picker-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function pickerXtpl(scope, buffer, undefined) {
        var tpl = this;
        var pos = tpl.pos = {
                line: 1,
                col: 1
            };
        var nativeCommands = tpl.root.nativeCommands;
        var utils = tpl.root.utils;
        var callFnUtil = utils['callFn'];
        var callCommandUtil = utils['callCommand'];
        var rangeCommand = nativeCommands['range'];
        var eachCommand = nativeCommands['each'];
        var withCommand = nativeCommands['with'];
        var ifCommand = nativeCommands['if'];
        var setCommand = nativeCommands['set'];
        var includeCommand = nativeCommands['include'];
        var parseCommand = nativeCommands['parse'];
        var extendCommand = nativeCommands['extend'];
        var blockCommand = nativeCommands['block'];
        var macroCommand = nativeCommands['macro'];
        var debuggerCommand = nativeCommands['debugger'];
        buffer.append('<div class="');
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var callRet2;
        pos.line = 1;
        pos.col = 33;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses']);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.writeEscaped(callRet2);
        buffer.append('">\r\n    <a class="');
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-year-btn');
        option3.params = params4;
        var callRet5;
        pos.line = 2;
        pos.col = 34;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses']);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.writeEscaped(callRet5);
        buffer.append('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
        var id6 = scope.resolve(['previousYearLabel']);
        buffer.writeEscaped(id6);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('prev-month-btn');
        option7.params = params8;
        var callRet9;
        pos.line = 9;
        pos.col = 34;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses']);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.writeEscaped(callRet9);
        buffer.append('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
        var id10 = scope.resolve(['previousMonthLabel']);
        buffer.writeEscaped(id10);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
        var option11 = { escape: 1 };
        var params12 = [];
        params12.push('month-select');
        option11.params = params12;
        var callRet13;
        pos.line = 16;
        pos.col = 34;
        callRet13 = callFnUtil(tpl, scope, option11, buffer, ['getBaseCssClasses']);
        if (callRet13 && callRet13.isBuffer) {
            buffer = callRet13;
            callRet13 = undefined;
        }
        buffer.writeEscaped(callRet13);
        buffer.append('"\r\n       role="button"\r\n       href="#"\r\n       tabindex="-1"\r\n       hidefocus="on"\r\n       title="');
        var id14 = scope.resolve(['monthSelectLabel']);
        buffer.writeEscaped(id14);
        buffer.append('">\r\n        <span class="');
        var option15 = { escape: 1 };
        var params16 = [];
        params16.push('month-select-content');
        option15.params = params16;
        var callRet17;
        pos.line = 22;
        pos.col = 41;
        callRet17 = callFnUtil(tpl, scope, option15, buffer, ['getBaseCssClasses']);
        if (callRet17 && callRet17.isBuffer) {
            buffer = callRet17;
            callRet17 = undefined;
        }
        buffer.writeEscaped(callRet17);
        buffer.append('">');
        var id18 = scope.resolve(['monthYearLabel']);
        buffer.writeEscaped(id18);
        buffer.append('</span>\r\n        <span class="');
        var option19 = { escape: 1 };
        var params20 = [];
        params20.push('month-select-arrow');
        option19.params = params20;
        var callRet21;
        pos.line = 23;
        pos.col = 41;
        callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses']);
        if (callRet21 && callRet21.isBuffer) {
            buffer = callRet21;
            callRet21 = undefined;
        }
        buffer.writeEscaped(callRet21);
        buffer.append('">x</span>\r\n    </a>\r\n    <a class="');
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('next-month-btn');
        option22.params = params23;
        var callRet24;
        pos.line = 25;
        pos.col = 34;
        callRet24 = callFnUtil(tpl, scope, option22, buffer, ['getBaseCssClasses']);
        if (callRet24 && callRet24.isBuffer) {
            buffer = callRet24;
            callRet24 = undefined;
        }
        buffer.writeEscaped(callRet24);
        buffer.append('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
        var id25 = scope.resolve(['nextMonthLabel']);
        buffer.writeEscaped(id25);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
        var option26 = { escape: 1 };
        var params27 = [];
        params27.push('next-year-btn');
        option26.params = params27;
        var callRet28;
        pos.line = 32;
        pos.col = 34;
        callRet28 = callFnUtil(tpl, scope, option26, buffer, ['getBaseCssClasses']);
        if (callRet28 && callRet28.isBuffer) {
            buffer = callRet28;
            callRet28 = undefined;
        }
        buffer.writeEscaped(callRet28);
        buffer.append('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
        var id29 = scope.resolve(['nextYearLabel']);
        buffer.writeEscaped(id29);
        buffer.append('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
        var option30 = { escape: 1 };
        var params31 = [];
        params31.push('body');
        option30.params = params31;
        var callRet32;
        pos.line = 40;
        pos.col = 32;
        callRet32 = callFnUtil(tpl, scope, option30, buffer, ['getBaseCssClasses']);
        if (callRet32 && callRet32.isBuffer) {
            buffer = callRet32;
            callRet32 = undefined;
        }
        buffer.writeEscaped(callRet32);
        buffer.append('">\r\n    <table class="');
        var option33 = { escape: 1 };
        var params34 = [];
        params34.push('table');
        option33.params = params34;
        var callRet35;
        pos.line = 41;
        pos.col = 38;
        callRet35 = callFnUtil(tpl, scope, option33, buffer, ['getBaseCssClasses']);
        if (callRet35 && callRet35.isBuffer) {
            buffer = callRet35;
            callRet35 = undefined;
        }
        buffer.writeEscaped(callRet35);
        buffer.append('" cellspacing="0" role="grid">\r\n        <thead>\r\n        <tr role="row">\r\n            ');
        var option36 = { escape: 1 };
        var params37 = [];
        var id38 = scope.resolve(['showWeekNumber']);
        params37.push(id38);
        option36.params = params37;
        option36.fn = function (scope, buffer) {
            buffer.append('\r\n            <th role="columnheader" class="');
            var option39 = { escape: 1 };
            var params40 = [];
            params40.push('column-header');
            option39.params = params40;
            var callRet41;
            pos.line = 45;
            pos.col = 63;
            callRet41 = callFnUtil(tpl, scope, option39, buffer, ['getBaseCssClasses']);
            if (callRet41 && callRet41.isBuffer) {
                buffer = callRet41;
                callRet41 = undefined;
            }
            buffer.writeEscaped(callRet41);
            buffer.append(' ');
            var option42 = { escape: 1 };
            var params43 = [];
            params43.push('week-number-header');
            option42.params = params43;
            var callRet44;
            pos.line = 45;
            pos.col = 103;
            callRet44 = callFnUtil(tpl, scope, option42, buffer, ['getBaseCssClasses']);
            if (callRet44 && callRet44.isBuffer) {
                buffer = callRet44;
                callRet44 = undefined;
            }
            buffer.writeEscaped(callRet44);
            buffer.append('">\r\n                <span class="');
            var option45 = { escape: 1 };
            var params46 = [];
            params46.push('column-header-inner');
            option45.params = params46;
            var callRet47;
            pos.line = 46;
            pos.col = 49;
            callRet47 = callFnUtil(tpl, scope, option45, buffer, ['getBaseCssClasses']);
            if (callRet47 && callRet47.isBuffer) {
                buffer = callRet47;
                callRet47 = undefined;
            }
            buffer.writeEscaped(callRet47);
            buffer.append('">x</span>\r\n            </th>\r\n            ');
            return buffer;
        };
        pos.line = 44;
        pos.col = 18;
        buffer = ifCommand.call(tpl, scope, option36, buffer);
        buffer.append('\r\n            ');
        var option48 = { escape: 1 };
        var params49 = [];
        var id50 = scope.resolve(['weekdays']);
        params49.push(id50);
        option48.params = params49;
        option48.fn = function (scope, buffer) {
            buffer.append('\r\n            <th role="columnheader" title="');
            var id51 = scope.resolve(['this']);
            buffer.writeEscaped(id51);
            buffer.append('" class="');
            var option52 = { escape: 1 };
            var params53 = [];
            params53.push('column-header');
            option52.params = params53;
            var callRet54;
            pos.line = 50;
            pos.col = 80;
            callRet54 = callFnUtil(tpl, scope, option52, buffer, ['getBaseCssClasses']);
            if (callRet54 && callRet54.isBuffer) {
                buffer = callRet54;
                callRet54 = undefined;
            }
            buffer.writeEscaped(callRet54);
            buffer.append('">\r\n                <span class="');
            var option55 = { escape: 1 };
            var params56 = [];
            params56.push('column-header-inner');
            option55.params = params56;
            var callRet57;
            pos.line = 51;
            pos.col = 49;
            callRet57 = callFnUtil(tpl, scope, option55, buffer, ['getBaseCssClasses']);
            if (callRet57 && callRet57.isBuffer) {
                buffer = callRet57;
                callRet57 = undefined;
            }
            buffer.writeEscaped(callRet57);
            buffer.append('">\r\n                    ');
            var id59 = scope.resolve(['xindex']);
            var id58 = scope.resolve([
                    'veryShortWeekdays',
                    id59
                ]);
            buffer.writeEscaped(id58);
            buffer.append('\r\n                </span>\r\n            </th>\r\n            ');
            return buffer;
        };
        pos.line = 49;
        pos.col = 20;
        buffer = eachCommand.call(tpl, scope, option48, buffer);
        buffer.append('\r\n        </tr>\r\n        </thead>\r\n        <tbody class="');
        var option60 = { escape: 1 };
        var params61 = [];
        params61.push('tbody');
        option60.params = params61;
        var callRet62;
        pos.line = 58;
        pos.col = 42;
        callRet62 = callFnUtil(tpl, scope, option60, buffer, ['getBaseCssClasses']);
        if (callRet62 && callRet62.isBuffer) {
            buffer = callRet62;
            callRet62 = undefined;
        }
        buffer.writeEscaped(callRet62);
        buffer.append('">\r\n        ');
        var option63 = {};
        var callRet64;
        pos.line = 59;
        pos.col = 22;
        callRet64 = callFnUtil(tpl, scope, option63, buffer, ['renderDates']);
        if (callRet64 && callRet64.isBuffer) {
            buffer = callRet64;
            callRet64 = undefined;
        }
        buffer.write(callRet64);
        buffer.append('\r\n        </tbody>\r\n    </table>\r\n</div>\r\n');
        var option65 = { escape: 1 };
        var params66 = [];
        var id67 = scope.resolve(['showToday']);
        var exp69 = id67;
        if (!exp69) {
            var id68 = scope.resolve(['showClear']);
            exp69 = id68;
        }
        params66.push(exp69);
        option65.params = params66;
        option65.fn = function (scope, buffer) {
            buffer.append('\r\n<div class="');
            var option70 = { escape: 1 };
            var params71 = [];
            params71.push('footer');
            option70.params = params71;
            var callRet72;
            pos.line = 64;
            pos.col = 32;
            callRet72 = callFnUtil(tpl, scope, option70, buffer, ['getBaseCssClasses']);
            if (callRet72 && callRet72.isBuffer) {
                buffer = callRet72;
                callRet72 = undefined;
            }
            buffer.writeEscaped(callRet72);
            buffer.append('">\r\n    <a class="');
            var option73 = { escape: 1 };
            var params74 = [];
            params74.push('today-btn');
            option73.params = params74;
            var callRet75;
            pos.line = 65;
            pos.col = 34;
            callRet75 = callFnUtil(tpl, scope, option73, buffer, ['getBaseCssClasses']);
            if (callRet75 && callRet75.isBuffer) {
                buffer = callRet75;
                callRet75 = undefined;
            }
            buffer.writeEscaped(callRet75);
            buffer.append('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#"\r\n       title="');
            var id76 = scope.resolve(['todayTimeLabel']);
            buffer.writeEscaped(id76);
            buffer.append('">');
            var id77 = scope.resolve(['todayLabel']);
            buffer.writeEscaped(id77);
            buffer.append('</a>\r\n    <a class="');
            var option78 = { escape: 1 };
            var params79 = [];
            params79.push('clear-btn');
            option78.params = params79;
            var callRet80;
            pos.line = 71;
            pos.col = 34;
            callRet80 = callFnUtil(tpl, scope, option78, buffer, ['getBaseCssClasses']);
            if (callRet80 && callRet80.isBuffer) {
                buffer = callRet80;
                callRet80 = undefined;
            }
            buffer.writeEscaped(callRet80);
            buffer.append('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#">');
            var id81 = scope.resolve(['clearLabel']);
            buffer.writeEscaped(id81);
            buffer.append('</a>\r\n</div>\r\n');
            return buffer;
        };
        pos.line = 63;
        pos.col = 6;
        buffer = ifCommand.call(tpl, scope, option65, buffer);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
