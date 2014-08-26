/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 26 16:04
*/
/*
combined modules:
component/extension/content-box
component/extension/content-box/content-xtpl
*/
KISSY.add('component/extension/content-box', ['./content-box/content-xtpl'], function (S, require, exports, module) {
    /**
 * @ignore
 * common content box render
 * @author yiminghe@gmail.com
 */
    function shortcut(self) {
        var contentEl = self.get('contentEl');
        self.$contentEl = self.$contentEl = contentEl;
        self.contentEl = self.contentEl = contentEl[0];
    }
    var contentTpl = require('./content-box/content-xtpl');    /**
 * content-render extension for component system
 * @class KISSY.Component.Extension.ContentBox
 */
    /**
 * content-render extension for component system
 * @class KISSY.Component.Extension.ContentBox
 */
    function ContentBox() {
    }
    ContentBox.prototype = {
        __createDom: function () {
            shortcut(this);
        },
        __decorateDom: function () {
            shortcut(this);
        },
        getChildrenContainerEl: function () {
            // can not use $contentEl, maybe called by decorateDom method
            return this.get('contentEl');
        },
        _onSetContent: function (v) {
            var contentEl = this.$contentEl;
            contentEl.html(v);    // ie needs to set unselectable attribute recursively
            // ie needs to set unselectable attribute recursively
            if (!this.get('allowTextSelection')) {
                contentEl.unselectable();
            }
        }
    };
    ContentBox.ATTRS = {
        contentTpl: { value: contentTpl },
        contentEl: {
            selector: function () {
                return '.' + this.getBaseCssClass('content');
            }
        },
        content: {
            parse: function () {
                return this.get('contentEl').html();
            }
        }
    };
    module.exports = ContentBox;
});
KISSY.add('component/extension/content-box/content-xtpl', [], function (S, require, exports, module) {
    /* Compiled By XTemplate */
    /*jshint quotmark:false, loopfunc:true, indent:false, asi:true, unused:false, boss:true, sub:true*/
    module.exports = function contentXtpl(scope, buffer, undefined) {
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
        params1.push('content');
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
        buffer.append('">');
        var id3 = scope.resolve(['content']);
        buffer.write(id3);
        buffer.append('</div>');
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
