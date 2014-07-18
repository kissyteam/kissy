/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
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
        var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
        var callFnUtil = utils['callFn'], callCommandUtil = utils['callCommand'], rangeCommand = nativeCommands['range'], eachCommand = nativeCommands['each'], withCommand = nativeCommands['with'], ifCommand = nativeCommands['if'], setCommand = nativeCommands['set'], includeCommand = nativeCommands['include'], parseCommand = nativeCommands['parse'], extendCommand = nativeCommands['extend'], blockCommand = nativeCommands['block'], macroCommand = nativeCommands['macro'], debuggerCommand = nativeCommands['debugger'];
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
        buffer.write('</div>', 0);
        return buffer;
    };
    module.exports.TPL_NAME = module.name;
});
