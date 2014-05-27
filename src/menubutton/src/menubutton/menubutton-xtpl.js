/** Compiled By kissy-xtemplate */
/*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
KISSY.add(function (S, require, exports, module) {
    var menubutton = function (scope, buffer, undefined) {
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="', 0);
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('content');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 0, 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.write(callRet2, true);
        buffer.write('">', 0);
        var id3 = scope.resolve(['content'], 0);
        buffer.write(id3, false);
        buffer.write('</div>\r\n<div class="', 0);
        var option4 = { escape: 1 };
        var params5 = [];
        params5.push('dropdown');
        option4.params = params5;
        var callRet6;
        callRet6 = callFnUtil(tpl, scope, option4, buffer, ['getBaseCssClasses'], 0, 2);
        if (callRet6 && callRet6.isBuffer) {
            buffer = callRet6;
            callRet6 = undefined;
        }
        buffer.write(callRet6, true);
        buffer.write('">\r\n    <div class="', 0);
        var option7 = { escape: 1 };
        var params8 = [];
        params8.push('dropdown-inner');
        option7.params = params8;
        var callRet9;
        callRet9 = callFnUtil(tpl, scope, option7, buffer, ['getBaseCssClasses'], 0, 3);
        if (callRet9 && callRet9.isBuffer) {
            buffer = callRet9;
            callRet9 = undefined;
        }
        buffer.write(callRet9, true);
        buffer.write('">\r\n    </div>\r\n</div>', 0);
        return buffer;
    };
    menubutton.TPL_NAME = module.name;
    menubutton.version = '5.0.0';
    return menubutton;
});