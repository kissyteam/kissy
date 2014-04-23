/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 23 11:59
*/
/*
combined modules:
date/popup-picker
date/popup-picker/render-xtpl
*/
/**
 * @ignore
 * popup date picker
 * @author yiminghe@gmail.com
 */
KISSY.add('date/popup-picker', [
    './popup-picker/render-xtpl',
    'date/picker',
    'component/extension/shim',
    'component/extension/align'
], function (S, require) {
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
    return DatePicker.extend([
        Shim,
        AlignExtension
    ], {}, {
        xclass: 'popup-date-picker',
        ATTRS: { contentTpl: { value: PopupPickerTpl } }
    });
});
/** Compiled By kissy-xtemplate */
KISSY.add('date/popup-picker/render-xtpl', ['date/picker-xtpl'], function (S, require, exports, module) {
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true*/
    var t = function (scope, buffer, payload, undefined) {
        var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
        if ('5.0.0' !== S.version) {
            throw new Error('current xtemplate file(' + engine.name + ')(v5.0.0) need to be recompiled using current kissy(v' + S.version + ')!');
        }
        var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands['debugger'];
        buffer.write('<div class="');
        var option0 = { escape: 1 };
        var params1 = [];
        params1.push('content');
        option0.params = params1;
        var commandRet2 = callCommandUtil(engine, scope, option0, buffer, 'getBaseCssClasses', 1);
        if (commandRet2 && commandRet2.isBuffer) {
            buffer = commandRet2;
            commandRet2 = undefined;
        }
        buffer.write(commandRet2, true);
        buffer.write('">\r\n    ');
        var option3 = {};
        var params4 = [];
        params4.push('date/picker-xtpl');
        option3.params = params4;
        require('date/picker-xtpl');
        option3.params[0] = module.resolve(option3.params[0]);
        var commandRet5 = includeCommand.call(engine, scope, option3, buffer, 2, payload);
        if (commandRet5 && commandRet5.isBuffer) {
            buffer = commandRet5;
            commandRet5 = undefined;
        }
        buffer.write(commandRet5, false);
        buffer.write('\r\n</div>');
        return buffer;
    };
    t.TPL_NAME = module.name;
    return t;
});



