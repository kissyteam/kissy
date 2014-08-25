/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 22 16:04
*/
/*
combined modules:
date/popup-picker
date/popup-picker/render-xtpl
*/
KISSY.add('date/popup-picker', [
    './popup-picker/render-xtpl',
    'date/picker',
    'component/extension/shim',
    'component/extension/align'
], function (S, require, exports, module) {
    /**
 * @ignore
 * popup date picker
 * @author yiminghe@gmail.com
 */
    var PopupPickerTpl = require('./popup-picker/render-xtpl'), DatePicker = require('date/picker'), Shim = require('component/extension/shim'), AlignExtension = require('component/extension/align');    /**
 * popup date picker ui component
 * @class KISSY.Date.PopupPicker
 * @extends KISSY.Component.Control
 * @mixins KISSY.Component.Extension.Shim
 * @mixins KISSY.Component.Extension.Align
 */
    /**
 * popup date picker ui component
 * @class KISSY.Date.PopupPicker
 * @extends KISSY.Component.Control
 * @mixins KISSY.Component.Extension.Shim
 * @mixins KISSY.Component.Extension.Align
 */
    module.exports = DatePicker.extend([
        Shim,
        AlignExtension
    ], {}, {
        xclass: 'popup-date-picker',
        ATTRS: { contentTpl: { value: PopupPickerTpl } }
    });
});
KISSY.add('date/popup-picker/render-xtpl', ['date/picker-xtpl'], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function renderXtpl(scope, buffer, undefined) {
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
        params1.push('content');
        option0.params = params1;
        var callRet2;
        callRet2 = callFnUtil(tpl, scope, option0, buffer, ['getBaseCssClasses'], 1);
        if (callRet2 && callRet2.isBuffer) {
            buffer = callRet2;
            callRet2 = undefined;
        }
        buffer.writeEscaped(callRet2);
        buffer.write('">\r\n    ');
        var option3 = {};
        var params4 = [];
        params4.push('date/picker-xtpl');
        option3.params = params4;
        require('date/picker-xtpl');
        var callRet5;
        callRet5 = includeCommand.call(tpl, scope, option3, buffer, 2);
        if (callRet5 && callRet5.isBuffer) {
            buffer = callRet5;
            callRet5 = undefined;
        }
        buffer.write(callRet5);
        buffer.write('\r\n</div>');
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});



