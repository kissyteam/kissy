/**
 * @ignore
 * Set up editor constructor
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var HtmlParser = require('html-parser');
    var Control = require('component/control');
    var EditorRender = require('./render');
    /**
     * editor component for KISSY. xclass: 'editor'.
     * @class KISSY.Editor
     * @extends KISSY.Component.Control
     */
    return Control.extend({}, {
        Config: {},

        XHTML_DTD: HtmlParser.DTD,

        ATTRS: {

            /**
             * textarea
             * @type {KISSY.NodeList}
             */
            textarea: {},

            textareaAttrs: {
                view: 1
            },

            /**
             * iframe
             * @type {KISSY.NodeList}
             */
            iframe: {},

            /**
             * iframe 's contentWindow.
             * @type {KISSY.NodeList}
             */
            window: {
                // ie6 一旦中途设置了 domain
                // 那么就不能从 document getWindow 获取对应的 window
                // 所以一开始设置下，和 document 有一定的信息冗余
            },

            /**
             * iframe 's document
             * @type {KISSY.NodeList}
             */
            document: {},

            /**
             * toolbar element
             * @type {KISSY.NodeList}
             */
            toolBarEl: {},

            /**
             * status bar element
             * @type {KISSY.NodeList}
             */
            statusBarEl: {},

            handleMouseEvents: {
                value: false
            },

            focusable: {
                value: false
            },

            /**
             * editor mode.
             * wysiswyg mode:1
             * source mode:0
             * Defaults to: wysiswyg mode
             */
            mode: {
                view:1,
                value: 1
            },

            /**
             * Current editor's content
             * @type {String}
             */
            data: {
                view: 1
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
            },

            xrender: {
                value: EditorRender
            }
        },

        xclass: 'editor'
    });
});