/**
 * @ignore
 * Set up editor constructor
 * @author yiminghe@gmail.com
 */

var util = require('util');
var UA = require('ua');
var HtmlParser = require('html-parser');
var Control = require('component/control');
var RenderTpl = require('./render-xtpl');
/**
 * editor component for KISSY. xclass: 'editor'.
 * @class KISSY.Editor
 * @extends KISSY.Component.Control
 */
module.exports = Control.extend({
    beforeCreateDom: function (renderData) {
        util.mix(renderData, {
            mobile: UA.mobile
        });
    }
}, {
    Config: {},

    XHTML_DTD: HtmlParser.DTD,

    ATTRS: {
        handleGestureEvents: {
            value: false
        },

        focusable: {
            value: false
        },

        allowTextSelection: {
            value: true
        },

        contentTpl: {
            value: RenderTpl
        },

        height: {
            value: 300
        },

        /**
         * textarea
         * @type {KISSY.Node}
         */
        textarea: {
            selector: function () {
                return '.' + this.getBaseCssClass('textarea');
            }
        },

        textareaAttrs: {
            render: 1,
            sync: 0
        },

        /**
         * iframe
         * @type {KISSY.Node}
         */
        iframe: {},

        /**
         * iframe 's contentWindow.
         * @type {KISSY.Node}
         */
        window: {
            // ie6 一旦中途设置了 domain
            // 那么就不能从 document getWindow 获取对应的 window
            // 所以一开始设置下，和 document 有一定的信息冗余
        },

        /**
         * iframe 's document
         * @type {KISSY.Node}
         */
        document: {},

        /**
         * toolbar element
         * @type {KISSY.Node}
         */
        toolBarEl: {
            selector: function () {
                return '.' + this.getBaseCssClass('tools');
            }
        },

        /**
         * status bar element
         * @type {KISSY.Node}
         */
        statusBarEl: {
            selector: function () {
                return '.' + this.getBaseCssClass('status');
            }
        },

        /**
         * editor mode.
         * wysiswyg mode:1
         * source mode:0
         * Defaults to: wysiswyg mode
         */
        mode: {
            render: 1,
            value: 1
        },

        /**
         * Current editor's content
         * @type {String}
         */
        data: {
            render: 1,
            sync: 0
        },

        /**
         * Custom style for editor.
         * @type {String}
         */
        customStyle: {
            value: ''
        },

        /**
         * Custom css link url for editor.
         * @type {String[]}
         */
        customLink: {
            value: []
        }
    },

    xclass: 'editor'
});