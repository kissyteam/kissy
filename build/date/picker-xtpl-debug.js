/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:54
*/
/*
combined modules:
date/picker-xtpl
*/
KISSY.add('date/picker-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function pickerXtpl(scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">\r\n    <a class="', 0);
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-year-btn');
        option3.params = params4;
        var callRet5;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses'], 0, 2);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.write(callRet5, true);
        buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="', 0);
        var id6 = scope.resolve(['previousYearLabel'], 0);
        buffer.write(id6, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="', 0);
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('prev-month-btn');
        option7.params = params8;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 0, 9);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.write(callRet9, true);
        buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="', 0);
        var id10 = scope.resolve(['previousMonthLabel'], 0);
        buffer.write(id10, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="', 0);
        var option11 = { escape: 1 };
        var params12 = [];
        params12.push('month-select');
        option11.params = params12;
        var callRet13;
        callRet13 = callFnUtil(tpl, scope, option11, buffer, ['getBaseCssClasses'], 0, 16);
        if (callRet13 && callRet13.isBuffer) {
            buffer = callRet13;
            callRet13 = undefined;
        }
        buffer.write(callRet13, true);
        buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       tabindex="-1"\r\n       hidefocus="on"\r\n       title="', 0);
        var id14 = scope.resolve(['monthSelectLabel'], 0);
        buffer.write(id14, true);
        buffer.write('">\r\n        <span class="', 0);
        var option15 = { escape: 1 };
        var params16 = [];
        params16.push('month-select-content');
        option15.params = params16;
        var callRet17;
        callRet17 = callFnUtil(tpl, scope, option15, buffer, ['getBaseCssClasses'], 0, 22);
        if (callRet17 && callRet17.isBuffer) {
            buffer = callRet17;
            callRet17 = undefined;
        }
        buffer.write(callRet17, true);
        buffer.write('">', 0);
        var id18 = scope.resolve(['monthYearLabel'], 0);
        buffer.write(id18, true);
        buffer.write('</span>\r\n        <span class="', 0);
        var option19 = { escape: 1 };
        var params20 = [];
        params20.push('month-select-arrow');
        option19.params = params20;
        var callRet21;
        callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses'], 0, 23);
        if (callRet21 && callRet21.isBuffer) {
            buffer = callRet21;
            callRet21 = undefined;
        }
        buffer.write(callRet21, true);
        buffer.write('">x</span>\r\n    </a>\r\n    <a class="', 0);
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('next-month-btn');
        option22.params = params23;
        var callRet24;
        callRet24 = callFnUtil(tpl, scope, option22, buffer, ['getBaseCssClasses'], 0, 25);
        if (callRet24 && callRet24.isBuffer) {
            buffer = callRet24;
            callRet24 = undefined;
        }
        buffer.write(callRet24, true);
        buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="', 0);
        var id25 = scope.resolve(['nextMonthLabel'], 0);
        buffer.write(id25, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="', 0);
        var option26 = { escape: 1 };
        var params27 = [];
        params27.push('next-year-btn');
        option26.params = params27;
        var callRet28;
        callRet28 = callFnUtil(tpl, scope, option26, buffer, ['getBaseCssClasses'], 0, 32);
        if (callRet28 && callRet28.isBuffer) {
            buffer = callRet28;
            callRet28 = undefined;
        }
        buffer.write(callRet28, true);
        buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="', 0);
        var id29 = scope.resolve(['nextYearLabel'], 0);
        buffer.write(id29, true);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
        var option30 = { escape: 1 };
        var params31 = [];
        params31.push('body');
        option30.params = params31;
        var callRet32;
        callRet32 = callFnUtil(tpl, scope, option30, buffer, ['getBaseCssClasses'], 0, 40);
        if (callRet32 && callRet32.isBuffer) {
            buffer = callRet32;
            callRet32 = undefined;
        }
        buffer.write(callRet32, true);
        buffer.write('">\r\n    <table class="', 0);
        var option33 = { escape: 1 };
        var params34 = [];
        params34.push('table');
        option33.params = params34;
        var callRet35;
        callRet35 = callFnUtil(tpl, scope, option33, buffer, ['getBaseCssClasses'], 0, 41);
        if (callRet35 && callRet35.isBuffer) {
            buffer = callRet35;
            callRet35 = undefined;
        }
        buffer.write(callRet35, true);
        buffer.write('" cellspacing="0" role="grid">\r\n        <thead>\r\n        <tr role="row">\r\n            ', 0);
        var option36 = { escape: 1 };
        var params37 = [];
        var id38 = scope.resolve(['showWeekNumber'], 0);
        params37.push(id38);
        option36.params = params37;
        option36.fn = function (scope, buffer) {
            buffer.write('\r\n            <th role="columnheader" class="', 0);
            var option39 = { escape: 1 };
            var params40 = [];
            params40.push('column-header');
            option39.params = params40;
            var callRet41;
            callRet41 = callFnUtil(tpl, scope, option39, buffer, ['getBaseCssClasses'], 0, 45);
            if (callRet41 && callRet41.isBuffer) {
                buffer = callRet41;
                callRet41 = undefined;
            }
            buffer.write(callRet41, true);
            buffer.write(' ', 0);
            var option42 = { escape: 1 };
            var params43 = [];
            params43.push('week-number-header');
            option42.params = params43;
            var callRet44;
            callRet44 = callFnUtil(tpl, scope, option42, buffer, ['getBaseCssClasses'], 0, 45);
            if (callRet44 && callRet44.isBuffer) {
                buffer = callRet44;
                callRet44 = undefined;
            }
            buffer.write(callRet44, true);
            buffer.write('">\r\n                <span class="', 0);
            var option45 = { escape: 1 };
            var params46 = [];
            params46.push('column-header-inner');
            option45.params = params46;
            var callRet47;
            callRet47 = callFnUtil(tpl, scope, option45, buffer, ['getBaseCssClasses'], 0, 46);
            if (callRet47 && callRet47.isBuffer) {
                buffer = callRet47;
                callRet47 = undefined;
            }
            buffer.write(callRet47, true);
            buffer.write('">x</span>\r\n            </th>\r\n            ', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option36, buffer, 44);
        buffer.write('\r\n            ', 0);
        var option48 = { escape: 1 };
        var params49 = [];
        var id50 = scope.resolve(['weekdays'], 0);
        params49.push(id50);
        option48.params = params49;
        option48.fn = function (scope, buffer) {
            buffer.write('\r\n            <th role="columnheader" title="', 0);
            var id51 = scope.resolve(['this'], 0);
            buffer.write(id51, true);
            buffer.write('" class="', 0);
            var option52 = { escape: 1 };
            var params53 = [];
            params53.push('column-header');
            option52.params = params53;
            var callRet54;
            callRet54 = callFnUtil(tpl, scope, option52, buffer, ['getBaseCssClasses'], 0, 50);
            if (callRet54 && callRet54.isBuffer) {
                buffer = callRet54;
                callRet54 = undefined;
            }
            buffer.write(callRet54, true);
            buffer.write('">\r\n                <span class="', 0);
            var option55 = { escape: 1 };
            var params56 = [];
            params56.push('column-header-inner');
            option55.params = params56;
            var callRet57;
            callRet57 = callFnUtil(tpl, scope, option55, buffer, ['getBaseCssClasses'], 0, 51);
            if (callRet57 && callRet57.isBuffer) {
                buffer = callRet57;
                callRet57 = undefined;
            }
            buffer.write(callRet57, true);
            buffer.write('">\r\n                    ', 0);
            var id59 = scope.resolve(['xindex'], 0);
            var id58 = scope.resolve([
                    'veryShortWeekdays',
                    id59
                ], 0);
            buffer.write(id58, true);
            buffer.write('\r\n                </span>\r\n            </th>\r\n            ', 0);
            return buffer;
        };
        buffer = eachCommand.call(tpl, scope, option48, buffer, 49);
        buffer.write('\r\n        </tr>\r\n        </thead>\r\n        <tbody class="', 0);
        var option60 = { escape: 1 };
        var params61 = [];
        params61.push('tbody');
        option60.params = params61;
        var callRet62;
        callRet62 = callFnUtil(tpl, scope, option60, buffer, ['getBaseCssClasses'], 0, 58);
        if (callRet62 && callRet62.isBuffer) {
            buffer = callRet62;
            callRet62 = undefined;
        }
        buffer.write(callRet62, true);
        buffer.write('">\r\n        ', 0);
        var option63 = {};
        var callRet64;
        callRet64 = callFnUtil(tpl, scope, option63, buffer, ['renderDates'], 0, 59);
        if (callRet64 && callRet64.isBuffer) {
            buffer = callRet64;
            callRet64 = undefined;
        }
        buffer.write(callRet64, false);
        buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>\r\n', 0);
        var option65 = { escape: 1 };
        var params66 = [];
        var id67 = scope.resolve(['showToday'], 0);
        var exp69 = id67;
        if (!id67) {
            var id68 = scope.resolve(['showClear'], 0);
            exp69 = id68;
        }
        params66.push(exp69);
        option65.params = params66;
        option65.fn = function (scope, buffer) {
            buffer.write('\r\n<div class="', 0);
            var option70 = { escape: 1 };
            var params71 = [];
            params71.push('footer');
            option70.params = params71;
            var callRet72;
            callRet72 = callFnUtil(tpl, scope, option70, buffer, ['getBaseCssClasses'], 0, 64);
            if (callRet72 && callRet72.isBuffer) {
                buffer = callRet72;
                callRet72 = undefined;
            }
            buffer.write(callRet72, true);
            buffer.write('">\r\n    <a class="', 0);
            var option73 = { escape: 1 };
            var params74 = [];
            params74.push('today-btn');
            option73.params = params74;
            var callRet75;
            callRet75 = callFnUtil(tpl, scope, option73, buffer, ['getBaseCssClasses'], 0, 65);
            if (callRet75 && callRet75.isBuffer) {
                buffer = callRet75;
                callRet75 = undefined;
            }
            buffer.write(callRet75, true);
            buffer.write('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#"\r\n       title="', 0);
            var id76 = scope.resolve(['todayTimeLabel'], 0);
            buffer.write(id76, true);
            buffer.write('">', 0);
            var id77 = scope.resolve(['todayLabel'], 0);
            buffer.write(id77, true);
            buffer.write('</a>\r\n    <a class="', 0);
            var option78 = { escape: 1 };
            var params79 = [];
            params79.push('clear-btn');
            option78.params = params79;
            var callRet80;
            callRet80 = callFnUtil(tpl, scope, option78, buffer, ['getBaseCssClasses'], 0, 71);
            if (callRet80 && callRet80.isBuffer) {
                buffer = callRet80;
                callRet80 = undefined;
            }
            buffer.write(callRet80, true);
            buffer.write('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#">', 0);
            var id81 = scope.resolve(['clearLabel'], 0);
            buffer.write(id81, true);
            buffer.write('</a>\r\n</div>\r\n', 0);
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option65, buffer, 63);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
