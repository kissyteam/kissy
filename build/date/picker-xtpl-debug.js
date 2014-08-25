/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 22 16:03
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
        buffer.write('<div class="');
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('header');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.writeEscaped(callRet2);
        buffer.write('">\r\n    <a class="');
        var option3 = { escape: 1 };
        var params4 = [];
        params4.push('prev-year-btn');
        option3.params = params4;
        var callRet5;
        callRet5 = callFnUtil(tpl, scope, option3, buffer, ['getBaseCssClasses'], 2);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.writeEscaped(callRet5);
        buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
        var id6 = scope.resolve(['previousYearLabel']);
        buffer.writeEscaped(id6);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('prev-month-btn');
        option7.params = params8;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 9);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.writeEscaped(callRet9);
        buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
        var id10 = scope.resolve(['previousMonthLabel']);
        buffer.writeEscaped(id10);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
        var option11 = { escape: 1 };
        var params12 = [];
        params12.push('month-select');
        option11.params = params12;
        var callRet13;
        callRet13 = callFnUtil(tpl, scope, option11, buffer, ['getBaseCssClasses'], 16);
        if (callRet13 && callRet13.isBuffer) {
            buffer = callRet13;
            callRet13 = undefined;
        }
        buffer.writeEscaped(callRet13);
        buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       tabindex="-1"\r\n       hidefocus="on"\r\n       title="');
        var id14 = scope.resolve(['monthSelectLabel']);
        buffer.writeEscaped(id14);
        buffer.write('">\r\n        <span class="');
        var option15 = { escape: 1 };
        var params16 = [];
        params16.push('month-select-content');
        option15.params = params16;
        var callRet17;
        callRet17 = callFnUtil(tpl, scope, option15, buffer, ['getBaseCssClasses'], 22);
        if (callRet17 && callRet17.isBuffer) {
            buffer = callRet17;
            callRet17 = undefined;
        }
        buffer.writeEscaped(callRet17);
        buffer.write('">');
        var id18 = scope.resolve(['monthYearLabel']);
        buffer.writeEscaped(id18);
        buffer.write('</span>\r\n        <span class="');
        var option19 = { escape: 1 };
        var params20 = [];
        params20.push('month-select-arrow');
        option19.params = params20;
        var callRet21;
        callRet21 = callFnUtil(tpl, scope, option19, buffer, ['getBaseCssClasses'], 23);
        if (callRet21 && callRet21.isBuffer) {
            buffer = callRet21;
            callRet21 = undefined;
        }
        buffer.writeEscaped(callRet21);
        buffer.write('">x</span>\r\n    </a>\r\n    <a class="');
        var option22 = { escape: 1 };
        var params23 = [];
        params23.push('next-month-btn');
        option22.params = params23;
        var callRet24;
        callRet24 = callFnUtil(tpl, scope, option22, buffer, ['getBaseCssClasses'], 25);
        if (callRet24 && callRet24.isBuffer) {
            buffer = callRet24;
            callRet24 = undefined;
        }
        buffer.writeEscaped(callRet24);
        buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
        var id25 = scope.resolve(['nextMonthLabel']);
        buffer.writeEscaped(id25);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n    <a class="');
        var option26 = { escape: 1 };
        var params27 = [];
        params27.push('next-year-btn');
        option26.params = params27;
        var callRet28;
        callRet28 = callFnUtil(tpl, scope, option26, buffer, ['getBaseCssClasses'], 32);
        if (callRet28 && callRet28.isBuffer) {
            buffer = callRet28;
            callRet28 = undefined;
        }
        buffer.writeEscaped(callRet28);
        buffer.write('"\r\n       href="#"\r\n       tabindex="-1"\r\n       role="button"\r\n       title="');
        var id29 = scope.resolve(['nextYearLabel']);
        buffer.writeEscaped(id29);
        buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="');
        var option30 = { escape: 1 };
        var params31 = [];
        params31.push('body');
        option30.params = params31;
        var callRet32;
        callRet32 = callFnUtil(tpl, scope, option30, buffer, ['getBaseCssClasses'], 40);
        if (callRet32 && callRet32.isBuffer) {
            buffer = callRet32;
            callRet32 = undefined;
        }
        buffer.writeEscaped(callRet32);
        buffer.write('">\r\n    <table class="');
        var option33 = { escape: 1 };
        var params34 = [];
        params34.push('table');
        option33.params = params34;
        var callRet35;
        callRet35 = callFnUtil(tpl, scope, option33, buffer, ['getBaseCssClasses'], 41);
        if (callRet35 && callRet35.isBuffer) {
            buffer = callRet35;
            callRet35 = undefined;
        }
        buffer.writeEscaped(callRet35);
        buffer.write('" cellspacing="0" role="grid">\r\n        <thead>\r\n        <tr role="row">\r\n            ');
        var option36 = { escape: 1 };
        var params37 = [];
        var id38 = scope.resolve(['showWeekNumber']);
        params37.push(id38);
        option36.params = params37;
        option36.fn = function (scope, buffer) {
            buffer.write('\r\n            <th role="columnheader" class="');
            var option39 = { escape: 1 };
            var params40 = [];
            params40.push('column-header');
            option39.params = params40;
            var callRet41;
            callRet41 = callFnUtil(tpl, scope, option39, buffer, ['getBaseCssClasses'], 45);
            if (callRet41 && callRet41.isBuffer) {
                buffer = callRet41;
                callRet41 = undefined;
            }
            buffer.writeEscaped(callRet41);
            buffer.write(' ');
            var option42 = { escape: 1 };
            var params43 = [];
            params43.push('week-number-header');
            option42.params = params43;
            var callRet44;
            callRet44 = callFnUtil(tpl, scope, option42, buffer, ['getBaseCssClasses'], 45);
            if (callRet44 && callRet44.isBuffer) {
                buffer = callRet44;
                callRet44 = undefined;
            }
            buffer.writeEscaped(callRet44);
            buffer.write('">\r\n                <span class="');
            var option45 = { escape: 1 };
            var params46 = [];
            params46.push('column-header-inner');
            option45.params = params46;
            var callRet47;
            callRet47 = callFnUtil(tpl, scope, option45, buffer, ['getBaseCssClasses'], 46);
            if (callRet47 && callRet47.isBuffer) {
                buffer = callRet47;
                callRet47 = undefined;
            }
            buffer.writeEscaped(callRet47);
            buffer.write('">x</span>\r\n            </th>\r\n            ');
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option36, buffer, 44);
        buffer.write('\r\n            ');
        var option48 = { escape: 1 };
        var params49 = [];
        var id50 = scope.resolve(['weekdays']);
        params49.push(id50);
        option48.params = params49;
        option48.fn = function (scope, buffer) {
            buffer.write('\r\n            <th role="columnheader" title="');
            var id51 = scope.resolve(['this']);
            buffer.writeEscaped(id51);
            buffer.write('" class="');
            var option52 = { escape: 1 };
            var params53 = [];
            params53.push('column-header');
            option52.params = params53;
            var callRet54;
            callRet54 = callFnUtil(tpl, scope, option52, buffer, ['getBaseCssClasses'], 50);
            if (callRet54 && callRet54.isBuffer) {
                buffer = callRet54;
                callRet54 = undefined;
            }
            buffer.writeEscaped(callRet54);
            buffer.write('">\r\n                <span class="');
            var option55 = { escape: 1 };
            var params56 = [];
            params56.push('column-header-inner');
            option55.params = params56;
            var callRet57;
            callRet57 = callFnUtil(tpl, scope, option55, buffer, ['getBaseCssClasses'], 51);
            if (callRet57 && callRet57.isBuffer) {
                buffer = callRet57;
                callRet57 = undefined;
            }
            buffer.writeEscaped(callRet57);
            buffer.write('">\r\n                    ');
            var id59 = scope.resolve(['xindex']);
            var id58 = scope.resolve([
                    'veryShortWeekdays',
                    id59
                ]);
            buffer.writeEscaped(id58);
            buffer.write('\r\n                </span>\r\n            </th>\r\n            ');
            return buffer;
        };
        buffer = eachCommand.call(tpl, scope, option48, buffer, 49);
        buffer.write('\r\n        </tr>\r\n        </thead>\r\n        <tbody class="');
        var option60 = { escape: 1 };
        var params61 = [];
        params61.push('tbody');
        option60.params = params61;
        var callRet62;
        callRet62 = callFnUtil(tpl, scope, option60, buffer, ['getBaseCssClasses'], 58);
        if (callRet62 && callRet62.isBuffer) {
            buffer = callRet62;
            callRet62 = undefined;
        }
        buffer.writeEscaped(callRet62);
        buffer.write('">\r\n        ');
        var option63 = {};
        var callRet64;
        callRet64 = callFnUtil(tpl, scope, option63, buffer, ['renderDates'], 59);
        if (callRet64 && callRet64.isBuffer) {
            buffer = callRet64;
            callRet64 = undefined;
        }
        buffer.write(callRet64);
        buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>\r\n');
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
            buffer.write('\r\n<div class="');
            var option70 = { escape: 1 };
            var params71 = [];
            params71.push('footer');
            option70.params = params71;
            var callRet72;
            callRet72 = callFnUtil(tpl, scope, option70, buffer, ['getBaseCssClasses'], 64);
            if (callRet72 && callRet72.isBuffer) {
                buffer = callRet72;
                callRet72 = undefined;
            }
            buffer.writeEscaped(callRet72);
            buffer.write('">\r\n    <a class="');
            var option73 = { escape: 1 };
            var params74 = [];
            params74.push('today-btn');
            option73.params = params74;
            var callRet75;
            callRet75 = callFnUtil(tpl, scope, option73, buffer, ['getBaseCssClasses'], 65);
            if (callRet75 && callRet75.isBuffer) {
                buffer = callRet75;
                callRet75 = undefined;
            }
            buffer.writeEscaped(callRet75);
            buffer.write('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#"\r\n       title="');
            var id76 = scope.resolve(['todayTimeLabel']);
            buffer.writeEscaped(id76);
            buffer.write('">');
            var id77 = scope.resolve(['todayLabel']);
            buffer.writeEscaped(id77);
            buffer.write('</a>\r\n    <a class="');
            var option78 = { escape: 1 };
            var params79 = [];
            params79.push('clear-btn');
            option78.params = params79;
            var callRet80;
            callRet80 = callFnUtil(tpl, scope, option78, buffer, ['getBaseCssClasses'], 71);
            if (callRet80 && callRet80.isBuffer) {
                buffer = callRet80;
                callRet80 = undefined;
            }
            buffer.writeEscaped(callRet80);
            buffer.write('"\r\n       role="button"\r\n       hidefocus="on"\r\n       tabindex="-1"\r\n       href="#">');
            var id81 = scope.resolve(['clearLabel']);
            buffer.writeEscaped(id81);
            buffer.write('</a>\r\n</div>\r\n');
            return buffer;
        };
        buffer = ifCommand.call(tpl, scope, option65, buffer, 63);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
